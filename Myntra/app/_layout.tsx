import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";
import { GlobalProvider } from "./context/GlobalContext";

export default function Layout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          
          setTimeout(() => {
            router.replace("/(tabs)"); 
          }, 100); 
        }
      } catch (error) {
        console.log("Token check failed:", error);
      } finally {
        setIsChecking(false); 
      }
    };
    
    checkLoginStatus();
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

 return (
    <GlobalProvider>
       <Stack screenOptions={{ headerShown: false }} />
    </GlobalProvider>
  );
} 