import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  useWindowDimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { useGlobalContext } from '../context/GlobalContext';
// 👉 Import ThemeContext
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const router = useRouter();
  const { syncRecentlyViewed, fetchWishlistIds } = useGlobalContext();
  
  // 👉 Extract colors and isDark
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { height, width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Tablets, Laptops, Desktops

  const handleLogin = async () => {
    setErrors({}); 

    const tempErrors: { [key: string]: string } = {};
    if (!email) tempErrors.email = "Required";
    if (!password) tempErrors.password = "Required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      if (response.status === 200) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await syncRecentlyViewed(); 
        await fetchWishlistIds();
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const fieldErrors: any = {};
        error.response.data.errors.forEach((err: any) => {
          fieldErrors[err.path] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        if (Platform.OS === "web") {
          window.alert(`Login Failed\n\n${error.response?.data?.message || "Something went wrong"}`);
        } else {
          Alert.alert("Login Failed", error.response?.data?.message || "Something went wrong");
        }
      }
    }
  };

  const handleGuestLogin = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Dynamic Status Bar based on Theme and Screen Size */}
      <StatusBar style={isDark ? "light" : (isLargeScreen ? "dark" : "light")} />
      
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          // Centers the whole card vertically on Desktop, starts from top on mobile
          justifyContent: isLargeScreen ? 'center' : 'flex-start',
          paddingBottom: isLargeScreen ? 40 : 0
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        {/* Main Card Container */}
        <View 
          className={`w-full mx-auto ${
            isLargeScreen 
              ? 'max-w-5xl flex-row rounded-3xl overflow-hidden shadow-2xl border my-10' 
              : 'flex-1'
          }`}
          style={[
            isLargeScreen ? { minHeight: 600 } : {},
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          
          {/* Image Section */}
          {/* On Desktop: Takes up 50% width. On Mobile: Takes 45% of screen height */}
          <View style={isLargeScreen ? { width: '50%' } : { height: height * 0.45, width: '100%' }}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop" }} 
              className="w-full h-full object-cover"
            />
          </View>

          {/* Form Container */}
          {/* On Desktop: Side-by-side, vertically centered. On Mobile: Slides up over the image (-mt-8) */}
          <View 
            className={`${
              isLargeScreen 
                ? 'w-[50%] justify-center px-14 py-12' 
                : 'flex-1 rounded-t-[32px] -mt-8 px-6 pt-8 pb-6'
            }`}
            style={{ backgroundColor: colors.surface }}
          >
            
            <Text className="text-3xl font-bold mb-1 tracking-tight" style={{ color: colors.textMain }}>
              Welcome Back
            </Text>
            <Text className="text-sm mb-8 font-medium" style={{ color: colors.textMuted }}>
              Login to continue shopping
            </Text>

            <View className="mb-4">
              <TextInput 
                placeholder="Email"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="px-4 py-3.5 rounded-xl text-base border outline-none transition-colors"
                style={{ 
                  backgroundColor: colors.background, 
                  color: colors.textMain,
                  borderColor: colors.border 
                }}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.email}</Text>
              )}
            </View>

            <View className="mb-8">
              <TextInput 
                placeholder="Password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                style={{ 
                  color: colors.textMain, 
                  fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
                  backgroundColor: colors.background,
                  borderColor: colors.border
                }}
                className="px-4 py-3.5 rounded-xl text-base border outline-none transition-colors"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={true}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity 
              className="py-3.5 rounded-xl items-center shadow-sm mb-4 transition-opacity cursor-pointer"
              style={{ backgroundColor: colors.primary }}
              onPress={handleLogin} 
              activeOpacity={0.9}
            >
              <Text className="text-white font-semibold text-base tracking-wide">
                LOGIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="border py-3.5 rounded-xl items-center mb-6 transition-colors cursor-pointer"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              onPress={handleGuestLogin}
              activeOpacity={0.7}
            >
              <Text className="font-semibold text-base tracking-wide" style={{ color: colors.textMain }}>
                CONTINUE AS GUEST
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center mt-auto mb-2 cursor-pointer" onPress={()=>router.replace('/auth/signup')}>
              <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Don't have an account? <Text className="font-bold hover:underline" style={{ color: colors.primary }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}