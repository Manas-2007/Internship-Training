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
import { useTheme } from './context/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const [notifications, setNotifications] = useState(true);
  const { themeMode, changeTheme, colors, isDark } = useTheme(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleThemeSelect = (mode: string) => {
    changeTheme(mode);
    setIsDropdownOpen(false);
  };

  const showTerms = () => {
    showMessage("Terms & Conditions", "This application is a clone project...");
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Header */}
        <View 
          className="px-5 py-4 md:py-5 border-b shadow-sm z-10 flex-row items-center"
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
        >
          <View className="w-full max-w-3xl mx-auto flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              activeOpacity={0.7}
              className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full cursor-pointer"
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>
              Settings
            </Text>
          </View>
        </View>

        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingTop: isLargeScreen ? 32 : 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-3xl mx-auto px-4">
            
            <View 
              className="rounded-2xl border shadow-sm z-50"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              
              {/* Notifications */}
              <View className="flex-row items-center justify-between px-5 md:px-6 py-4 md:py-5 border-b" style={{ borderBottomColor: colors.border }}>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}>
                    <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-base md:text-lg font-semibold ml-4 tracking-tight" style={{ color: colors.textMain }}>
                    Push Notifications
                  </Text>
                </View>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications} 
                  trackColor={{ false: colors.border, true: "#fbcfe8" }}
                  thumbColor={notifications ? colors.primary : colors.textMuted}
                />
              </View>

              {/* Theme Dropdown */}
              <View className="border-b z-50" style={{ borderBottomColor: colors.border, zIndex: 50 }}>
                <TouchableOpacity 
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between px-5 md:px-6 py-4 md:py-5 cursor-pointer"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                      <Ionicons name="color-palette-outline" size={20} color={isDark ? '#cbd5e1' : '#475569'} />
                    </View>
                    <Text className="text-base md:text-lg font-semibold ml-4 tracking-tight" style={{ color: colors.textMain }}>
                      Theme
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.background }}>
                    <Text className="text-sm md:text-base font-bold mr-2" style={{ color: colors.textMain }}>
                      {themeMode}
                    </Text>
                    <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>

                {isDropdownOpen && (
                  <View 
                    className="absolute right-5 md:right-6 top-[85%] mt-2 w-48 rounded-xl border py-2 shadow-xl"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, zIndex: 100, elevation: 10 }}
                  >
                    {["System", "Light", "Dark"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleThemeSelect(option)}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between px-5 py-3.5 cursor-pointer"
                      >
                        <Text className="text-base font-semibold" style={{ color: themeMode === option ? colors.primary : colors.textMain }}>
                          {option}
                        </Text>
                        {themeMode === option && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Terms */}
              <TouchableOpacity 
                onPress={showTerms}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-5 md:px-6 py-4 md:py-5 cursor-pointer"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? '#1e3a8a' : '#eff6ff' }}>
                    <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-base md:text-lg font-semibold ml-4 tracking-tight" style={{ color: colors.textMain }}>
                    Terms & Conditions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>

            </View>

            <Text className="text-center font-semibold text-xs md:text-sm mt-8 tracking-widest uppercase" style={{ color: colors.textMuted }}>
              App Version 1.0.0
            </Text>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}