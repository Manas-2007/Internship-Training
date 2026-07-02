import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

interface RecentlyViewedProps {
  recentlyViewed: any[];
  isLargeScreen: boolean;
}

export default function RecentlyViewedSection({ recentlyViewed, isLargeScreen }: RecentlyViewedProps) {
  const router = useRouter();

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  return (
    <View className="mt-10 px-4 lg:px-8">
      <Text className="text-lg md:text-xl font-bold text-neutral-900 tracking-wide mb-6">
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
            className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden mr-4 cursor-pointer hover:shadow-md transition-shadow duration-300"
            style={{ width: isLargeScreen ? 200 : 140 }}
            onPress={() => router.push(`/product/${product._id}`)}
            activeOpacity={0.9}
          >
            <View className={`w-full bg-neutral-100 ${isLargeScreen ? "h-48" : "h-36"}`}>
              <Image 
                source={{ uri: product.images?.[0] || product.image }} 
                className="w-full h-full object-cover" 
              />
            </View>
            <View className="p-2 md:p-3">
              <Text 
                className="text-neutral-500 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1" 
                numberOfLines={1}
              >
                {product.brand}
              </Text>
              <Text 
                className="text-neutral-900 text-xs md:text-sm font-semibold mb-1" 
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text className="text-neutral-900 font-bold text-sm md:text-base">
                ₹{product.price}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}