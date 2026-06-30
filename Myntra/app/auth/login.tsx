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
  const isLargeScreen = width >= 768; 

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
        Alert.alert("Login Failed", error.response?.data?.message || "Something went wrong");
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
          justifyContent: isLargeScreen ? 'center' : 'flex-start',
          paddingBottom: isLargeScreen ? 40 : 0
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        <View className={`w-full mx-auto bg-white ${isLargeScreen ? 'max-w-md rounded-[32px] overflow-hidden shadow-xl border border-neutral-100 my-10' : 'flex-1'}`}>
          
          {/* Image Section - Slightly taller on web to balance the slimmer form */}
          <View style={{ height: isLargeScreen ? 320 : height * 0.45, width: '100%' }}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop" }} 
              className="w-full h-full object-cover"
            />
          </View>

          {/* Form Container - Slimmer padding and margins */}
          <View className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 pt-8 pb-6">
            
            <Text className="text-3xl font-bold text-neutral-800 mb-1 tracking-tight">
              Welcome Back
            </Text>
            <Text className="text-sm text-neutral-500 mb-6 font-medium">
              Login to continue shopping
            </Text>

            <View className="mb-3.5">
              <TextInput 
                placeholder="Email"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="bg-neutral-50 px-4 py-3 rounded-xl text-base border border-neutral-100 hover:bg-neutral-100 transition-colors"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>
              )}
            </View>

            <View className="mb-6">
              <TextInput 
                placeholder="Password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                style={{ color: '#000000', fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined }}
                className="bg-neutral-50 px-4 py-3 rounded-xl text-base border border-neutral-100 hover:bg-neutral-100 transition-colors"
                placeholderTextColor="#a3a3a3"
                secureTextEntry={true}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity 
              className="bg-[#ff3f6c] py-3 rounded-xl items-center shadow-sm mb-3.5 hover:opacity-90 transition-opacity cursor-pointer"
              onPress={handleLogin} 
            >
              <Text className="text-white font-semibold text-base tracking-wide">
                LOGIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white border border-neutral-200 py-3 rounded-xl items-center mb-6 hover:bg-neutral-50 transition-colors cursor-pointer"
              onPress={handleGuestLogin} 
            >
              <Text className="text-neutral-700 font-semibold text-base tracking-wide">
                CONTINUE AS GUEST
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center mt-auto mb-2 cursor-pointer" onPress={()=>router.replace('/auth/signup')}>
              <Text className="text-sm text-neutral-500 font-medium">
                Don't have an account? <Text className="text-[#ff3f6c] font-semibold hover:underline">Sign Up</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}