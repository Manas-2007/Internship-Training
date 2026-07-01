import React, { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

  // Mobile TabBar height for bottom padding
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
        setWishlistIds((prev: string[]) =>
          prev.filter((id) => id !== productId)
        );

        await axios.delete(
          `${API_URL}/api/wishlist/product/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        setWishlistIds((prev: string[]) => [...prev, productId]);

        await axios.post(
          `${API_URL}/api/wishlist`,
          { productId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % bannerData.length;
      scrollRef.current?.scrollTo({ x: nextIndex * sliderWidth, animated: true });
      setActiveIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex, sliderWidth]);

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
      {/* Centering Wrapper: 1400px lock */}
      <View className="flex-1 w-full max-w-[1400px] mx-auto">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

       {/* Premium Myntra Pink Themed Header - Hidden on Large Screens */}
        {!isLargeScreen && (
          <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-neutral-100 z-10 shadow-sm">
            
            {/* Left Side: Brand Logo */}
            <TouchableOpacity 
              activeOpacity={1} 
              className="flex-row items-center"
            >
              <Text className="text-[22px] font-black text-[#ff3f6c] tracking-widest">
                MYNTRA
              </Text>
            </TouchableOpacity>

            {/* Right Side: Action Icons */}
            <View className="flex-row items-center gap-4">
              
              {/* 1. Search */}
              <TouchableOpacity
                onPress={() => router.push("/categories")}
                activeOpacity={0.7}
                className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors"
              >
                <Ionicons name="search-outline" size={24} color="#282c3f" />
              </TouchableOpacity>

              {/* 2. Notification with Premium Pink Badge */}
              <TouchableOpacity
                onPress={() => alert("Notifications coming soon!")}
                activeOpacity={0.7}
                className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors relative"
              >
                <Ionicons name="notifications-outline" size={24} color="#282c3f" />
                {/* Ping/Badge Indicator */}
                <View className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-[#ff3f6c] rounded-full border-2 border-white" />
              </TouchableOpacity>

              {/* 3. Profile */}
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                activeOpacity={0.7}
                className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors"
              >
                <Ionicons name="person-outline" size={24} color="#282c3f" />
              </TouchableOpacity>

            </View>
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          // Responsive bottom padding for TabBar clearance
          contentContainerStyle={{ paddingBottom: isLargeScreen ? 60 : TABBAR_HEIGHT + 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff3f6c"
              colors={["#ff3f6c"]}
            />
          }
        >
          <View className="w-full pt-2">
            
            {/* Hero Banner */}
            <View className={`w-full max-w-6xl mx-auto overflow-hidden ${isLargeScreen ? "rounded-2xl shadow-sm mt-4" : "mt-2 px-4"}`}>
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
                    style={{ width: isLargeScreen ? sliderWidth - 32 : sliderWidth - 32 }}
                    activeOpacity={0.9}
                    className="cursor-pointer group relative"
                    onPress={() => router.push(`/product/${item.productId}`)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      className={`w-full object-cover bg-neutral-100 rounded-2xl ${isLargeScreen ? "h-[450px] group-hover:scale-[1.02] transition-transform duration-500" : "h-52 md:h-64"}`}
                    />
                    <View className="absolute inset-0 bg-black/25 rounded-2xl" />
                    <View className={`absolute left-6 md:left-8 ${isLargeScreen ? "bottom-16" : "bottom-8"}`}>
                      {/* Reduced boldness to extrabold and semibold */}
                      <Text className={`text-white font-extrabold tracking-wide ${isLargeScreen ? "text-5xl drop-shadow-md" : "text-2xl md:text-3xl"}`}>
                        SUMMER
                      </Text>
                      <Text className={`text-white font-semibold tracking-widest ${isLargeScreen ? "text-2xl mt-2 drop-shadow-md" : "text-sm md:text-base mt-0.5"}`}>
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
                    className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${activeIndex === i ? "w-5 md:w-6 bg-white" : "w-1.5 md:w-2 bg-white/50"}`}
                  />
                ))}
              </View>
            </View>

            {/* Shop By Category */}
            <View className="mt-8 md:mt-12 w-full">
              <View className="max-w-6xl mx-auto w-full px-4 lg:px-4">
                <View className="flex-row justify-between items-center mb-5 md:mb-6 px-1 lg:px-0">
                  <Text className="text-lg md:text-xl font-bold text-neutral-900 tracking-wide">
                    SHOP BY CATEGORY
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center cursor-pointer hover:opacity-70 transition-opacity"
                    onPress={() => router.push("/categories")}
                  >
                    <Text className="text-[#ff3f6c] font-bold text-xs md:text-sm tracking-wide">VIEW ALL</Text>
                    <Ionicons name="arrow-forward" size={14} color="#ff3f6c" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                {isLargeScreen ? (
                  <View className="flex-row flex-wrap justify-center gap-x-12 lg:gap-x-16 gap-y-8 px-4">
                    {categories?.map((cat: any) => (
                      <TouchableOpacity
                        key={cat._id}
                        className="items-center group cursor-pointer w-24 md:w-28"
                        activeOpacity={0.9}
                        onPress={() => {
                          router.push({ pathname: "/categories", params: { categoryName: cat.name } });
                        }}
                      >
                        <View className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white items-center justify-center shadow-md border-2 border-transparent group-hover:border-[#ff3f6c] transition-colors p-1">
                          <Image
                            source={{ uri: cat.image || "https://via.placeholder.com/150" }}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </View>
                        <Text className="mt-3 text-sm font-bold text-neutral-800 tracking-tight text-center">
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="overflow-visible"
                    contentContainerStyle={{ paddingHorizontal: 4, paddingRight: 20 }}
                  >
                    {categories?.map((cat: any) => (
                      <TouchableOpacity
                        key={cat._id}
                        className="items-center mr-5 md:mr-6"
                        activeOpacity={0.7}
                        onPress={() => {
                          router.push({ pathname: "/categories", params: { categoryName: cat.name } });
                        }}
                      >
                        <View className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white items-center justify-center shadow-sm border border-neutral-100 p-1">
                          <Image
                            source={{ uri: cat.image || "https://via.placeholder.com/150" }}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </View>
                        <Text className="mt-2.5 text-[12px] md:text-sm font-bold text-neutral-700 tracking-tight">
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Deals of the Day */}
            <View className="mt-10 md:mt-12 py-8 md:py-10 bg-neutral-50 px-4 lg:px-8 rounded-2xl mx-2 md:mx-4 lg:mx-0 border border-neutral-100">
              <Text className="text-lg md:text-xl font-bold text-neutral-900 tracking-wide mb-5 md:mb-6 px-1">
                DEALS OF THE DAY
              </Text>
              
              {isLargeScreen ? (
                <View className="flex-row flex-wrap justify-between gap-y-6">
                  {deals?.map((deal: any, index: number) => (
                    <TouchableOpacity
                      key={deal._id || index}
                      style={{ width: isDesktop ? "32%" : "48%" }}
                      className="h-64 rounded-2xl overflow-hidden relative shadow-sm border border-neutral-200 group cursor-pointer"
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
                  {deals?.map((deal: any, index: number) => (
                    <TouchableOpacity
                      key={deal._id || index}
                      className="mr-4 w-64 md:w-72 h-40 md:h-48 rounded-xl md:rounded-2xl overflow-hidden relative shadow-sm border border-neutral-200"
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

            {/* Trending Now */}
            <View className="mt-10 md:mt-14 px-4 lg:px-8">
              <Text className="text-lg md:text-xl font-bold text-neutral-900 tracking-wide mb-6">
                TRENDING NOW
              </Text>
              
              <View className="flex-row flex-wrap justify-start gap-[2%] gap-y-6 md:gap-y-8 mb-10 md:mb-20">
                {products?.map((product: any) => (
                  <TouchableOpacity
                    key={product._id}
                    style={{ width: getProductWidth() }}
                    className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow duration-300 hover:-translate-y-1"
                    onPress={() => router.push(`/product/${product._id}`)}
                    activeOpacity={0.9}
                  >
                    <View className={`relative w-full bg-neutral-100 overflow-hidden ${isLargeScreen ? "h-72" : "h-56 md:h-64"}`}>
                      <Image
                        source={{ uri: product.images?.[0] }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Wishlist Button */}
                      <TouchableOpacity
                        className="absolute top-2.5 right-2.5 md:top-3 md:right-3 p-2 md:p-2.5 bg-white/90 hover:bg-white rounded-full backdrop-blur-md shadow-sm transition-colors cursor-pointer z-10"
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product._id);
                        }}
                      >
                        <Ionicons
                          name={wishlistIds?.includes(product._id) ? "heart" : "heart-outline"}
                          size={18}
                          color={wishlistIds?.includes(product._id) ? "#ff3f6c" : "#171717"}
                        />
                      </TouchableOpacity>

                      {product.discount && (
                        <View className="absolute bottom-2.5 left-2.5 md:bottom-3 md:left-3 bg-[#ff3f6c] px-2 py-1 md:px-2.5 md:py-1.5 rounded shadow-sm">
                          <Text className="text-white text-[10px] md:text-xs font-bold tracking-wider">
                            {product.discount}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="p-3 md:p-4">
                      <Text
                        className="text-neutral-500 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1"
                        numberOfLines={1}
                      >
                        {product.brand}
                      </Text>
                      <Text
                        className="text-neutral-900 text-sm md:text-base font-semibold mb-1.5 md:mb-2 leading-5"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-neutral-900 font-bold text-base md:text-lg tracking-tight">
                          ₹{product.price}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}