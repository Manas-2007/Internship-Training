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
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

const { height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      className="flex-1 bg-white"
    >
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        {/* Top Banner Image */}
        <View style={{ height: height * 0.45, width: '100%' }}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop" }} 
            className="w-full h-full object-cover"
          />
        </View>

        {/* Bottom White Overlay Card */}
        <View className="flex-1 bg-white rounded-t-[40px] -mt-12 px-6 pt-10 pb-8">
          
          <Text className="text-4xl font-black text-neutral-800 mb-2 tracking-tight">
            Welcome Back
          </Text>
          <Text className="text-base text-neutral-500 mb-8 font-medium">
            Login to continue shopping
          </Text>

          {/* Email Input */}
          <View className="mb-4">
            <TextInput 
              placeholder="Email"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className="bg-neutral-50 px-5 py-4 rounded-2xl text-base border border-neutral-100"
              placeholderTextColor="#a3a3a3"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-8">
            <TextInput 
              placeholder="Password"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className="bg-neutral-50 px-5 py-4 rounded-2xl text-base border border-neutral-100"
              placeholderTextColor="#a3a3a3"
              secureTextEntry
            />
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            className="bg-[#ff3f6c] py-4 rounded-2xl items-center shadow-sm mb-6 mt-4"
            onPress={handleLogin} 
          >
            <Text className="text-white font-bold text-lg tracking-widest">
              LOGIN
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity className="items-center mt-auto mb-4" onPress={()=>router.replace('/auth/signup')}>
            <Text className="text-base text-neutral-500 font-medium">
              Don't have an account? <Text className="text-[#ff3f6c] font-bold">Sign Up</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}