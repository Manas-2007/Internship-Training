import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Default Light (false)

  // Dark Mode Toggle Logic
  const handleDarkModeToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Coming Soon", 
        "Dark Mode is currently under development. Stay tuned for the next update!"
      );
      setDarkMode(false); // Keep it Light by default
    } else {
      setDarkMode(false);
    }
  };

  // T&C Alert Logic
  const showTerms = () => {
    Alert.alert(
      "Terms & Conditions",
      "This application is a clone project built for internship training purposes. By continuing to use this app, you agree to the standard privacy policies and usage guidelines. No real transactions are processed."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 py-4 bg-white border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#282c3f" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-[#282c3f]">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="bg-white mt-4 border-y border-neutral-100">
          
          {/* Notifications */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-50">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={22} color="#52525b" />
              <Text className="text-base font-semibold text-neutral-700 ml-4">Push Notifications</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications} 
              trackColor={{ false: "#d4d4d8", true: "#fbcfe8" }}
              thumbColor={notifications ? "#ff3f6c" : "#f4f4f5"}
            />
          </View>

          {/* Dark Mode */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-50">
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={22} color="#52525b" />
              <Text className="text-base font-semibold text-neutral-700 ml-4">Dark Mode</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={handleDarkModeToggle} 
              trackColor={{ false: "#d4d4d8", true: "#fbcfe8" }}
              thumbColor={darkMode ? "#ff3f6c" : "#f4f4f5"}
            />
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity 
            onPress={showTerms}
            className="flex-row items-center justify-between px-5 py-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={22} color="#52525b" />
              <Text className="text-base font-semibold text-neutral-700 ml-4">Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d4d4d8" />
          </TouchableOpacity>

        </View>

        <Text className="text-center text-neutral-400 text-sm mt-8">App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}