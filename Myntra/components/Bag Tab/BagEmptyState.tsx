import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";

export default function BagEmptyState() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center pt-20">
      <View 
        className="w-24 h-24 md:w-32 md:h-32 border shadow-sm rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Ionicons name="bag-handle-outline" size={48} color={colors.textMuted} />
      </View>
      <Text className="text-2xl md:text-3xl font-bold mb-3 tracking-tight" style={{ color: colors.textMain }}>
        Your bag is empty!
      </Text>
      <Text className="text-base md:text-lg font-medium text-center px-10" style={{ color: colors.textMuted }}>
        Explore our categories and add some items to your bag.
      </Text>
    </View>
  );
}