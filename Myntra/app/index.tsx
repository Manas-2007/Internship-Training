import { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // 1. Background mein chupchaap token check kar lo
        const token = await AsyncStorage.getItem("userToken");

        // 2. 3 seconds ka timer, taaki splash screen ka logo properly dikhe
        const timer = setTimeout(() => {
          if (token) {
            router.replace('/(tabs)'); // Token hai toh seedha Home/Tabs par
          } else {
            router.replace('/auth/login'); // Token nahi hai toh Login par
          }
        }, 3000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.log("Error checking token:", error);
        // Agar koi error aaye toh safe side login par bhej do
        setTimeout(() => {
          router.replace('/auth/login');
        }, 3000);
      }
    };

    checkAuthAndNavigate();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <StatusBar barStyle="dark-content" />
      <Image
        source={require('@/assets/images/myntra.jpg')}
        className="w-48 h-48"
        resizeMode="contain"
      />
    </View>
  );
}