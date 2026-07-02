import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../constants/api";

import Banner from "../../components/Home Tab/Banner";
import CategoryList from "../../components/Home Tab/CategoryList";
import DealsSection from "../../components/Home Tab/DealCard";
import TrendingProducts from "../../components/Home Tab/TrendingProducts";
import RecentlyViewedSection from "../../components/Home Tab/RecentlyViewedSection";

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

  const TABBAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

  const maxContentWidth = isDesktop ? width : 1152;
  const sliderWidth = Math.min(width, maxContentWidth);

  const {
    categories,
    deals,
    products,
    loading,
    fetchHomeData,
    wishlistIds,
    setWishlistIds,
    fetchWishlistIds,
    recentlyViewed,
  } = useGlobalContext();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    await fetchWishlistIds();
    setRefreshing(false);
  };

  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showMessage("Login Required", "Please login to manage your wishlist.");
        return;
      }

      const isAlreadyWishlisted = wishlistIds.includes(productId);

      if (isAlreadyWishlisted) {
        setWishlistIds((prev: string[]) => prev.filter((id) => id !== productId));
        await axios.delete(`${API_URL}/api/wishlist/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        setWishlistIds((prev: string[]) => [...prev, productId]);
        await axios.post(
          `${API_URL}/api/wishlist`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.log("Wishlist Toggle Error:", error);
      fetchWishlistIds();
    }
  };

  const bannerData = [
    {
      image: "https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=1200&auto=format&fit=crop",
      productId: "6a41fc6587c055c8a09c323d",
    },
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop",
      productId: "6a41f21987c055c8a09c3230",
    },
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop",
      productId: "6a41fce787c055c8a09c323f",
    },
  ];

  const getProductWidth = () => {
    if (isDesktop) return "23.5%";
    if (isTablet) return "31%";
    return "48%";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#ff3f6c" />
        <Text className="text-neutral-500 mt-4 font-medium text-sm md:text-base">
          Curating trends for you...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 w-full max-w-[1400px] mx-auto">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {!isLargeScreen && (
          <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-neutral-100 z-10 shadow-sm">
            <TouchableOpacity activeOpacity={1} className="flex-row items-center">
              <Text className="text-[22px] font-black text-[#ff3f6c] tracking-widest">
                MYNTRA
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.push("/categories")} activeOpacity={0.7} className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors">
                <Ionicons name="search-outline" size={24} color="#282c3f" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => alert("Notifications coming soon!")} activeOpacity={0.7} className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors relative">
                <Ionicons name="notifications-outline" size={24} color="#282c3f" />
                <View className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-[#ff3f6c] rounded-full border-2 border-white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/profile")} activeOpacity={0.7} className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors">
                <Ionicons name="person-outline" size={24} color="#282c3f" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: isLargeScreen ? 60 : TABBAR_HEIGHT + 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff3f6c" colors={["#ff3f6c"]} />
          }
        >
          <View className="w-full pt-2">
            
            <Banner 
              bannerData={bannerData} 
              sliderWidth={sliderWidth} 
              isLargeScreen={isLargeScreen} 
            />

            <CategoryList 
              categories={categories} 
              isLargeScreen={isLargeScreen} 
            />

            <DealsSection 
              deals={deals} 
              isLargeScreen={isLargeScreen} 
              isDesktop={isDesktop} 
            />

            <RecentlyViewedSection 
              recentlyViewed={recentlyViewed} 
              isLargeScreen={isLargeScreen} 
            />

            <TrendingProducts 
              products={products} 
              wishlistIds={wishlistIds} 
              toggleWishlist={toggleWishlist} 
              getProductWidth={getProductWidth} 
              isLargeScreen={isLargeScreen} 
            />

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}