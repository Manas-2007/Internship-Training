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
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../constants/api";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUp() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { height, width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const [isLoading, setIsLoading] = useState(false);

  // Cross-platform alert helper
  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setErrors({});

    const tempErrors: { [key: string]: string } = {};
    if (!name) tempErrors.name = "Required";
    if (!email) tempErrors.email = "Required";
    if (!password) tempErrors.password = "Required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      setIsLoading(false);
      return;
    }

   try {
      const pushToken = await AsyncStorage.getItem('pushToken');
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
        pushToken 
      });

      if (response.status === 201) {
        showMessage("Success", "Account created successfully!");
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
        showMessage(
          "Error",
          error.response?.data?.message || "Registration failed"
        );
      }
    }finally {
    setIsLoading(false); 
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={isDark ? "light" : (isLargeScreen ? "dark" : "light")} />
      
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
          
          <View style={isLargeScreen ? { width: '50%' } : { height: height * 0.35, width: '100%' }}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop",
              }}
              className="w-full h-full object-cover"
            />
          </View>

          {/* Form Container */}
          <View 
            className={`${
              isLargeScreen 
                ? 'w-[50%] justify-center px-14 py-12' 
                : 'flex-1 rounded-t-[32px] -mt-8 px-6 pt-8 pb-6'
            }`}
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-3xl font-bold tracking-tight mb-1" style={{ color: colors.textMain }}>
              Create Account
            </Text>
            <Text className="text-sm mb-8 font-medium" style={{ color: colors.textMuted }}>
              Join Myntra and discover amazing fashion
            </Text>

            <View className="gap-y-4">
              <View>
                <TextInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className="px-4 py-3.5 rounded-xl text-base border outline-none transition-colors"
                  style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                  placeholderTextColor={colors.textMuted}
                />
                {errors.name && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">
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
                  className="px-4 py-3.5 rounded-xl text-base border outline-none transition-colors"
                  style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                  placeholderTextColor={colors.textMuted}
                />
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">
                    {errors.email}
                  </Text>
                )}
              </View>

              <View>
                <View 
                  className="rounded-xl flex-row items-center px-4 border transition-colors"
                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                >
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    secureTextEntry={!showPassword}
                    style={{ color: colors.textMain, fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined }}
                    className="flex-1 py-3.5 text-base outline-none"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-2 -mr-2 cursor-pointer"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">
                    {errors.password}
                  </Text>
                )}
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading}
                className="py-3.5 rounded-xl items-center mt-8 shadow-sm transition-opacity cursor-pointer hover:opacity-90"
                style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-base tracking-wide">
                    SIGN UP
                  </Text>
                )}
              </TouchableOpacity>

           <TouchableOpacity
  onPress={() => router.push("/auth/login")}
  style={{ marginTop: 24, marginBottom: 24, alignItems: 'center' }}
  activeOpacity={0.7}
>
  <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
    Already have an account?{" "}
    <Text className="font-bold" style={{ color: colors.primary }}>Login</Text>
  </Text>
</TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}