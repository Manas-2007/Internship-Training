import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
// 👉 Import ThemeContext
import { useTheme } from "../../app/context/ThemeContext"; // Path adjust kar lena agar alag ho

interface Props {
  subCategories: string[];
  selectedSubCategory?: string | null;
  onSelect?: (sub: string) => void;
}

export default function SubcategoryPills({ subCategories, selectedSubCategory, onSelect }: Props) {
  // 👉 Extract colors and isDark
  const { colors, isDark } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 px-4">
      {subCategories.map((sub, index) => {
        const isSelected = selectedSubCategory === sub;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect && onSelect(sub)}
            activeOpacity={0.8}
            className="px-4 py-2 rounded-full mr-3 border transition-colors cursor-pointer"
            style={{
              backgroundColor: isSelected ? colors.primary : (isDark ? '#1e293b' : '#f5f5f5'),
              borderColor: isSelected ? colors.primary : (isDark ? '#334155' : 'transparent'),
            }}
          >
            <Text 
              className="font-medium" 
              style={{ color: isSelected ? '#ffffff' : colors.textMain }}
            >
              {sub}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View className="w-4" />
    </ScrollView>
  );
}