import { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to tabs after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
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