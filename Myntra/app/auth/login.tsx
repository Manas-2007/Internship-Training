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

export default function Login() {
  const router = useRouter();
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
      className="flex-1 bg-white sm:bg-neutral-50"
    >
      <StatusBar style={isLargeScreen ? "dark" : "light"} />
      
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
          className={`w-full mx-auto bg-white ${
            isLargeScreen 
              ? 'max-w-5xl flex-row rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 my-10' 
              : 'flex-1'
          }`}
          style={isLargeScreen ? { minHeight: 600 } : {}}
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
            className={`bg-white ${
              isLargeScreen 
                ? 'w-[50%] justify-center px-14 py-12' 
                : 'flex-1 rounded-t-[32px] -mt-8 px-6 pt-8 pb-6'
            }`}
          >
            
            <Text className="text-3xl font-bold text-neutral-800 mb-1 tracking-tight">
              Welcome Back
            </Text>
            <Text className="text-sm text-neutral-500 mb-8 font-medium">
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
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base border border-neutral-200 hover:border-neutral-300 focus:border-[#ff3f6c] outline-none transition-colors"
                placeholderTextColor="#a3a3a3"
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
                style={{ color: '#000000', fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined }}
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base border border-neutral-200 hover:border-neutral-300 focus:border-[#ff3f6c] outline-none transition-colors"
                placeholderTextColor="#a3a3a3"
                secureTextEntry={true}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity 
              className="bg-[#ff3f6c] py-3.5 rounded-xl items-center shadow-sm shadow-pink-200 mb-4 hover:opacity-90 transition-opacity cursor-pointer"
              onPress={handleLogin} 
            >
              <Text className="text-white font-semibold text-base tracking-wide">
                LOGIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white border border-neutral-200 py-3.5 rounded-xl items-center mb-6 hover:bg-neutral-50 transition-colors cursor-pointer"
              onPress={handleGuestLogin} 
            >
              <Text className="text-neutral-700 font-semibold text-base tracking-wide">
                CONTINUE AS GUEST
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center mt-auto mb-2 cursor-pointer" onPress={()=>router.replace('/auth/signup')}>
              <Text className="text-sm text-neutral-500 font-medium">
                Don't have an account? <Text className="text-[#ff3f6c] font-bold hover:underline">Sign Up</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}