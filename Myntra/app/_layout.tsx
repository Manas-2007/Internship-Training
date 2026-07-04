import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";
import { GlobalProvider } from "./context/GlobalContext";
import { Stack } from "expo-router";
import { ThemeProvider } from './context/ThemeContext';

// 👉 Notifications ke imports
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../utils/notifications';

// 👉 SDK 54 Handler (shouldShowAlert hata kar nayi properties laga di hain)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Notification banner dikhega
    shouldShowList: true,   // Notification center list mein aayega
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await AsyncStorage.getItem("userToken");
      } catch (error) {
        console.error(error);
      } finally {
        setIsAppReady(true);
      }
    };

    checkAuthStatus();

    // 👉 1. Setup Push Notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        AsyncStorage.setItem('pushToken', token);
      }
    });

    // 👉 2. Listeners ko direct variables mein assign kiya (No useRef needed)
    const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("🔔 Notification Received in Foreground:", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("👆 User tapped on notification:", response);
    });

    // 👉 3. Cleanup function using direct .remove()
    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!isAppReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  return (
    <GlobalProvider>
      <ThemeProvider>
       <Stack screenOptions={{ headerShown: false }} />
       </ThemeProvider>
    </GlobalProvider>
  );
}