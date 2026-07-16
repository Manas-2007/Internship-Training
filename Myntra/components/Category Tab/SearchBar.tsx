import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";
export default function SearchBar() {
  const { colors, isDark } = useTheme();

  return (
    <View
      className="flex-row items-center rounded-lg px-3 py-2 mx-4 my-3 border transition-colors"
      style={{
        backgroundColor: isDark ? "#1e293b" : "#f5f5f5",
        borderColor: isDark ? "#334155" : "transparent",
      }}
    >
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        placeholder="Search for products, brands and..."
        className="flex-1 ml-2 outline-none"
        style={{ color: colors.textMain }}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}
