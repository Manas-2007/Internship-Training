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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
   
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-neutral-100">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Top Image */}
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop",
            }}
            className="w-full h-72 object-cover"
          />

          {/* Bottom Form Section */}
          <View className="bg-white rounded-t-[32px] px-6 pt-8 pb-12 -mt-8 flex-1 min-h-screen">
            <Text className="text-4xl font-black text-neutral-800 tracking-tight">
              Create Account
            </Text>
            <Text className="text-base text-neutral-500 mt-2 mb-8 font-medium">
              Join Myntra and discover amazing fashion
            </Text>

            {/* Inputs */}
            <View className="gap-y-4">
              <TextInput
                placeholder="Full Name"
                className="bg-[#f5f5f5] px-5 py-4 rounded-xl text-base text-neutral-800 font-semibold"
                placeholderTextColor="#a3a3a3"
              />

              <TextInput
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-[#f5f5f5] px-5 py-4 rounded-xl text-base text-neutral-800 font-semibold"
                placeholderTextColor="#a3a3a3"
              />

              <View className="bg-[#f5f5f5] rounded-xl flex-row items-center px-5">
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  className="flex-1 py-4 text-base text-neutral-800 font-semibold"
                  placeholderTextColor="#a3a3a3"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2 -mr-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#737373"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              className="bg-[#ff3f6c] py-4 rounded-xl items-center mt-8"
            >
              <Text className="text-white font-extrabold text-lg tracking-wide">
                SIGN UP
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              onPress={() => router.replace("/auth/login")}
              className="mt-6 items-center"
            >
              <Text className="text-base text-neutral-500 font-medium">
                Already have an account?{" "}
                <Text className="text-[#ff3f6c] font-bold">Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
