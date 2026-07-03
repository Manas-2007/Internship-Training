// components/Home/CategoryList.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


interface CategoryListProps {
  categories: any[];
  isLargeScreen: boolean;
}

export default function CategoryList({ categories, isLargeScreen }: CategoryListProps) {
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  return (
    <View className="mt-8 md:mt-12 w-full">
      <View className="max-w-6xl mx-auto w-full px-4 lg:px-4">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-5 md:mb-6 px-1 lg:px-0">
          <Text className="text-lg md:text-xl font-bold text-neutral-900 tracking-wide">
            SHOP BY CATEGORY
          </Text>
          <TouchableOpacity
            className="flex-row items-center cursor-pointer hover:opacity-70 transition-opacity"
            onPress={() => router.push("/categories")}
          >
            <Text className="text-[#ff3f6c] font-bold text-xs md:text-sm tracking-wide">VIEW ALL</Text>
            <Ionicons name="arrow-forward" size={14} color="#ff3f6c" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Categories Layout (Grid for Desktop, Scroll for Mobile) */}
        {isLargeScreen ? (
          <View className="flex-row flex-wrap justify-center gap-x-12 lg:gap-x-16 gap-y-8 px-4">
            {categories.map((cat: any) => (
              <TouchableOpacity
                key={cat._id}
                className="items-center group cursor-pointer w-24 md:w-28"
                activeOpacity={0.9}
                onPress={() => {
                  router.push({ pathname: "/categories", params: { categoryName: cat.name } });
                }}
              >
                <View className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white items-center justify-center shadow-md border-2 border-transparent group-hover:border-[#ff3f6c] transition-colors p-1">
                  <Image
                    source={{ uri: cat.image || "https://via.placeholder.com/150" }}
                    className="w-full h-full rounded-full object-cover"
                  />
                </View>
                <Text className="mt-3 text-sm font-bold text-neutral-800 tracking-tight text-center">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="overflow-visible"
            contentContainerStyle={{ paddingHorizontal: 4, paddingRight: 20 }}
          >
            {categories.map((cat: any) => (
              <TouchableOpacity
                key={cat._id}
                className="items-center mr-5 md:mr-6"
                activeOpacity={0.7}
                onPress={() => {
                  router.push({ pathname: "/categories", params: { categoryName: cat.name } });
                }}
              >
                <View className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white items-center justify-center shadow-sm border border-neutral-100 p-1">
                  <Image
                    source={{ uri: cat.image || "https://via.placeholder.com/150" }}
                    className="w-full h-full rounded-full object-cover"
                  />
                </View>
                <Text className="mt-2.5 text-[12px] md:text-sm font-bold text-neutral-700 tracking-tight">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}