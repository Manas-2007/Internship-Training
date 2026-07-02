import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "../context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";

interface Product {
  _id: string;
  brand: string;
  name: string;
  price: number | string;
  description: string;
  images?: string[];
  image?: string;
  discount?: string;
}

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { products, wishlistIds, setWishlistIds, recordProductView } = useGlobalContext();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

  // Updated to match the 1400px global lock
  const maxContentWidth = 1400; 
  const availableWidth = Math.min(width, maxContentWidth);
  const horizontalPadding = isLargeScreen ? 64 : 0; // px-8 is 32px on each side
  const gap = isLargeScreen ? 48 : 0; // gap-12 is 48px
  const innerContentWidth = availableWidth - horizontalPadding - gap;

  // Responsive Width & Height Calculations
  const currentImageWidth = isDesktop 
    ? innerContentWidth * 0.5 
    : isTablet 
    ? innerContentWidth * 0.45 
    : width;
    
  const textContainerWidth = isDesktop 
    ? innerContentWidth * 0.5 
    : isTablet 
    ? innerContentWidth * 0.55 
    : width;

  const currentImageHeight = isDesktop ? 650 : isTablet ? 550 : 500;

  const product: Product = products?.find((p: Product) => p._id === id) || {
    _id: id as string,
    brand: "Loading...",
    name: "Fetching product details",
    price: "0",
    description: "",
    images: ["https://via.placeholder.com/600"],
  };

  // --- RECENTLY VIEWED TRIGGER ---
  useEffect(() => {
    if (product && product.brand !== "Loading...") {
      recordProductView(product);
    }
  }, [product._id, product.brand]);

  const productImages: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ["https://via.placeholder.com/600"];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const sizes: string[] = ["S", "M", "L", "XL", "XXL"];
  const [isAddingToBag, setIsAddingToBag] = useState<boolean>(false);

  const isWishlisted: boolean = wishlistIds?.includes(product._id);

  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleScroll = (event: any): void => {
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

  const handleWishlistToggle = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showMessage("Login Required", "Please login to manage your wishlist.");
        return;
      }

      if (isWishlisted) {
        setWishlistIds((prev: string[]) =>
          prev.filter((wishId) => wishId !== product._id)
        );

        await axios.delete(`${API_URL}/api/wishlist/product/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        setWishlistIds((prev: string[]) => [...prev, product._id]);

        await axios.post(
          `${API_URL}/api/wishlist`,
          { productId: product._id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      showMessage("Error", "Could not update wishlist.");
    }
  };

  const addToBag = async (): Promise<void> => {
    try {
      setIsAddingToBag(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showMessage("Login Required", "Please login to add items to your bag.");
        setIsAddingToBag(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;

      await axios.post(`${API_URL}/api/bag`, {
        userId: userId,
        productId: product._id,
        size: selectedSize,
        quantity: 1,
      });

      showMessage("Success", "Added to your bag!");
    } catch (error) {
      showMessage("Error", "Could not add item to bag.");
    } finally {
      setIsAddingToBag(false);
    }
  };

  const ActionButtons = () => (
    <View
      className={
        isLargeScreen
          ? "flex-row justify-between items-center mt-10"
          : "absolute bottom-0 left-0 right-0 w-full bg-white border-t border-neutral-100 px-4 pt-3 flex-row justify-between items-center shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)] z-50"
      }
      style={!isLargeScreen ? { paddingBottom: Math.max(insets.bottom + 12, 16) } : {}}
    >
      <TouchableOpacity
        onPress={handleWishlistToggle}
        className={`w-[18%] md:w-[15%] items-center justify-center border-[1.5px] h-14 rounded-xl cursor-pointer transition-colors ${
          isWishlisted
            ? "border-[#ff3f6c] bg-pink-50"
            : "border-neutral-200 hover:bg-neutral-50"
        }`}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isWishlisted ? "heart" : "heart-outline"}
          size={26}
          color={isWishlisted ? "#ff3f6c" : "#404040"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="w-[78%] md:w-[82%] bg-[#ff3f6c] h-14 rounded-xl flex-row items-center justify-center shadow-sm shadow-pink-200 hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer"
        onPress={addToBag}
        disabled={isAddingToBag}
        activeOpacity={0.9}
      >
        {isAddingToBag ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="bag-handle-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-sm md:text-base ml-2.5 tracking-widest uppercase">
              ADD TO BAG
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      
      {/* 1400px Global Wrapper */}
      <View className="w-full max-w-[1400px] mx-auto flex-1 relative bg-white">
        
        {/* Floating Back Button */}
        <View className={`absolute z-20 ${isLargeScreen ? "top-6 left-6" : "top-4 left-4"}`}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="p-2.5 md:p-3 bg-white/90 rounded-full shadow-sm backdrop-blur-md cursor-pointer hover:bg-white transition-colors border border-neutral-100"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          // Add massive bottom padding for mobile to clear the sticky footer
          contentContainerStyle={{ flexGrow: 1, paddingBottom: isLargeScreen ? 60 : insets.bottom + 120 }}
          bounces={false}
        >
          <View className={`w-full ${isLargeScreen ? "flex-row px-8 pt-8 gap-12" : "flex-col"}`}>
            
            {/* Image Section */}
            <View style={{ width: isLargeScreen ? currentImageWidth : "100%" }}>
              <View
                style={{ height: currentImageHeight }}
                className={`relative w-full bg-neutral-50 overflow-hidden ${
                  isLargeScreen ? "rounded-3xl border border-neutral-100" : ""
                }`}
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
                    className="absolute left-4 top-1/2 -mt-6 w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full items-center justify-center shadow-sm cursor-pointer hover:bg-white transition-colors"
                  >
                    <Ionicons name="chevron-back" size={20} color="#171717" />
                  </TouchableOpacity>
                )}

                {activeImageIndex < productImages.length - 1 && (
                  <TouchableOpacity
                    onPress={scrollToNext}
                    activeOpacity={0.8}
                    className="absolute right-4 top-1/2 -mt-6 w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full items-center justify-center shadow-sm cursor-pointer hover:bg-white transition-colors"
                  >
                    <Ionicons name="chevron-forward" size={20} color="#171717" />
                  </TouchableOpacity>
                )}

                {/* Image Dots */}
                <View className="absolute bottom-6 w-full flex-row justify-center gap-2">
                  {productImages.map((_: any, i: number) => (
                    <View
                      key={i}
                      className={`h-1.5 md:h-2 rounded-full transition-all duration-300 shadow-sm ${
                        activeImageIndex === i
                          ? "w-5 md:w-6 bg-[#ff3f6c]"
                          : "w-1.5 md:w-2 bg-white/80"
                      }`}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Product Details Section */}
            <View
              style={{ width: isLargeScreen ? textContainerWidth : "100%" }}
              className={isLargeScreen ? "px-2 py-4" : "p-5"}
            >
              <Text className="text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-1.5 md:mb-2">
                {product.brand}
              </Text>
              <Text className="text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 tracking-tight leading-snug">
                {product.name}
              </Text>

              <View className="flex-row items-center mt-4 md:mt-5">
                <Text className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                  ₹{product.price}
                </Text>
                {product.discount && (
                  <Text className="text-[#ff3f6c] font-bold ml-3 md:ml-4 bg-pink-50 px-2.5 py-1 rounded-md text-xs md:text-sm tracking-wide">
                    {product.discount}
                  </Text>
                )}
              </View>
              <Text className="text-[10px] md:text-xs text-emerald-600 mt-1.5 font-bold uppercase tracking-widest">
                Inclusive of all taxes
              </Text>

              {/* Size Selector */}
              <View className="mt-8 border-t border-neutral-100 pt-6 md:pt-8">
                <View className="flex-row justify-between items-center mb-4 md:mb-5">
                  <Text className="text-base md:text-lg font-bold text-neutral-900 tracking-tight">
                    Select Size
                  </Text>
                  <TouchableOpacity className="cursor-pointer group">
                    <Text className="text-[#ff3f6c] font-bold text-xs md:text-sm tracking-wider uppercase group-hover:underline">
                      SIZE CHART
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row flex-wrap gap-3 md:gap-4">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <TouchableOpacity
                        key={size}
                        onPress={() => setSelectedSize(size)}
                        activeOpacity={0.8}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full items-center justify-center border-[1.5px] cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#ff3f6c] bg-[#ff3f6c] shadow-sm shadow-pink-200"
                            : "border-neutral-200 bg-white hover:border-neutral-400"
                        }`}
                      >
                        <Text
                          className={`font-bold text-sm md:text-base ${
                            isSelected ? "text-white" : "text-neutral-700"
                          }`}
                        >
                          {size}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View className="mt-8 border-t border-neutral-100 pt-6 md:pt-8">
                <Text className="text-base md:text-lg font-bold text-neutral-900 tracking-tight mb-3">
                  Product Details
                </Text>
                <Text className="text-neutral-600 leading-relaxed text-sm md:text-base font-medium">
                  {product.description}
                </Text>
              </View>

              {/* Desktop Render Action Buttons Inline */}
              {isLargeScreen && <ActionButtons />}
            </View>
          </View>
        </ScrollView>

        {/* Mobile Render Action Buttons absolute bottom */}
        {!isLargeScreen && <ActionButtons />}
      </View>
    </SafeAreaView>
  );
}