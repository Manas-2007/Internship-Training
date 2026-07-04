const { Expo } = require('expo-server-sdk');

// Expo SDK client initialize karna
const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
    // 1. Check karna ki token valid hai ya nahi
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`❌ Push token ${pushToken} is not a valid Expo push token`);
        return null;
    }

    // 2. Message ka structure banana
    const messages = [{
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data, // Yeh data frontend par click handle karne ke kaam aayega (jaise redirect url)
    }];

    try {
        // 3. Message bhejna
        const tickets = await expo.sendPushNotificationsAsync(messages);
        console.log("✅ Notification sent successfully:", tickets);
        return tickets;
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        throw error;
    }
};

module.exports = { sendPushNotification };