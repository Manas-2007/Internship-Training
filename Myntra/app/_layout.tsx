import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";
import { GlobalProvider } from "./context/GlobalContext";
import { Stack } from "expo-router";
import { ThemeProvider } from './context/ThemeContext';

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