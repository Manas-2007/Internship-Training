import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";

interface ProductActionButtonsProps {
  isLargeScreen: boolean;
  isWishlisted: boolean;
  isAddingToBag: boolean;
  handleWishlistToggle: () => void;
  addToBag: () => void;
  bottomPadding: number;
}

export default function ProductActionButtons({
  isLargeScreen,
  isWishlisted,
  isAddingToBag,
  handleWishlistToggle,
  addToBag,
  bottomPadding,
}: ProductActionButtonsProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className={
        isLargeScreen
          ? "flex-row justify-between items-center mt-10"
          : "absolute bottom-0 left-0 right-0 w-full px-4 pt-3 flex-row justify-between items-center border-t shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)] z-50"
      }
      style={
        !isLargeScreen
          ? {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: bottomPadding,
            }
          : {}
      }
    >
      <TouchableOpacity
        onPress={handleWishlistToggle}
        className="w-[18%] md:w-[15%] items-center justify-center border-[1.5px] h-14 rounded-xl cursor-pointer transition-colors shadow-sm"
        style={{
          borderColor: isWishlisted ? colors.primary : colors.border,
          backgroundColor: isWishlisted
            ? isDark
              ? "#3f1d2b"
              : "#fdf2f8"
            : colors.surface,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isWishlisted ? "heart" : "heart-outline"}
          size={26}
          color={isWishlisted ? colors.primary : colors.textMain}
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="w-[78%] md:w-[82%] h-14 rounded-xl flex-row items-center justify-center shadow-sm shadow-pink-200 hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer"
        style={{ backgroundColor: colors.primary }}
        onPress={addToBag}
        disabled={isAddingToBag}
        activeOpacity={0.9}
      >
        {isAddingToBag ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="bag-handle-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-sm md:text-base ml-2.5 tracking-widest uppercase">
              ADD TO BAG
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}