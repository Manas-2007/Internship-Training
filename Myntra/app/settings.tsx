import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false); 

  // Cross-platform alert helper (Alert.alert sometimes fails on pure web)
  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    if (value) {
      showMessage(
        "Coming Soon", 
        "Dark Mode is currently under development. Stay tuned for the next update!"
      );
      setDarkMode(false); 
    } else {
      setDarkMode(false);
    }
  };

  const showTerms = () => {
    showMessage(
      "Terms & Conditions",
      "This application is a clone project built for internship training purposes. By continuing to use this app, you agree to the standard privacy policies and usage guidelines. No real transactions are processed."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* Header Area */}
      <View className="px-5 py-5 bg-white border-b border-neutral-100 shadow-sm z-10">
        <View className="w-full max-w-3xl mx-auto flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-4 p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Ionicons name="arrow-back" size={24} color="#171717" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-neutral-900 tracking-tight">
            Settings
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-3xl mx-auto mt-6">
          
          {/* Settings Card Container */}
          <View className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            
            {/* Notifications */}
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-neutral-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center">
                  <Ionicons name="notifications-outline" size={20} color="#ff3f6c" />
                </View>
                <Text className="text-lg font-semibold text-neutral-800 ml-4 tracking-tight">
                  Push Notifications
                </Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={setNotifications} 
                trackColor={{ false: "#d4d4d8", true: "#fbcfe8" }}
                thumbColor={notifications ? "#ff3f6c" : "#f4f4f5"}
                className="cursor-pointer"
              />
            </View>

            {/* Dark Mode */}
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-neutral-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                  <Ionicons name="moon-outline" size={20} color="#475569" />
                </View>
                <Text className="text-lg font-semibold text-neutral-800 ml-4 tracking-tight">
                  Dark Mode
                </Text>
              </View>
              <Switch 
                value={darkMode} 
                onValueChange={handleDarkModeToggle} 
                trackColor={{ false: "#d4d4d8", true: "#fbcfe8" }}
                thumbColor={darkMode ? "#ff3f6c" : "#f4f4f5"}
                className="cursor-pointer"
              />
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity 
              onPress={showTerms}
              activeOpacity={0.7}
              className="flex-row items-center justify-between px-6 py-5 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                  <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
                </View>
                <Text className="text-lg font-semibold text-neutral-800 ml-4 tracking-tight">
                  Terms & Conditions
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
            </TouchableOpacity>

          </View>

          <Text className="text-center text-neutral-400 font-medium text-sm mt-8">
            App Version 1.0.0
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}