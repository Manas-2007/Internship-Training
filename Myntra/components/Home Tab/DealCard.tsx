import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../app/context/ThemeContext";

interface DealsSectionProps {
  deals: any[];
  isLargeScreen: boolean;
  isDesktop: boolean;
}

export default function DealsSection({ deals, isLargeScreen, isDesktop }: DealsSectionProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  if (!deals || deals.length === 0) return null;

  return (
    <View 
      className="mt-10 md:mt-12 py-8 md:py-10 px-4 lg:px-8 rounded-2xl mx-2 md:mx-4 lg:mx-0 border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <Text className="text-lg md:text-xl font-bold tracking-wide mb-5 md:mb-6 px-1" style={{ color: colors.textMain }}>
        DEALS OF THE DAY
      </Text>
      
      {isLargeScreen ? (
        <View className="flex-row flex-wrap justify-between gap-y-6">
          {deals.map((deal: any, index: number) => (
            <TouchableOpacity
              key={deal._id || index}
              style={{ width: isDesktop ? "32%" : "48%", borderColor: colors.border }}
              className="h-64 rounded-2xl overflow-hidden relative shadow-sm border group cursor-pointer"
              activeOpacity={0.9}
              onPress={() => {
                if (deal.productId) {
                  router.push(`/product/${deal.productId}`);
                } else {
                  showMessage("Coming Soon", "Deal link will be available shortly.");
                }
              }}
            >
              <Image
                source={{ uri: deal.image }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundColor: colors.background }}
              />
              
              <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 justify-end">
                <View className="bg-white/20 self-start px-3 py-1.5 rounded border border-white/30 backdrop-blur-md mb-2">
                  <Text className="text-white text-xs font-bold tracking-widest uppercase">
                    Limited Offer
                  </Text>
                </View>
                <Text className="text-white text-xl md:text-2xl font-bold drop-shadow-md">
                  {deal.title}
                </Text>
                <Text className="text-white/90 text-sm md:text-base font-medium mt-1 drop-shadow-sm">
                  {deal.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {deals.map((deal: any, index: number) => (
            <TouchableOpacity
              key={deal._id || index}
              className="mr-4 w-64 md:w-72 h-40 md:h-48 rounded-xl md:rounded-2xl overflow-hidden relative shadow-sm border"
              style={{ borderColor: colors.border }}
              activeOpacity={0.9}
              onPress={() => {
                if (deal.productId) {
                  router.push(`/product/${deal.productId}`);
                } else {
                  showMessage("Coming Soon", "Deal link will be available shortly.");
                }
              }}
            >
              <Image
                source={{ uri: deal.image }}
                className="w-full h-full object-cover"
                style={{ backgroundColor: colors.background }}
              />
              
              <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 md:p-5 justify-end">
                <View className="bg-white/20 self-start px-2 py-1 rounded border border-white/30 backdrop-blur-md mb-1.5">
                  <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
                    Limited Offer
                  </Text>
                </View>
                <View>
                  <Text className="text-white text-base md:text-lg font-bold shadow-sm">
                    {deal.title}
                  </Text>
                  <Text className="text-white/90 text-xs md:text-sm font-medium mt-0.5">
                    {deal.subtitle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}