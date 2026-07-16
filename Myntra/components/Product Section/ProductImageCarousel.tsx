import React, { useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";

interface ProductImageCarouselProps {
  productImages: string[];
  currentImageWidth: number;
  currentImageHeight: number;
  isLargeScreen: boolean;
}

export default function ProductImageCarousel({
  productImages,
  currentImageWidth,
  currentImageHeight,
  isLargeScreen,
}: ProductImageCarouselProps) {
  const { colors, isDark } = useTheme();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const scrollToNext = (): void => {
    if (activeImageIndex < productImages.length - 1) {
      const nextIndex = activeImageIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * currentImageWidth,
        animated: true,
      });
      setActiveImageIndex(nextIndex);
    }
  };

  const scrollToPrev = (): void => {
    if (activeImageIndex > 0) {
      const prevIndex = activeImageIndex - 1;
      scrollRef.current?.scrollTo({
        x: prevIndex * currentImageWidth,
        animated: true,
      });
      setActiveImageIndex(prevIndex);
    }
  };

  return (
    <View style={{ width: isLargeScreen ? currentImageWidth : "100%" }}>
      <View
        style={{
          height: currentImageHeight,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
        className={`relative w-full overflow-hidden ${isLargeScreen ? "rounded-3xl border" : ""}`}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {productImages.map((img: string, index: number) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={{
                width: currentImageWidth,
                height: currentImageHeight,
              }}
              className="object-cover"
            />
          ))}
        </ScrollView>

        {activeImageIndex > 0 && (
          <TouchableOpacity
            onPress={scrollToPrev}
            activeOpacity={0.8}
            className="absolute left-4 top-1/2 -mt-6 w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center shadow-sm cursor-pointer transition-colors"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 41, 59, 0.8)"
                : "rgba(255,255,255,0.9)",
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textMain} />
          </TouchableOpacity>
        )}

        {activeImageIndex < productImages.length - 1 && (
          <TouchableOpacity
            onPress={scrollToNext}
            activeOpacity={0.8}
            className="absolute right-4 top-1/2 -mt-6 w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center shadow-sm cursor-pointer transition-colors"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 41, 59, 0.8)"
                : "rgba(255,255,255,0.9)",
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMain}
            />
          </TouchableOpacity>
        )}

        {/* Image Dots */}
        <View className="absolute bottom-6 w-full flex-row justify-center gap-2">
          {productImages.map((_: any, i: number) => (
            <View
              key={i}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 shadow-sm ${
                activeImageIndex === i ? "w-5 md:w-6" : "w-1.5 md:w-2"
              }`}
              style={{
                backgroundColor:
                  activeImageIndex === i
                    ? colors.primary
                    : "rgba(255,255,255,0.8)",
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
