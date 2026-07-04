import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
// 👉 Import ThemeContext
import { useTheme } from "../../app/context/ThemeContext"; // Adjust path as per your folder structure

interface Props {
  product: any;
}

export default function ProductCard({ product }: Props) {
  // 👉 Extract colors
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      className="w-[48%] mb-4 rounded-lg overflow-hidden border transition-shadow hover:shadow-md cursor-pointer"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: product.image }} 
        className="w-full h-48 object-cover" 
        style={{ backgroundColor: colors.background }} // Placeholder background
      />
      <View className="p-3">
        <Text className="text-xs font-bold mb-1" style={{ color: colors.textMuted }}>
          {product.brand}
        </Text>
        <Text className="text-sm font-medium mb-1" numberOfLines={1} style={{ color: colors.textMain }}>
          {product.name}
        </Text>
        <View className="flex-row items-center">
          <Text className="font-bold mr-2" style={{ color: colors.textMain }}>
            {product.price}
          </Text>
          <Text className="text-xs font-bold" style={{ color: colors.primary }}>
            {product.discount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}