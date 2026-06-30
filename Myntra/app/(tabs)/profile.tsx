import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api"; 
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StatusBar } from "expo-status-bar";

const menuItems = [
  { icon: "cube-outline", label: "Orders", route: "/orders" },
  { icon: "heart-outline", label: "Wishlist", route: "/(tabs)/wishlist" },
  { icon: "card-outline", label: "Payment Methods", route: "/payments" },
  { icon: "location-outline", label: "Addresses", route: "/addresses" },
  { icon: "settings-outline", label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

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
    // Web requires a standard browser confirmation
    if (Platform.OS === "web") {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (confirmLogout) {
        await AsyncStorage.removeItem("userToken");
        setIsGuest(true);
      }
    } else {
      // Mobile uses the native Alert component
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            setIsGuest(true);
          },
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

  // -------------------------------------------------------------
  // GUEST VIEW
  // -------------------------------------------------------------
  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6 w-full max-w-md mx-auto">
          <View className="w-24 h-24 bg-pink-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="person-outline" size={40} color="#ff3f6c" />
          </View>
          {/* Changed from font-black to font-bold */}
          <Text className="text-2xl font-bold text-neutral-800 mb-3 text-center tracking-tight">
            Login Required
          </Text>
          <Text className="text-base text-neutral-500 mb-10 text-center px-4 leading-6">
            Login to your account to seamlessly manage your profile, orders, and wishlist.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-[#ff3f6c] w-full py-4 rounded-xl items-center shadow-sm hover:opacity-90 transition-opacity"
          >
            {/* Changed from font-black to font-bold */}
            <Text className="text-white font-bold text-lg tracking-wide">
              LOGIN NOW
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // LOGGED IN VIEW
  // -------------------------------------------------------------
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header Area */}
      <View className="bg-white border-b border-neutral-100 items-center">
        {/* Tightened max-width from 2xl to lg */}
        <View className="w-full max-w-lg px-5 py-4">
          <Text className="text-2xl font-bold text-neutral-800 tracking-tight text-center sm:text-left">
            Profile
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }} 
      >
        <View className="w-full max-w-lg mt-5 px-5 sm:px-0">
          
          {/* User Profile Card */}
          <View className="bg-white px-5 py-6 mb-5 border border-neutral-100 rounded-2xl shadow-sm">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-[#ff3f6c] items-center justify-center shadow-sm">
                <Text className="text-white text-xl font-bold">
                  {getInitials(userData.name)}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                {/* Changed font weights */}
                <Text
                  className="text-xl font-bold text-neutral-800 mb-1"
                  numberOfLines={1}
                >
                  {userData.name}
                </Text>
                <Text
                  className="text-neutral-500 text-sm"
                  numberOfLines={1}
                >
                  {userData.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Settings / Menu List */}
          <View className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center justify-between px-5 py-4 ${
                  index !== menuItems.length - 1
                    ? "border-b border-neutral-100"
                    : ""
                } active:bg-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors`}
                onPress={() => router.push(item.route as any)}
              >
                <View className="flex-row items-center">
                  <View className="w-9 h-9 rounded-full bg-neutral-50 items-center justify-center">
                    <Ionicons name={item.icon as any} size={20} color="#52525b" />
                  </View>
                  <Text className="text-base font-semibold text-neutral-700 ml-4">
                    {item.label}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#d4d4d8" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 rounded-xl bg-white border border-[#ff3f6c] shadow-sm active:bg-pink-50 hover:bg-pink-50 cursor-pointer transition-colors"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff3f6c" />
            <Text className="ml-2 text-base font-bold text-[#ff3f6c] tracking-wide">
              Logout
            </Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}