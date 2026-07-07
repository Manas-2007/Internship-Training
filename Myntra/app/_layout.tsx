import React, { useEffect } from "react";
// 👉 isAppReady hatane ki wajah se 'useState' aur 'View', 'ActivityIndicator' ki zaroorat nahi bachi yahan
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import "../global.css";
import { GlobalProvider } from "./context/GlobalContext";
import { ThemeProvider } from './context/ThemeContext';
import { API_URL } from './constants/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';

// Disable reanimated strict mode warning
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  
  useEffect(() => {
    // Ye function ab background mein bina app ko roke chalega
    const setupAppAndNotifications = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken) {
          await AsyncStorage.setItem('pushToken', pushToken);

          // Sync token to backend
          if (userToken) {
            try {
              await axios.put(`${API_URL}/api/auth/update-push-token`, 
                { pushToken },
                { headers: { Authorization: `Bearer ${userToken}` } }
              );
            } catch (syncError) {
              // Silently ignore sync errors (e.g., offline state)
            }
          }
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      }
    };

    setupAppAndNotifications();

    // Foreground Listener (App is open)
    const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
      // Logic for foreground local alerts can be added here
    });

    // Background/Terminated Listener (User taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Smart Routing execution with Delay (Context fix)
      if (data?.url) {
        setTimeout(() => {
          router.push(data.url as any);
        }, 500);
      }
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // ✅ DIRECT RETURN: Expo Router ab khush rahega aur context nahi bhulega!
  return (
    <GlobalProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </GlobalProvider>
  );
}