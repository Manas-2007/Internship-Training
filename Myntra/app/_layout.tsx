import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";
import { GlobalProvider } from "./context/GlobalContext";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments(); // Current active route segments pata lagane ke liye
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        
      
        const inAuthGroup = segments[0] === "auth";
        const inTabsGroup = segments[0] === "(tabs)";
        
        if (token && !inTabsGroup) {
           router.replace("/(tabs)"); 
        } else if (!token && !inAuthGroup) {
          
        }
      } catch (error) {
        console.log("Token check failed:", error);
      }
    };
    
    checkLoginStatus();
  }, [isMounted, segments]); // segments dependency add ki taaki navigation complete hone ke baad ruk jaye

  return (
    <GlobalProvider>
       <Stack screenOptions={{ headerShown: false }} />
    </GlobalProvider>
  );
}