const { Agenda } = require('agenda');
const mongoose = require('mongoose');
const { sendPushNotification } = require('./expoService');
const User = require('../models/User');
const agenda = new Agenda({ 
    db: { 
        address: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myntra_db', 
        collection: 'notificationQueue' 
    },
    processEvery: '30 seconds',
    maxConcurrency: 10
});

const checkRateLimit = async (pushToken) => {
    const db = mongoose.connection.db;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const count = await db.collection('push_rate_limits').countDocuments({
        pushToken,
        sentAt: { $gte: twentyFourHoursAgo }
    });

    return count < 3; 
};

agenda.define('send push notification', async (job) => {
    const { pushToken, title, body, data, retries = 0, type = 'TRANSACTIONAL' } = job.attrs.data;

    try {
        if (type !== 'TRANSACTIONAL') {
            const isAllowed = await checkRateLimit(pushToken);
            if (!isAllowed) return; 
        }

        await sendPushNotification(pushToken, title, body, data);
        if (type !== 'TRANSACTIONAL') {
            const db = mongoose.connection.db;
            await db.collection('push_rate_limits').insertOne({ 
                pushToken, 
                sentAt: new Date() 
            });
        }
    } catch (error) {
        const isTokenInvalid = error.message.includes('DeviceNotRegistered') || 
                               error.message.includes('notRegistered') ||
                               error.message.includes('ExpoPushToken');

        if (isTokenInvalid) {
            try {
                await User.updateMany(
                    { pushToken: pushToken },
                    { $unset: { pushToken: "" } }
                );
            } catch (dbError) {}
            return; 
        }
        if (retries < 3) {
            job.attrs.data.retries = retries + 1;
            job.schedule('in 5 minutes');
            await job.save();
        }
    }
});

const startQueue = async () => {
    await agenda.start();
};

const enqueueRealTimeNotification = async (pushToken, title, body, data = {}) => {
    await agenda.now('send push notification', { pushToken, title, body, data, type: 'TRANSACTIONAL' });
};

const scheduleDelayedNotification = async (delay, pushToken, title, body, data = {}) => {
    await agenda.schedule(delay, 'send push notification', { pushToken, title, body, data, type: 'PROMOTIONAL' });
};

module.exports = { startQueue, enqueueRealTimeNotification, scheduleDelayedNotification };