const Agenda = require('agenda');
const { sendPushNotification } = require('./expoService');

// 👉 MongoDB URI dhyan se check kar lena (Apni .env ya default mongodb string use karo)
const mongoConnectionString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myntra_db';

const agenda = new Agenda({ 
    db: { address: mongoConnectionString, collection: 'notificationQueue' },
    processEvery: '30 seconds', // Har 30 second mein check karega ki koi scheduled message bhejna hai kya
    maxConcurrency: 10 // Rate limiting: Ek sath 10 se zyada process nahi karega (taaki server slow na ho)
});

// 👉 1. Job Define Karna (Yeh actual worker hai jo message bhejega)
agenda.define('send push notification', async (job) => {
    const { pushToken, title, body, data, retries = 0 } = job.attrs.data;

    try {
        await sendPushNotification(pushToken, title, body, data);
        // Agar chal gaya toh job delete ho jayegi automatically
    } catch (error) {
        console.error(`❌ Notification Failed for ${pushToken}`);
        
        // 👉 Retry Mechanism (Max 3 retries)
        if (retries < 3) {
            console.log(`🔄 Retrying... Attempt ${retries + 1} of 3`);
            job.attrs.data.retries = retries + 1;
            job.schedule('in 5 minutes'); // 5 minute baad wapas try karega
            await job.save();
        } else {
            console.log(`🚨 Max retries reached. Removing invalid token logic can go here.`);
            // Note: Stage 4 mein hum yahan expired token delete karne ka logic dalenge
        }
    }
});

// 👉 2. Queue Start karne ka function
const startQueue = async () => {
    await agenda.start();
    console.log("✅ Background Job Queue (Agenda) started using MongoDB!");
};

// 👉 3. Real-Time Notification (Turant bhejney ke liye)
const enqueueRealTimeNotification = async (pushToken, title, body, data = {}) => {
    await agenda.now('send push notification', { pushToken, title, body, data });
};

// 👉 4. Scheduled Notification (Cart Abandonment jaise delayed messages ke liye)
const scheduleDelayedNotification = async (delayString, pushToken, title, body, data = {}) => {
    // delayString can be 'in 2 hours', 'tomorrow at noon', etc.
    await agenda.schedule(delayString, 'send push notification', { pushToken, title, body, data });
};

module.exports = { 
    startQueue, 
    enqueueRealTimeNotification, 
    scheduleDelayedNotification 
};