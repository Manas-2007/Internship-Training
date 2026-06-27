import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Dummy user data (since we are bypassing auth for now)
const user = {
  name: "John Doe",
  email: "john.doe@example.com",
};

// Menu items mapped to Ionicons
const menuItems = [
  { icon: "cube-outline", label: "Orders", route: "/orders" },
  { icon: "heart-outline", label: "Wishlist", route: "/(tabs)/wishlist" },
  { icon: "card-outline", label: "Payment Methods", route: "/payments" },
  { icon: "location-outline", label: "Addresses", route: "/addresses" },
  { icon: "settings-outline", label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();

  const handleLogout = () => {
    // Abhi ke liye seedha login screen par bhej rahe hain
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-neutral-100">
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">
          Profile
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* User Info Section */}
        <View className="flex-row items-center px-4 py-6 border-b border-neutral-100 bg-white">
          <View className="w-20 h-20 rounded-full bg-[#ff3f6c] items-center justify-center shadow-sm">
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View className="ml-5">
            <Text className="text-2xl font-black text-neutral-800 mb-1">
              {user.name}
            </Text>
            <Text className="text-neutral-500 text-sm font-medium">
              {user.email}
            </Text>
          </View>
        </View>

        {/* Menu Section */}
        <View className="mt-2">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-neutral-50 active:bg-neutral-50"
              onPress={() => {
                // Ignore navigation for upcoming routes right now
                if (item.route === "/(tabs)/wishlist") {
                  router.push(item.route as any);
                }
              }}
            >
              <View className="flex-row items-center">
                <View className="w-8 items-center">
                  <Ionicons name={item.icon as any} size={24} color="#3f3f46" />
                </View>
                <Text className="text-base font-semibold text-neutral-700 ml-3">
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          className="flex-row items-center justify-center py-4 mt-8 mb-10 mx-4 rounded-2xl border-2 border-[#ff3f6c] bg-white active:bg-pink-50"
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