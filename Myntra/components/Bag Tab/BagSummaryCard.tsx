import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";

interface BagSummaryCardProps {
  variant: "desktop" | "mobile";
  totalAmount: number;
  isValidating: boolean;
  isDisabled: boolean;
  handleCheckout: () => void;
  bottomPadding?: number;
}

export default function BagSummaryCard({
  variant,
  totalAmount,
  isValidating,
  isDisabled,
  handleCheckout,
  bottomPadding = 0,
}: BagSummaryCardProps) {
  const { colors, isDark } = useTheme();

  if (variant === "desktop") {
    return (
      <View
        className="p-6 rounded-2xl border shadow-sm"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-row items-center mb-6">
          <Ionicons name="receipt" size={20} color={colors.primary} />
          <Text
            className="text-lg md:text-xl font-bold ml-2.5 tracking-tight"
            style={{ color: colors.textMain }}
          >
            Price Details
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text
            className="text-sm md:text-base font-medium"
            style={{ color: colors.textMuted }}
          >
            Total MRP
          </Text>
          <Text
            className="font-semibold text-sm md:text-base"
            style={{ color: colors.textMain }}
          >
            ₹{totalAmount}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text
            className="text-sm md:text-base font-medium"
            style={{ color: colors.textMuted }}
          >
            Platform Fee
          </Text>
          <Text
            className="font-semibold text-sm md:text-base"
            style={{ color: isDark ? "#34d399" : "#059669" }}
          >
            FREE
          </Text>
        </View>

        <View
          className="flex-row justify-between mb-6 pb-6 border-b border-dashed"
          style={{ borderBottomColor: colors.border }}
        >
          <Text
            className="text-sm md:text-base font-medium"
            style={{ color: colors.textMuted }}
          >
            Shipping Fee
          </Text>
          <Text
            className="font-semibold text-sm md:text-base"
            style={{ color: isDark ? "#34d399" : "#059669" }}
          >
            FREE
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-8 pt-1">
          <Text
            className="font-bold text-base md:text-lg"
            style={{ color: colors.textMain }}
          >
            Total Amount
          </Text>
          <Text
            className="font-bold text-xl md:text-2xl tracking-tight"
            style={{ color: colors.textMain }}
          >
            ₹{totalAmount}
          </Text>
        </View>

        <TouchableOpacity
          className="w-full py-4 rounded-xl items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
          style={{
            backgroundColor: isDisabled ? colors.border : colors.primary,
          }}
          onPress={handleCheckout}
          disabled={isDisabled}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-sm md:text-base tracking-widest uppercase">
              PLACE ORDER
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-4 border-t shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)] z-50"
      style={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingBottom: bottomPadding,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text
          className="font-semibold text-sm"
          style={{ color: colors.textMuted }}
        >
          Total Amount
        </Text>
        <Text
          className="font-bold text-xl tracking-tight"
          style={{ color: colors.textMain }}
        >
          ₹{totalAmount}
        </Text>
      </View>
      <TouchableOpacity
        className="w-full py-4 rounded-xl items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
        style={{ backgroundColor: isDisabled ? colors.border : colors.primary }}
        onPress={handleCheckout}
        disabled={isDisabled}
      >
        {isValidating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-bold text-sm tracking-widest uppercase">
            PLACE ORDER
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
