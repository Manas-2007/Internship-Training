import React, { useRef, useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../app/context/ThemeContext";

interface BannerProps {
  bannerData: { image: string; productId: string }[];
  sliderWidth: number;
  isLargeScreen: boolean;
}

export default function Banner({
  bannerData,
  sliderWidth,
  isLargeScreen,
}: BannerProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!bannerData || bannerData.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % bannerData.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * sliderWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex, sliderWidth, bannerData]);

  if (!bannerData || bannerData.length === 0) return null;

  return (
    <View
      className={`w-full max-w-6xl mx-auto overflow-hidden ${isLargeScreen ? "rounded-2xl shadow-sm mt-4" : "mt-2 px-4"}`}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / sliderWidth);
          setActiveIndex(index);
        }}
      >
        {bannerData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: isLargeScreen ? sliderWidth - 32 : sliderWidth - 32,
            }}
            activeOpacity={0.9}
            className="cursor-pointer group relative"
            onPress={() => router.push(`/product/${item.productId}`)}
          >
            <Image
              source={{ uri: item.image }}
              className={`w-full object-cover rounded-2xl ${isLargeScreen ? "h-[450px] group-hover:scale-[1.02] transition-transform duration-500" : "h-52 md:h-64"}`}
              style={{ backgroundColor: colors.surface }}
            />

            <View className="absolute inset-0 bg-black/25 rounded-2xl" />

            <View
              className={`absolute left-6 md:left-8 ${isLargeScreen ? "bottom-16" : "bottom-8"}`}
            >
              <Text
                className={`text-white font-extrabold tracking-wide ${isLargeScreen ? "text-5xl drop-shadow-md" : "text-2xl md:text-3xl"}`}
              >
                SUMMER
              </Text>
              <Text
                className={`text-white font-semibold tracking-widest ${isLargeScreen ? "text-2xl mt-2 drop-shadow-md" : "text-sm md:text-base mt-0.5"}`}
              >
                COLLECTION
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="absolute bottom-6 w-full flex-row justify-center gap-2.5">
        {bannerData.map((_, i) => (
          <View
            key={i}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "w-5 md:w-6 bg-white"
                : "w-1.5 md:w-2 bg-white/50"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
