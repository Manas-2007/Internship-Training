import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../constants/api";
import axios from "axios";

export default function SignUp() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Screen dimension check for responsive layout
  const { height, width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Backend Integration Function
  const handleSignUp = async () => {
    setErrors({});

    const tempErrors: { [key: string]: string } = {};
    if (!name) tempErrors.name = "Required";
    if (!email) tempErrors.email = "Required";
    if (!password) tempErrors.password = "Required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        Alert.alert("Success", "Account created successfully!");
        router.replace("/auth/login");
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const fieldErrors: any = {};
        error.response.data.errors.forEach((err: any) => {
          fieldErrors[err.path] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Registration failed",
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
        
        {/* Centered Card Wrapper for Web/Tablet */}
        <View className={`w-full mx-auto bg-white ${isLargeScreen ? 'max-w-md rounded-[32px] overflow-hidden shadow-xl border border-neutral-100 my-10' : 'flex-1'}`}>
          
          {/* Top Image */}
          <View style={{ height: isLargeScreen ? 280 : height * 0.35, width: '100%' }}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop",
              }}
              className="w-full h-full object-cover"
            />
          </View>

          {/* Bottom Form Section */}
          <View className="bg-white rounded-t-[32px] px-6 pt-8 pb-6 -mt-8 flex-1">
            <Text className="text-3xl font-bold text-neutral-800 tracking-tight mb-1">
              Create Account
            </Text>
            <Text className="text-sm text-neutral-500 mb-6 font-medium">
              Join Myntra and discover amazing fashion
            </Text>

            {/* Inputs */}
            <View className="gap-y-3.5">
              <View>
                <TextInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className="bg-neutral-50 px-4 py-3 rounded-xl text-base border border-neutral-100 hover:bg-neutral-100 transition-colors"
                  placeholderTextColor="#a3a3a3"
                />
                {errors.name && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.name}
                  </Text>
                )}
              </View>

              <View>
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-neutral-50 px-4 py-3 rounded-xl text-base border border-neutral-100 hover:bg-neutral-100 transition-colors"
                  placeholderTextColor="#a3a3a3"
                />
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              <View>
                <View className="bg-neutral-50 rounded-xl flex-row items-center px-4 border border-neutral-100 hover:bg-neutral-100 transition-colors">
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    secureTextEntry={!showPassword}
                    style={{ color: '#000000', fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined }}
                    className="flex-1 py-3 text-base"
                    placeholderTextColor="#a3a3a3"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-2 -mr-2 cursor-pointer"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#737373"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.password}
                  </Text>
                )}
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              className="bg-[#ff3f6c] py-3 rounded-xl items-center mt-8 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Text className="text-white font-semibold text-base tracking-wide">
                SIGN UP
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              onPress={() => router.replace("/auth/login")}
              className="mt-6 mb-2 items-center cursor-pointer"
            >
              <Text className="text-sm text-neutral-500 font-medium">
                Already have an account?{" "}
                <Text className="text-[#ff3f6c] font-semibold hover:underline">Login</Text>
              </Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}