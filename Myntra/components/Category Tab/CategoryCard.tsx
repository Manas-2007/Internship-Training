import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../app/context/ThemeContext";

interface Props {
  category: any;
  onSelectCategory: (category: any) => void;
}

export default function CategoryCard({ category, onSelectCategory }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <View className="mb-8">
      <TouchableOpacity className="px-4 cursor-pointer" onPress={() => onSelectCategory(category)} activeOpacity={0.9}>
        <Image 
          source={{ uri: category.bannerImage }} 
          className="w-full h-40 rounded-xl object-cover border" 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        />
      </TouchableOpacity>
      
      <Text className="text-2xl font-black px-4 mt-4 mb-3 tracking-tight" style={{ color: colors.textMain }}>
        {category.name}
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {category.subCategories.map((sub: string, index: number) => (
          <TouchableOpacity
            key={index}
            className="px-4 py-2 rounded-full mr-3 border transition-colors cursor-pointer"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#f5f5f5',
              borderColor: isDark ? '#334155' : 'transparent' 
            }}
            onPress={() => onSelectCategory(category)}
          >
            <Text className="font-medium" style={{ color: colors.textMuted }}>
              {sub}
            </Text>
          </TouchableOpacity>
        ))}
        <View className="w-4" />
      </ScrollView>
    </View>
  );
}