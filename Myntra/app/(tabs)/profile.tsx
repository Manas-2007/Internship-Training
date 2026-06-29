import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

  const handleLogout = () => {
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
  };

  const getInitials = (name: string) => {
    if (!name) return "";
   const names = name.trim().split(" ").filter(n => n.length > 0);

  if (names.length === 0) return "";

  if (names.length === 1) {
    return names[0][0].toUpperCase();
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="w-28 h-28 bg-pink-50 rounded-full items-center justify-center mb-6">
          <Ionicons name="person-outline" size={48} color="#ff3f6c" />
        </View>
        <Text className="text-3xl font-black text-neutral-800 mb-3 text-center tracking-tight">
          Login Required
        </Text>
        <Text className="text-base text-neutral-500 mb-10 text-center px-4 leading-6 font-medium">
          Login your account to use this feature and seamlessly manage your profile, orders, and wishlist.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          className="bg-[#ff3f6c] w-full py-4 rounded-2xl items-center shadow-sm"
        >
          <Text className="text-white font-black text-lg tracking-widest">
            LOGIN NOW
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <StatusBar style="dark" />

      <View className="px-5 py-4 bg-white border-b border-neutral-100">
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">
          Profile
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="bg-white px-5 py-8 mb-3 border-b border-neutral-100">
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full bg-[#ff3f6c] items-center justify-center shadow-sm">
              <Text className="text-white text-3xl font-black">
                {getInitials(userData.name)}
              </Text>
            </View>
            <View className="ml-5 flex-1">
              <Text
                className="text-2xl font-black text-neutral-800 mb-1"
                numberOfLines={1}
              >
                {userData.name}
              </Text>
              <Text
                className="text-neutral-500 text-sm font-medium"
                numberOfLines={1}
              >
                {userData.email}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white border-y border-neutral-100">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between px-5 py-4 ${
                index !== menuItems.length - 1
                  ? "border-b border-neutral-50"
                  : ""
              } active:bg-neutral-50`}
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
              <Ionicons name="chevron-forward" size={20} color="#d4d4d8" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 mt-8 mb-12 mx-5 rounded-2xl bg-white border border-[#ff3f6c] shadow-sm active:bg-pink-50"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ff3f6c" />
          <Text className="ml-2 text-lg font-bold text-[#ff3f6c] tracking-wide">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}