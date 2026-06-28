import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalContext } from "../context/GlobalContext";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  // Global Context se wishlist sync karne ke liye
  const { wishlistIds, setWishlistIds, fetchWishlistIds } = useGlobalContext();

  // States
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Refs for Auto-scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Fetch Product Details from Backend
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://10.132.253.253:5000/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.log("Error fetching product details:", error);
        Alert.alert("Error", "Could not load product details.");
      } {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // 2. Auto-scroll logic for Images
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      startAutoScroll();
    }
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [product, currentImageIndex]);

  const startAutoScroll = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    
    autoScrollTimer.current = setInterval(() => {
      if (product?.images && scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        setCurrentImageIndex(nextIndex);
      }
    }, 3500);
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);
  };

  // 3. Add to Bag Functionality
  const handleAddToBag = async () => {
    if (!selectedSize) {
      Alert.alert("Select Size", "Please select a size first!");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Login Required", "Please login to add items to your bag.");
        return;
      }

      await axios.post(
        "http://10.132.253.253:5000/api/bag",
        {
          productId: product._id,
          size: selectedSize,
          quantity: 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Added to Bag successfully!", [
        { text: "Go to Bag", onPress: () => router.push("/bag") },
        { text: "Continue Shopping" }
      ]);
    } catch (error) {
      console.log("Add to Bag Error:", error);
      Alert.alert("Error", "Failed to add item to bag.");
    }
  };

  // 4. Toggle Wishlist (Sync with Global Context)
  const toggleWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Login Required", "Please login to manage your wishlist.");
        return;
      }

      const isAlreadyWishlisted = wishlistIds.includes(product._id);

      if (isAlreadyWishlisted) {
        setWishlistIds((prev: string[]) => prev.filter((id) => id !== product._id));
        await axios.delete(`http://10.132.253.253:5000/api/wishlist/product/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        setWishlistIds((prev: string[]) => [...prev, product._id]);
        await axios.post(
          `http://10.132.253.253:5000/api/wishlist`, 
          { productId: product._id }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.log("Wishlist Toggle Error:", error);
      fetchWishlistIds(); // Error aane par wapas sync karo
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg font-bold text-neutral-500">Product not found</Text>
      </View>
    );
  }

  // ... (Upar ka saara logic same rahega)

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg font-bold text-neutral-500">Product not found</Text>
      </View>
    );
  }

  // ✅ BULLETPROOF FALLBACKS (Agar DB mein data missing ho toh yeh default use hoga)
  const displayImages = product.images?.length > 0 ? product.images : ["https://via.placeholder.com/800x800?text=No+Image"];
  const displaySizes = product.sizes?.length > 0 ? product.sizes : ["S", "M", "L", "XL"];
  const displayDescription = product.description || "Premium quality product. Experience the best in class comfort and style with this exclusive piece.";

  return (
    <View className="flex-1 bg-white">
      {/* Absolute Back Button */}
      <View className="absolute top-12 left-4 z-10 bg-white/80 p-2 rounded-full shadow-sm">
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
            {displayImages.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width, height: 520 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute bottom-5 w-full flex-row justify-center items-center">
            {displayImages.map((_: any, index: number) => (
              <View
                key={index}
                className={`mx-1 rounded-full ${
                  currentImageIndex === index ? "bg-white w-2.5 h-2.5" : "bg-white/50 w-2 h-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Product Details Section */}
        <View className="p-5">
          {/* Header Row */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xl font-extrabold text-neutral-900 mb-1">{product.brand || "Brand"}</Text>
              <Text className="text-base text-neutral-600 leading-5">{product.name || "Product Name"}</Text>
            </View>
            <TouchableOpacity className="p-2 bg-neutral-50 rounded-full" onPress={toggleWishlist}>
              <Ionicons 
                name={wishlistIds.includes(product._id) ? "heart" : "heart-outline"} 
                size={26} 
                color={wishlistIds.includes(product._id) ? "#ff3f6c" : "#71717a"} 
              />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View className="flex-row items-center mt-4 mb-4">
            <Text className="text-2xl font-black text-neutral-900 mr-3">₹{product.price || 999}</Text>
            {product.discount && <Text className="text-lg font-bold text-[#ff3f6c]">({product.discount})</Text>}
          </View>

          <View className="h-[1px] bg-neutral-100 my-2" />

          {/* Description */}
          <Text className="text-sm font-bold text-neutral-800 mt-2 mb-1">Product Details</Text>
          <Text className="text-neutral-600 leading-6 mb-6 text-[14px]">
            {displayDescription}
          </Text>

          {/* Size Selector */}
          <View className="mb-8">
            <Text className="text-sm font-bold text-neutral-800 mb-3 uppercase tracking-wider">Select Size</Text>
            <View className="flex-row flex-wrap gap-3">
              {displaySizes.map((size: string) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full border items-center justify-center ${
                    selectedSize === size ? "border-[#ff3f6c] bg-pink-50" : "border-neutral-200 bg-white"
                  }`}
                >
                  <Text className={`text-sm font-bold ${selectedSize === size ? "text-[#ff3f6c]" : "text-neutral-800"}`}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Bag Button */}
      <View className="px-4 py-3 bg-white border-t border-neutral-100 flex-row gap-3" style={{ paddingBottom: Platform.OS === 'ios' ? 32 : 16 }}>
        <TouchableOpacity
          onPress={handleAddToBag}
          className="bg-[#ff3f6c] py-4 rounded-xl flex-1 flex-row justify-center items-center shadow-md shadow-pink-200"
        >
          <Ionicons name="bag-outline" size={20} color="#fff" />
          <Text className="text-white text-base font-black ml-2 tracking-wide">ADD TO BAG</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}