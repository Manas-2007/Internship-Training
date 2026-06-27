import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock product data to test the UI (since we are ignoring backend)
const mockProducts: Record<string, any> = {
  "1": {
    id: 1,
    name: "Casual White T-Shirt",
    brand: "Roadster",
    price: 499,
    discount: "60% OFF",
    description:
      "Classic white t-shirt made from premium cotton. Perfect for everyday wear with a comfortable regular fit. Features a round neck and short sleeves.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop",
    ],
  }
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  // States
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Refs for Auto-scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch product (Mocking it for now. Defaulting to '1' if id is undefined for testing)
  const product = mockProducts[id as string] || mockProducts["1"];

  // Auto-scroll logic
  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, []);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      if (product && scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        setCurrentImageIndex(nextIndex);
      }
    }, 3000); // Scrolls every 3 seconds
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);

    // Reset auto-scroll timer when user manually scrolls
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }
    // Navigate to Bag tab for testing
    router.push("/(tabs)/bag");
  };

  const toggleWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        alert("Please login to add to wishlist!");
        return;
      }

      // Optimistic UI update (Instant toggle)
      setIsWishlisted(!isWishlisted);

      // Backend API Call
      await axios.post(
        "http://172.16.52.102:5000/api/wishlist",
        { productId: product.id }, // Product ID send kar rahe hain
        { headers: { Authorization: `Bearer ${token}` } } // Token yahan bhejna zaroori hai
      );
      
      console.log("Wishlist updated successfully!");
    } catch (error) {
      console.log("Wishlist error:", error);
      setIsWishlisted(isWishlisted); // Agar error aaye, wapas original state pe jao
      alert("Something went wrong!");
    }
  };

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg font-bold text-neutral-500">Product not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Absolute Back Button */}
      <View className="absolute top-12 left-4 z-10 bg-white/70 p-2 rounded-full">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3f3f46" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Image Carousel */}
        <View className="relative">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width, height: 500 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute bottom-5 w-full flex-row justify-center items-center">
            {product.images.map((_: any, index: number) => (
              <View
                key={index}
                className={`mx-1 rounded-full ${
                  currentImageIndex === index 
                    ? "bg-white w-2.5 h-2.5" 
                    : "bg-white/50 w-2 h-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Product Details Section */}
        <View className="p-5">
          {/* Header Row: Brand & Wishlist */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-neutral-500 mb-1">
                {product.brand}
              </Text>
              <Text className="text-2xl font-black text-neutral-800 leading-7">
                {product.name}
              </Text>
            </View>
            <TouchableOpacity 
              className="p-2"
             onPress={toggleWishlist}
              
            >
              <Ionicons 
                name={isWishlisted ? "heart" : "heart-outline"} 
                size={28} 
                color={isWishlisted ? "#ff3f6c" : "#71717a"} 
              />
            </TouchableOpacity>
          </View>

          {/* Price Row */}
          <View className="flex-row items-center mt-3 mb-4">
            <Text className="text-2xl font-black text-neutral-800 mr-3">
              ₹{product.price}
            </Text>
            <Text className="text-lg font-bold text-[#ff3f6c]">
              {product.discount}
            </Text>
          </View>

          {/* Description */}
          <Text className="text-base text-neutral-600 leading-6 mb-6">
            {product.description}
          </Text>

          {/* Size Selector */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-neutral-800 mb-3">
              Select Size
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {product.sizes.map((size: string) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  className={`w-14 h-14 rounded-full border items-center justify-center ${
                    selectedSize === size 
                      ? "border-[#ff3f6c] bg-pink-50" 
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  <Text 
                    className={`text-base font-bold ${
                      selectedSize === size ? "text-[#ff3f6c]" : "text-neutral-700"
                    }`}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer: Add to Bag */}
      <View 
        className="px-4 py-3 bg-white border-t border-neutral-100"
        style={{ paddingBottom: Platform.OS === 'ios' ? 30 : 15 }}
      >
        <TouchableOpacity
          onPress={handleAddToBag}
          className="bg-[#ff3f6c] py-4 rounded-xl flex-row justify-center items-center"
        >
          <Ionicons name="bag-outline" size={20} color="#fff" />
          <Text className="text-white text-lg font-bold ml-2 tracking-wide">
            ADD TO BAG
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}