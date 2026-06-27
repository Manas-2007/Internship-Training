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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

export default function SignUp() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      const API_URL = "http://172.16.52.102:5000/api/auth/register";

      const response = await axios.post(API_URL, {
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
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className="bg-[#f5f5f5] px-5 py-4 rounded-xl text-base text-neutral-800 font-semibold"
                placeholderTextColor="#a3a3a3"
              />
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.name}
                </Text>
              )}

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-[#f5f5f5] px-5 py-4 rounded-xl text-base text-neutral-800 font-semibold"
                placeholderTextColor="#a3a3a3"
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.email}
                </Text>
              )}

              <View className="bg-[#f5f5f5] rounded-xl flex-row items-center px-5">
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
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
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </Text>
              )}
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
