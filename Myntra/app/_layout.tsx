import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";
import { GlobalProvider } from "./context/GlobalContext";
import { Stack, router } from "expo-router"; // 👈 IMPORTED router
import { ThemeProvider } from './context/ThemeContext';
import axios from 'axios'; // 👈 IMPORTED axios
import { API_URL } from './constants/api'; // 👈 IMPORTED API_URL
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
// Reanimated strict mode warning ko disable karne ke liye
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../utils/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const setupAppAndNotifications = async () => {
      try {
        // 1. Get the Auth Token
        const userToken = await AsyncStorage.getItem("userToken");

        // 2. Generate OS-level Push Token
        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken) {
          await AsyncStorage.setItem('pushToken', pushToken);

          // 3. 👉 SYNC WITH BACKEND: Save device token to user profile
          if (userToken) {
            try {
              await axios.put(`${API_URL}/api/auth/update-push-token`, 
                { pushToken },
                { headers: { Authorization: `Bearer ${userToken}` } }
              );
              console.log("✅ Device Push Token synced with backend!");
            } catch (syncError) {
              console.log("⚠️ Failed to sync push token to backend (User might be offline)");
            }
          }
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setIsAppReady(true);
      }
    };

    setupAppAndNotifications();

    // 👉 FOREGROUND LISTENER (App is open)
    const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("🔔 Notification Received in Foreground:", notification.request.content.title);
      // Optional: We can add local alert popups here later if needed
    });

    // 👉 BACKGROUND / TERMINATED LISTENER (User taps the notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("👆 User tapped on OS notification");
      const data = response.notification.request.content.data;

      // 4. 👉 SMART ROUTING: Navigate based on notification payload
      if (data && data.url) {
        router.push(data.url as any);
      }
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!isAppReady) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#ffffff' }}>
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