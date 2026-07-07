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

// 👉 RATE LIMITER HELPER FUNCTION
const checkRateLimit = async (pushToken) => {
    const db = mongoose.connection.db;
    const now = new Date();
    // 24 hours ki window check kar rahe hain
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // MongoDB ke native collection se count nikalna (No extra schema needed)
    const count = await db.collection('push_rate_limits').countDocuments({
        pushToken,
        sentAt: { $gte: twentyFourHoursAgo }
    });

    // LIMIT: Ek din mein max 3 promotional/scheduled notifications
    return count < 3; 
};

agenda.define('send push notification', async (job) => {
    // 👉 Added 'type' to differentiate between TRANSACTIONAL and PROMOTIONAL
    const { pushToken, title, body, data, retries = 0, type = 'TRANSACTIONAL' } = job.attrs.data;

    try {
        // 👉 RATE LIMITING LOGIC (Only apply to non-transactional alerts)
        if (type !== 'TRANSACTIONAL') {
            const isAllowed = await checkRateLimit(pushToken);
            if (!isAllowed) {
                console.log(`🛑 Rate limit exceeded for ${pushToken}. Notification skipped.`);
                return; // Silently skip to prevent spam
            }
        }

        // 1. Send the actual push notification
        await sendPushNotification(pushToken, title, body, data);

        // 2. Log the successful delivery for rate limiting (if promotional)
        if (type !== 'TRANSACTIONAL') {
            const db = mongoose.connection.db;
            await db.collection('push_rate_limits').insertOne({ 
                pushToken, 
                sentAt: new Date() 
            });
        }

    } catch (error) {
        console.error(`❌ Notification Failed for ${pushToken}:`, error.message);
        
        // 👉 3. AUTOMATIC INVALID TOKEN CLEANUP
        const isTokenInvalid = error.message.includes('DeviceNotRegistered') || 
                               error.message.includes('notRegistered') ||
                               error.message.includes('ExpoPushToken');

        if (isTokenInvalid) {
            console.log(`🧹 Removing invalid push token from database: ${pushToken}`);
            try {
                await User.updateMany(
                    { pushToken: pushToken },
                    { $unset: { pushToken: "" } }
                );
            } catch (dbError) {
                console.error("Failed to remove invalid token from database:", dbError);
            }
            return; // Terminate early
        }
 
        // 👉 4. RETRY MECHANISM (For temporary network errors)
        if (retries < 3) {
            job.attrs.data.retries = retries + 1;
            job.schedule('in 5 minutes');
            await job.save();
            console.log(`⏳ Scheduled retry ${retries + 1} for ${pushToken}`);
        } else {
            console.log(`🚨 Max retries reached for ${pushToken}. Dropping notification.`);
        }
    }
});

const startQueue = async () => {
    await agenda.start();
    console.log("✅ Background Job Queue & Rate Limiting started!");
};

// ⚡ For instant alerts (Order placed, Shipped) - Bypasses Rate Limiter
const enqueueRealTimeNotification = async (pushToken, title, body, data = {}) => {
    await agenda.now('send push notification', { pushToken, title, body, data, type: 'TRANSACTIONAL' });
};

// 🕒 For delayed alerts (Cart abandonment, Sales) - Checked by Rate Limiter
const scheduleDelayedNotification = async (delay, pushToken, title, body, data = {}) => {
    await agenda.schedule(delay, 'send push notification', { pushToken, title, body, data, type: 'PROMOTIONAL' });
};

module.exports = { startQueue, enqueueRealTimeNotification, scheduleDelayedNotification };