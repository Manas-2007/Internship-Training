// components/Home/TrendingProducts.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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

  if (!products || products.length === 0) return null;

  return (
    <View className="mt-10 md:mt-14 px-4 lg:px-8">
      <Text className="text-lg md:text-xl font-bold text-neutral-900 tracking-wide mb-6">
        TRENDING NOW
      </Text>
      
      <View className="flex-row flex-wrap justify-start gap-[2%] gap-y-6 md:gap-y-8 mb-10 md:mb-20">
        {products.map((product: any) => (
          <TouchableOpacity
            key={product._id}
            style={{ width: getProductWidth() as any }}
            className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow duration-300 hover:-translate-y-1"
            onPress={() => router.push(`/product/${product._id}`)}
            activeOpacity={0.9}
          >
            <View className={`relative w-full bg-neutral-100 overflow-hidden ${isLargeScreen ? "h-72" : "h-56 md:h-64"}`}>
              <Image
                source={{ uri: product.images?.[0] }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Wishlist Button */}
              <TouchableOpacity
                className="absolute top-2.5 right-2.5 md:top-3 md:right-3 p-2 md:p-2.5 bg-white/90 hover:bg-white rounded-full backdrop-blur-md shadow-sm transition-colors cursor-pointer z-10"
                onPress={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product._id);
                }}
              >
                <Ionicons
                  name={wishlistIds?.includes(product._id) ? "heart" : "heart-outline"}
                  size={18}
                  color={wishlistIds?.includes(product._id) ? "#ff3f6c" : "#171717"}
                />
              </TouchableOpacity>

              {product.discount && (
                <View className="absolute bottom-2.5 left-2.5 md:bottom-3 md:left-3 bg-[#ff3f6c] px-2 py-1 md:px-2.5 md:py-1.5 rounded shadow-sm">
                  <Text className="text-white text-[10px] md:text-xs font-bold tracking-wider">
                    {product.discount}
                  </Text>
                </View>
              )}
            </View>

            <View className="p-3 md:p-4">
              <Text
                className="text-neutral-500 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1"
                numberOfLines={1}
              >
                {product.brand}
              </Text>
              <Text
                className="text-neutral-900 text-sm md:text-base font-semibold mb-1.5 md:mb-2 leading-5"
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-neutral-900 font-bold text-base md:text-lg tracking-tight">
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