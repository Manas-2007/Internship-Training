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

const menuItems = [
  { icon: "cube", label: "Orders", route: "/orders" },
  { icon: "heart", label: "Wishlist", route: "/(tabs)/wishlist" },
  { icon: "card", label: "Payment Methods", route: "/payments" },
  { icon: "location", label: "Addresses", route: "/addresses" },
  { icon: "settings", label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6 w-full max-w-md mx-auto">
          <View className="w-24 h-24 bg-pink-50 rounded-full items-center justify-center mb-6 shadow-sm">
            <Ionicons name="person-outline" size={40} color="#ff3f6c" />
          </View>
          <Text className="text-3xl font-bold text-neutral-900 mb-3 text-center tracking-tight">
            Login Required
          </Text>
          <Text className="text-base text-neutral-500 mb-10 text-center px-4 leading-6 font-semibold">
            Login to your account to seamlessly manage your profile, orders, and wishlist.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-[#ff3f6c] w-full py-4 rounded-xl items-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
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
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* 1400px Wrapper ensures consistent ultrawide centering */}
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        <StatusBar style="dark" />

        {/* Mobile Header */}
        {!isLargeScreen && (
          <View className="bg-white border-b border-neutral-100 z-10">
            <View className="w-full px-5 py-5 flex-row items-center">
              <Ionicons name="person" size={28} color="#ff3f6c" />
              <Text className="text-2xl font-bold text-neutral-900 tracking-tight ml-3">
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
            <View className="bg-white p-5 border border-neutral-100 rounded-2xl shadow-sm flex-row items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-[#ff3f6c] items-center justify-center shadow-md shadow-pink-200">
                <Text className="text-white text-2xl font-bold tracking-widest">
                  {getInitials(userData.name)}
                </Text>
              </View>
              <View className="ml-5 flex-1 justify-center">
                <Text
                  className="text-xl font-bold text-neutral-900 mb-1 tracking-tight"
                  numberOfLines={1}
                >
                  {userData.name}
                </Text>
                <Text
                  className="text-neutral-500 text-base font-semibold"
                  numberOfLines={1}
                >
                  {userData.email}
                </Text>
              </View>
            </View>

            {/* Menu Items List */}
            <View className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden mb-8">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center justify-between px-4 py-6 ${
                    index !== menuItems.length - 1
                      ? "border-b border-neutral-50"
                      : ""
                  } hover:bg-neutral-50 active:bg-neutral-50 transition-colors cursor-pointer group`}
                  onPress={() => router.push(item.route as any)}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center group-hover:bg-pink-100 transition-colors">
                      <Ionicons name={item.icon as any} size={20} color="#ff3f6c" />
                    </View>
                    <Text className="text-lg md:text-xl font-semibold text-neutral-800 ml-4 tracking-tight">
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#a3a3a3" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-xl bg-[#ff3f6c] shadow-sm hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer"
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