import React, { useEffect } from "react";
import { LogBox } from "react-native";
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

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications'
]);

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
    const setupAppAndNotifications = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        let pushToken = null;
        
        try {
          pushToken = await registerForPushNotificationsAsync();
        } catch (e) {
          console.warn("Notification setup bypassed for Expo Go.");
        }

        if (pushToken) {
          await AsyncStorage.setItem('pushToken', pushToken);

          if (userToken) {
            try {
              await axios.put(
                `${API_URL}/api/auth/update-push-token`,
                { pushToken },
                { headers: { Authorization: `Bearer ${userToken}` } }
              );
            } catch (syncError) {
              // Silently ignore offline sync errors
            }
          }
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      }
    };

    setupAppAndNotifications();

    const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      // Foreground notification logic
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      if (data?.url) {
        requestAnimationFrame(() => {
          router.push(data.url as any);
        });
      }
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <GlobalProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </GlobalProvider>
  );
}