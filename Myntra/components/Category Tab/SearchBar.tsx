import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar() {
  return (
    <View className="flex-row items-center bg-neutral-100 rounded-lg px-3 py-2 mx-4 my-3">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        placeholder="Search for products, brands and..."
        className="flex-1 ml-2 text-neutral-800"
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}