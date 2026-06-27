import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";

interface Props {
  subCategories: string[];
  selectedSubCategory?: string | null;
  onSelect?: (sub: string) => void;
}

export default function SubcategoryPills({ subCategories, selectedSubCategory, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 px-4">
      {subCategories.map((sub, index) => {
        const isSelected = selectedSubCategory === sub;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect && onSelect(sub)}
            className={`px-4 py-2 rounded-full mr-3 border ${
              isSelected ? "bg-[#ff3f6c] border-[#ff3f6c]" : "bg-neutral-100 border-neutral-100"
            }`}
          >
            <Text className={`font-medium ${isSelected ? "text-white" : "text-neutral-700"}`}>
              {sub}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View className="w-4" />
    </ScrollView>
  );
}