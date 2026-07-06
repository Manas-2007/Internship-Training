const { Agenda } = require('agenda');
const { sendPushNotification } = require('./expoService');
const User = require('../models/User'); // Required to remove invalid tokens

const agenda = new Agenda({ 
    db: { 
        address: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myntra_db', 
        collection: 'notificationQueue' 
    },
    processEvery: '30 seconds',
    maxConcurrency: 10
});

agenda.define('send push notification', async (job) => {
    const { pushToken, title, body, data, retries = 0 } = job.attrs.data;

    try {
        await sendPushNotification(pushToken, title, body, data);
    } catch (error) {
        console.error(`❌ Notification Failed for ${pushToken}:`, error.message);
        
        // Check if the error indicates that the Expo Push Token is no longer valid
        const isTokenInvalid = error.message.includes('DeviceNotRegistered') || 
                               error.message.includes('notRegistered') ||
                               error.message.includes('ExpoPushToken');

        if (isTokenInvalid) {
            console.log(`🧹 Removing invalid push token from database: ${pushToken}`);
            try {
                // Remove the expired token from the user document
                await User.updateMany(
                    { pushToken: pushToken },
                    { $unset: { pushToken: "" } }
                );
            } catch (dbError) {
                console.error("Failed to remove invalid token from database:", dbError);
            }
            return; // Terminate early so it does not schedule a retry for a dead token
        }
 
        // For temporary network/server errors, proceed with the retry logic
        if (retries < 3) {
            job.attrs.data.retries = retries + 1;
            job.schedule('in 5 minutes');
            await job.save();
        } else {
            console.log(`🚨 Max retries reached for ${pushToken}.`);
        }
    }
});

const startQueue = async () => {
    await agenda.start();
    console.log("✅ Queue started!");
};

const enqueueRealTimeNotification = async (pushToken, title, body, data = {}) => {
    await agenda.now('send push notification', { pushToken, title, body, data });
};

const scheduleDelayedNotification = async (delay, pushToken, title, body, data = {}) => {
    await agenda.schedule(delay, 'send push notification', { pushToken, title, body, data });
};

module.exports = { startQueue, enqueueRealTimeNotification, scheduleDelayedNotification };