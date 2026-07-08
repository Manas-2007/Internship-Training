import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { useGlobalContext } from "../context/GlobalContext";
// 👉 Import ThemeContext
import { useTheme } from "../context/ThemeContext";

const menuItems = [
  { icon: "cube", label: "Orders", route: "/orders" },
  { icon: "receipt-outline", label: "My Transactions", route: "/transactions" },
  { icon: "heart", label: "Wishlist", route: "/(tabs)/wishlist" },
  { icon: "card", label: "Payment Methods", route: "/payments" },
  { icon: "location", label: "Addresses", route: "/addresses" },
  { icon: "settings", label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { clearUserData } = useGlobalContext();
  
  // 👉 Extract colors and isDark from ThemeContext
  const { colors, isDark } = useTheme();

  const [userData, setUserData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  
  // Mobile tab bar height calculation so the logout button doesn't hide
  const TABBAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setIsGuest(true);
          setLoading(false);
          return;
        }

        const profileUrl = `${API_URL}/api/auth/profile`;
        const response = await axios.get(profileUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
      } catch (error) {
        await AsyncStorage.removeItem("userToken");
        setIsGuest(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await AsyncStorage.removeItem("userToken");
        await clearUserData(); // Clear user data on logout
        setIsGuest(true);
        router.replace("/auth/login");
      } catch (error) {
        console.log("Logout Error:", error);
      }
    };

    if (Platform.OS === "web") {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (confirmLogout) {
        await performLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: performLogout,
        },
      ]);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.trim().split(" ").filter((n) => n.length > 0);

    if (names.length === 0) return "";

    if (names.length === 1) {
      return names[0][0].toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      // 👉 Dynamic Background for loading
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isGuest) {
    return (
      // 👉 Dynamic Background for Guest Mode
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center px-6 w-full max-w-md mx-auto">
          {/* Guest Icon with dynamic subtle background */}
          <View className="w-24 h-24 rounded-full items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}>
            <Ionicons name="person-outline" size={40} color={colors.primary} />
          </View>
          <Text className="text-3xl font-bold mb-3 text-center tracking-tight" style={{ color: colors.textMain }}>
            Login Required
          </Text>
          <Text className="text-base mb-10 text-center px-4 leading-6 font-semibold" style={{ color: colors.textMuted }}>
            Login to your account to seamlessly manage your profile, orders, and wishlist.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="w-full py-4 rounded-xl items-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-lg tracking-wide">
              LOGIN NOW
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // 👉 Dynamic Background for Logged-In Mode
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      {/* 1400px Wrapper ensures consistent ultrawide centering */}
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Mobile Header */}
        {!isLargeScreen && (
          <View className="border-b z-10" style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}>
            <View className="w-full px-5 py-5 flex-row items-center">
              <Ionicons name="person" size={28} color={colors.primary} />
              <Text className="text-2xl font-bold tracking-tight ml-3" style={{ color: colors.primary }}>
                Profile
              </Text>
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          // Responsive padding: keeps mobile tab bar clear of the logout button
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingBottom: isLargeScreen ? 40 : TABBAR_HEIGHT + 40 
          }}
        >
          {/* Inner constraint (max-w-4xl) to keep lists professional on large screens */}
          <View className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8 flex-col">
            
            {/* User Info Card */}
            <View 
              className="p-5 border rounded-2xl shadow-sm flex-row items-center mb-6"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <View className="w-20 h-20 rounded-full items-center justify-center shadow-md shadow-pink-200" style={{ backgroundColor: colors.primary }}>
                <Text className="text-white text-2xl font-bold tracking-widest">
                  {getInitials(userData.name)}
                </Text>
              </View>
              <View className="ml-5 flex-1 justify-center">
                <Text
                  className="text-xl font-bold mb-1 tracking-tight"
                  numberOfLines={1}
                  style={{ color: colors.textMain }}
                >
                  {userData.name}
                </Text>
                <Text
                  className="text-base font-semibold"
                  numberOfLines={1}
                  style={{ color: colors.textMuted }}
                >
                  {userData.email}
                </Text>
              </View>
            </View>

            {/* Menu Items List */}
            <View 
              className="border rounded-2xl shadow-sm overflow-hidden mb-8"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center justify-between px-4 py-6 cursor-pointer group ${
                    index !== menuItems.length - 1 ? "border-b" : ""
                  }`}
                  style={{ 
                    borderBottomColor: index !== menuItems.length - 1 ? colors.border : 'transparent' 
                  }}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center transition-colors"
                      style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
                    >
                      <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                    </View>
                    <Text className="text-lg md:text-xl font-semibold ml-4 tracking-tight" style={{ color: colors.textMain }}>
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-xl shadow-sm hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer"
              style={{ backgroundColor: colors.primary }}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={22} color="#ffffff" />
              <Text className="ml-2.5 text-base md:text-lg font-bold text-white tracking-wider uppercase">
                Logout
              </Text>
            </TouchableOpacity>
            
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}