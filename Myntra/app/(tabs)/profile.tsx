import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const API_URL = "http://10.132.206.253:5000/api/auth/profile"; 
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
      } catch (error) {
        console.log("Profile Fetch Error", error);
        await AsyncStorage.removeItem("userToken");
        router.replace("/auth/login");
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
          router.replace("/auth/login"); 
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <StatusBar style="dark" />
      
      <View className="px-5 py-4 bg-white border-b border-neutral-100">
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="bg-white px-5 py-8 mb-3 border-b border-neutral-100">
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full bg-[#ff3f6c] items-center justify-center shadow-sm">
              <Text className="text-white text-3xl font-black">{getInitials(userData.name)}</Text>
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-2xl font-black text-neutral-800 mb-1" numberOfLines={1}>{userData.name}</Text>
              <Text className="text-neutral-500 text-sm font-medium" numberOfLines={1}>{userData.email}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white border-y border-neutral-100">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between px-5 py-4 ${
                index !== menuItems.length - 1 ? "border-b border-neutral-50" : ""
              } active:bg-neutral-50`}
              // 🚀 FIX: Ab saare options properly navigate karenge
              onPress={() => router.push(item.route as any)}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-neutral-50 items-center justify-center">
                  <Ionicons name={item.icon as any} size={20} color="#52525b" />
                </View>
                <Text className="text-base font-semibold text-neutral-700 ml-4">{item.label}</Text>
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
          <Text className="ml-2 text-lg font-bold text-[#ff3f6c] tracking-wide">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}