import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, useWindowDimensions, StatusBar, Alert, Platform, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "../context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";
import { useTheme } from "../context/ThemeContext";

// Modular Components
import ProductImageCarousel from "../../components/Product Section/ProductImageCarousel";
import ProductHeader from "../../components/Product Section/ProductHeader";
import ProductSizeSelector from "../../components/Product Section/ProductSizeSelector";
import ProductActionButtons from "../../components/Product Section/ProductActionButtons";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { products, wishlistIds, setWishlistIds, recordProductView } = useGlobalContext();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

  const maxContentWidth = 1400;
  const availableWidth = Math.min(width, maxContentWidth);
  const horizontalPadding = isLargeScreen ? 64 : 0;
  const gap = isLargeScreen ? 48 : 0;
  const innerContentWidth = availableWidth - horizontalPadding - gap;

  const currentImageWidth = isDesktop ? innerContentWidth * 0.5 : isTablet ? innerContentWidth * 0.45 : width;
  const textContainerWidth = isDesktop ? innerContentWidth * 0.5 : isTablet ? innerContentWidth * 0.55 : width;
  const currentImageHeight = isDesktop ? 650 : isTablet ? 550 : 500;

  const product = products?.find((p: any) => p._id === id) || {
    _id: id as string,
    brand: "Loading...",
    name: "Fetching product details",
    price: "0",
    description: "",
    images: ["https://via.placeholder.com/600"],
  };

  useEffect(() => {
    if (product && product.brand !== "Loading...") {
      recordProductView(product);
    }
  }, [product._id, product.brand]);

  const productImages = product.images?.length > 0 ? product.images : product.image ? [product.image] : ["https://via.placeholder.com/600"];

  const [selectedSize, setSelectedSize] = useState<string>("M");
  const sizes = ["S", "M", "L", "XL", "XXL"];
  const [isAddingToBag, setIsAddingToBag] = useState<boolean>(false);
  const isWishlisted = wishlistIds?.includes(product._id);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const handleWishlistToggle = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) { showMessage("Login Required", "Please login to manage your wishlist."); return; }

      if (isWishlisted) {
        setWishlistIds((prev: string[]) => prev.filter((wishId) => wishId !== product._id));
        await axios.delete(`${API_URL}/api/wishlist/product/${product._id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        setWishlistIds((prev: string[]) => [...prev, product._id]);
        await axios.post(`${API_URL}/api/wishlist`, { productId: product._id }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (error) {
      showMessage("Error", "Could not update wishlist.");
    }
  };

  const addToBag = async () => {
    try {
      setIsAddingToBag(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) { showMessage("Login Required", "Please login to add items to your bag."); setIsAddingToBag(false); return; }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;

      await axios.post(
        `${API_URL}/api/bag`, 
        { userId, productId: product._id, size: selectedSize, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("Success", "Added to your bag!");
    } catch (error) {
      showMessage("Error", "Could not add item to bag.");
    } finally {
      setIsAddingToBag(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} translucent={false} />
      
      <View className="w-full max-w-[1400px] mx-auto flex-1 relative" style={{ backgroundColor: colors.background }}>
        
        {/* Floating Back Button */}
        <View className={`absolute z-20 ${isLargeScreen ? "top-6 left-6" : "top-4 left-4"}`}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="p-2.5 md:p-3 rounded-full shadow-sm backdrop-blur-md cursor-pointer transition-colors border"
            style={{ backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.9)', borderColor: colors.border }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: isLargeScreen ? 60 : insets.bottom + 120 }}
          bounces={false}
        >
          <View className={`w-full ${isLargeScreen ? "flex-row px-8 pt-8 gap-12" : "flex-col"}`}>
            
            {/* Left Side: Image Carousel */}
            <ProductImageCarousel 
              productImages={productImages}
              currentImageWidth={currentImageWidth}
              currentImageHeight={currentImageHeight}
              isLargeScreen={isLargeScreen}
            />

            {/* Right Side: Product Details */}
            <View style={{ width: isLargeScreen ? textContainerWidth : "100%" }} className={isLargeScreen ? "px-2 py-4" : "p-5"}>
              
              <ProductHeader product={product} />

              <ProductSizeSelector 
                sizes={sizes}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
              />

              {/* Product Details Section */}
              <View className="mt-8 border-t pt-6 md:pt-8" style={{ borderTopColor: colors.border }}>
                <Text className="text-base md:text-lg font-bold tracking-tight mb-3" style={{ color: colors.textMain }}>
                  Product Details
                </Text>
                <Text className="leading-relaxed text-sm md:text-base font-medium" style={{ color: colors.textMuted }}>
                  {product.description}
                </Text>
              </View>

              {/* Desktop Render Action Buttons Inline */}
              {isLargeScreen && (
                <ProductActionButtons 
                  isLargeScreen={true}
                  isWishlisted={isWishlisted}
                  isAddingToBag={isAddingToBag}
                  handleWishlistToggle={handleWishlistToggle}
                  addToBag={addToBag}
                  bottomPadding={0}
                />
              )}
            </View>
          </View>
        </ScrollView>

        {/* Mobile Render Action Buttons absolute bottom */}
        {!isLargeScreen && (
          <ProductActionButtons 
            isLargeScreen={false}
            isWishlisted={isWishlisted}
            isAddingToBag={isAddingToBag}
            handleWishlistToggle={handleWishlistToggle}
            addToBag={addToBag}
            bottomPadding={Math.max(insets.bottom + 12, 16)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}