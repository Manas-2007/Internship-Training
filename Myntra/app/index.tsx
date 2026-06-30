import React, { useEffect } from 'react';
import { View, Image, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const isLargeScreen: boolean = width >= 768;
  const logoSize: number = isLargeScreen ? 256 : 192;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const checkAuthAndNavigate = async (): Promise<void> => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        timer = setTimeout(() => {
          if (token) {
            router.replace('/(tabs)'); 
          } else {
            router.replace('/auth/login'); 
          }
        }, 3000);
      } catch (error) {
        console.log("Error checking token:", error);
        timer = setTimeout(() => {
          router.replace('/auth/login');
        }, 3000);
      }
    };

    checkAuthAndNavigate();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <StatusBar barStyle="dark-content" />
      <Image
        source={require('@/assets/images/myntra.jpg')}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
      />
    </View>
  );
}