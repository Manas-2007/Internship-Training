const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    throw new Error("DeviceNotRegistered: Invalid token format");
  }

  const messages = [
    {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: data,
    },
  ];
  try {
    const tickets = await expo.sendPushNotificationsAsync(messages);
    return tickets;
  } catch (error) {
    console.error("Expo Service Error:", error.message);
    throw error;
  }
};

module.exports = { sendPushNotification };
