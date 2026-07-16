import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../app/context/ThemeContext";

interface ProductSizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  setSelectedSize: (size: string) => void;
}

export default function ProductSizeSelector({
  sizes,
  selectedSize,
  setSelectedSize,
}: ProductSizeSelectorProps) {
  const { colors } = useTheme();

  return (
    <View
      className="mt-8 border-t pt-6 md:pt-8"
      style={{ borderTopColor: colors.border }}
    >
      <View className="flex-row justify-between items-center mb-4 md:mb-5">
        <Text
          className="text-base md:text-lg font-bold tracking-tight"
          style={{ color: colors.textMain }}
        >
          Select Size
        </Text>
        <TouchableOpacity className="cursor-pointer group" activeOpacity={0.7}>
          <Text
            className="font-bold text-xs md:text-sm tracking-wider uppercase group-hover:underline"
            style={{ color: colors.primary }}
          >
            SIZE CHART
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-3 md:gap-4">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <TouchableOpacity
              key={size}
              onPress={() => setSelectedSize(size)}
              activeOpacity={0.8}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full items-center justify-center border-[1.5px] cursor-pointer transition-all"
              style={{
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <Text
                className="font-bold text-sm md:text-base"
                style={{ color: isSelected ? "#ffffff" : colors.textMain }}
              >
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
