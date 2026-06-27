import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";

interface Props {
  category: any;
  onSelectCategory: (category: any) => void;
}

export default function CategoryCard({ category, onSelectCategory }: Props) {
  return (
    <View className="mb-8">
      {/* Banner Image */}
      <TouchableOpacity className="px-4" onPress={() => onSelectCategory(category)}>
        <Image source={{ uri: category.bannerImage }} className="w-full h-40 rounded-xl object-cover" />
      </TouchableOpacity>
      
      {/* Category Title */}
      <Text className="text-2xl font-black text-neutral-800 px-4 mt-4 mb-3">
        {category.name}
      </Text>
      
      {/* Simple navigation pills for main list */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {category.subCategories.map((sub: string, index: number) => (
          <TouchableOpacity
            key={index}
            className="bg-neutral-100 px-4 py-2 rounded-full mr-3"
            onPress={() => onSelectCategory(category)}
          >
            <Text className="text-neutral-700 font-medium">{sub}</Text>
          </TouchableOpacity>
        ))}
        <View className="w-4" />
      </ScrollView>
    </View>
  );
}