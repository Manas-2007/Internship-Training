import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../app/context/ThemeContext";

interface RecentlyViewedProps {
  recentlyViewed: any[];
  isLargeScreen: boolean;
}

export default function RecentlyViewedSection({
  recentlyViewed,
  isLargeScreen,
}: RecentlyViewedProps) {
  const router = useRouter();
  const { colors } = useTheme();

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  return (
    <View className="mt-10 px-4 lg:px-8">
      <Text
        className="text-lg md:text-xl font-bold tracking-wide mb-6"
        style={{ color: colors.textMain }}
      >
        RECENTLY VIEWED
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {recentlyViewed.map((product: any) => (
          <TouchableOpacity
            key={product._id}
            className="rounded-xl shadow-sm border overflow-hidden mr-4 cursor-pointer hover:shadow-md transition-shadow duration-300"
            style={{
              width: isLargeScreen ? 200 : 140,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            onPress={() => router.push(`/product/${product._id}`)}
            activeOpacity={0.9}
          >
            <View
              className={`w-full ${isLargeScreen ? "h-48" : "h-36"}`}
              style={{ backgroundColor: colors.background }}
            >
              <Image
                source={{ uri: product.images?.[0] || product.image }}
                className="w-full h-full object-cover"
              />
            </View>
            <View className="p-2 md:p-3">
              <Text
                className="text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1"
                style={{ color: colors.textMuted }}
                numberOfLines={1}
              >
                {product.brand}
              </Text>
              <Text
                className="text-xs md:text-sm font-semibold mb-1"
                style={{ color: colors.textMain }}
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text
                className="font-bold text-sm md:text-base"
                style={{ color: colors.textMain }}
              >
                ₹{product.price}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
