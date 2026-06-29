import { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        const timer = setTimeout(() => {
          if (token) {
            router.replace('/(tabs)'); 
          } else {
            router.replace('/auth/login'); 
          }
        }, 3000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.log("Error checking token:", error);
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