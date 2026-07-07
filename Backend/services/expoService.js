const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
    // Validate Expo push token format
    if (!Expo.isExpoPushToken(pushToken)) {
        // Throw error so queueService can catch and remove invalid tokens
        throw new Error('DeviceNotRegistered: Invalid token format'); 
    }

    const messages = [{
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data, 
    }];

    return await expo.sendPushNotificationsAsync(messages);
};

module.exports = { sendPushNotification };