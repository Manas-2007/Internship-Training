// utils/notifications.ts
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
  let token;

  // Android ke liye ek special notification channel banana padta hai
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff3f6c',
    });
  }

  // Check karte hain ki real device hai ya nahi (Simulators pe push token nahi milta)
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Agar permission nahi hai, toh maang lo
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Agar user ne mana kar diya toh return
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      // Expo project ID extract karna (EAS build ke liye)
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("✅ Expo Push Token Generated:", token);
    } catch (e) {
      console.log("❌ Error getting token:", e);
    }
  } else {
    console.log('⚠️ Must use physical device for Push Notifications');
  }

  return token;
}