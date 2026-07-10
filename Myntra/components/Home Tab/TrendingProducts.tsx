import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext"; 
interface TrendingProductsProps {
  products: any[];
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  getProductWidth: () => string;
  isLargeScreen: boolean;
}

export default function TrendingProducts({
  products,
  wishlistIds,
  toggleWishlist,
  getProductWidth,
  isLargeScreen,
}: TrendingProductsProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  if (!products || products.length === 0) return null;
  return (
    <View className="mt-10 md:mt-14 px-4 lg:px-8">
      <Text className="text-lg md:text-xl font-bold tracking-wide mb-6" style={{ color: colors.textMain }}>
        TRENDING NOW
      </Text>
      
      <View className="flex-row flex-wrap justify-start gap-[2%] gap-y-6 md:gap-y-8 mb-10 md:mb-20">
        {products.map((product: any) => (
          <TouchableOpacity
            key={product._id}
            style={{ 
              width: getProductWidth() as any, 
              backgroundColor: colors.surface, 
              borderColor: colors.border 
            }}
            className="rounded-2xl shadow-sm border overflow-hidden group cursor-pointer hover:shadow-md transition-shadow duration-300 hover:-translate-y-1"
            onPress={() => router.push(`/product/${product._id}`)}
            activeOpacity={0.9}
          >
            <View 
              className={`relative w-full overflow-hidden ${isLargeScreen ? "h-72" : "h-56 md:h-64"}`}
              style={{ backgroundColor: colors.background }}
            >
              <Image
                source={{ uri: product.images?.[0] }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Wishlist Button */}
              <TouchableOpacity
                className="absolute top-2.5 right-2.5 md:top-3 md:right-3 p-2 md:p-2.5 rounded-full shadow-sm transition-colors cursor-pointer z-10"
                style={{ backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)' }}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product._id);
                }}
              >
                <Ionicons
                  name={wishlistIds?.includes(product._id) ? "heart" : "heart-outline"}
                  size={18}
                  color={wishlistIds?.includes(product._id) ? colors.primary : colors.textMain}
                />
              </TouchableOpacity>

              {/* Discount Badge */}
              {product.discount && (
                <View 
                  className="absolute bottom-2.5 left-2.5 md:bottom-3 md:left-3 px-2 py-1 md:px-2.5 md:py-1.5 rounded shadow-sm"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-[10px] md:text-xs font-bold tracking-wider">
                    {product.discount}
                  </Text>
                </View>
              )}
            </View>

            {/* Product Details */}
            <View className="p-3 md:p-4">
              <Text
                className="text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1"
                style={{ color: colors.textMuted }}
                numberOfLines={1}
              >
                {product.brand}
              </Text>
              <Text
                className="text-sm md:text-base font-semibold mb-1.5 md:mb-2 leading-5"
                style={{ color: colors.textMain }}
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="font-bold text-base md:text-lg tracking-tight" style={{ color: colors.textMain }}>
                  ₹{product.price}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}