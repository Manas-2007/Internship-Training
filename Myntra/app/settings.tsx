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
  
  // New States for Theme Dropdown
  const [themeMode, setThemeMode] = useState("System"); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cross-platform alert helper
  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleThemeSelect = (mode: string) => {
    setThemeMode(mode);
    setIsDropdownOpen(false);
    // Asli Dark/Light mode ka logic hum baad mein yahan lagayenge
  };

  const showTerms = () => {
    showMessage(
      "Terms & Conditions",
      "This application is a clone project built for internship training purposes. By continuing to use this app, you agree to the standard privacy policies and usage guidelines. No real transactions are processed."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* 1400px Centering Wrapper for the Entire Screen */}
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Premium Header Area */}
        <View className="px-5 py-4 md:py-5 bg-white border-b border-neutral-100 shadow-sm z-10 flex-row items-center">
          {/* Constrain header content on large screens to align with list */}
          <View className="w-full max-w-3xl mx-auto flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              activeOpacity={0.7}
              className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Ionicons name="arrow-back" size={24} color="#ff3f6c" />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold text-[#ff3f6c] tracking-tight">
              Settings
            </Text>
          </View>
        </View>

        {/* Main Content Area */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingTop: isLargeScreen ? 32 : 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Inner constraint (max-w-3xl) prevents stretching on ultrawide monitors */}
          <View className="w-full max-w-3xl mx-auto px-4">
            
            {/* Settings Card Container */}
            <View className="bg-white rounded-2xl border border-neutral-100 shadow-sm z-50">
              
              {/* Notifications */}
              <View className="flex-row items-center justify-between px-5 md:px-6 py-4 md:py-5 border-b border-neutral-50">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-50 items-center justify-center">
                    <Ionicons name="notifications-outline" size={20} color="#ff3f6c" />
                  </View>
                  <Text className="text-base md:text-lg font-semibold text-neutral-800 ml-4 tracking-tight">
                    Push Notifications
                  </Text>
                </View>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications} 
                  trackColor={{ false: "#e4e4e7", true: "#fbcfe8" }}
                  thumbColor={notifications ? "#ff3f6c" : "#f4f4f5"}
                  className="cursor-pointer"
                />
              </View>

              {/* Theme Selection (Floating Dropdown) */}
              <View className="border-b border-neutral-50 z-50" style={{ zIndex: 50 }}>
                
                {/* Dropdown Header */}
                <TouchableOpacity 
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between px-5 md:px-6 py-4 md:py-5 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 items-center justify-center">
                      <Ionicons name="color-palette-outline" size={20} color="#475569" />
                    </View>
                    <Text className="text-base md:text-lg font-semibold text-neutral-800 ml-4 tracking-tight">
                      Theme
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center bg-neutral-100 px-3 py-1.5 rounded-lg">
                    <Text className="text-sm md:text-base text-neutral-700 font-bold mr-2">
                      {themeMode}
                    </Text>
                    <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#a3a3a3" />
                  </View>
                </TouchableOpacity>

                {/* Floating Dropdown Menu (Absolute Position) */}
                {isDropdownOpen && (
                  <View 
                    className="absolute right-5 md:right-6 top-[85%] mt-2 w-48 bg-white rounded-xl border border-neutral-100 py-2 shadow-xl cursor-default"
                    style={{ zIndex: 100, elevation: 10 }}
                  >
                    {["System", "Light", "Dark"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleThemeSelect(option)}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between px-5 py-3.5 hover:bg-neutral-50 cursor-pointer"
                      >
                        <Text className={`text-base ${themeMode === option ? "font-semibold text-[#ff3f6c]" : "font-semibold text-neutral-600"}`}>
                          {option}
                        </Text>
                        {themeMode === option && (
                          <Ionicons name="checkmark-circle" size={20} color="#ff3f6c" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Terms & Conditions */}
              <TouchableOpacity 
                onPress={showTerms}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-5 md:px-6 py-4 md:py-5 hover:bg-neutral-50 active:bg-neutral-50 transition-colors cursor-pointer group"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-base md:text-lg font-semibold text-neutral-800 ml-4 tracking-tight">
                    Terms & Conditions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#a3a3a3" />
              </TouchableOpacity>

            </View>

            <Text className="text-center text-neutral-400 font-semibold text-xs md:text-sm mt-8 tracking-widest uppercase">
              App Version 1.0.0
            </Text>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}