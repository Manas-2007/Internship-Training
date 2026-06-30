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

  const maxContentWidth = 1152;
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
        <Text className="text-neutral-500 mt-4 font-medium">
          Curating trends for you...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Mobile Header - Hidden on Large Screens */}
      {!isLargeScreen && (
        <View className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-neutral-100">
          <View className="flex-row items-center gap-2">
            <Image
              source={require("../../assets/images/myntra.jpg")} 
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
            <Text className="text-xl font-black text-neutral-900 tracking-wider">
              MYNTRA
            </Text>
          </View>
          <TouchableOpacity
            className="p-2"
            onPress={() => router.push("/categories")}
          >
            <Ionicons name="search-outline" size={26} color="#ff3f6c" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: isLargeScreen ? 60 : 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3f6c"
            colors={["#ff3f6c"]}
          />
        }
      >
        <View className="w-full max-w-6xl mx-auto pt-2">
          
          {/* Hero Banner */}
          <View className={`w-full overflow-hidden ${isLargeScreen ? "rounded-2xl shadow-sm mt-4 px-4" : "mt-2"}`}>
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
                  style={{ width: isLargeScreen ? sliderWidth - 32 : sliderWidth }}
                  activeOpacity={0.9}
                  className="cursor-pointer group relative"
                  onPress={() => router.push(`/product/${item.productId}`)}
                >
                  <Image
                    source={{ uri: item.image }}
                    className={`w-full object-cover bg-neutral-100 ${isLargeScreen ? "h-[450px] rounded-2xl group-hover:scale-[1.02] transition-transform duration-500" : "h-56"}`}
                  />
                  <View className={`absolute inset-0 bg-black/30 ${isLargeScreen ? "rounded-2xl" : ""}`} />
                  <View className={`absolute left-8 ${isLargeScreen ? "bottom-16" : "bottom-10"}`}>
                    <Text className={`text-white font-black tracking-wide ${isLargeScreen ? "text-5xl drop-shadow-md" : "text-3xl"}`}>
                      SUMMER
                    </Text>
                    <Text className={`text-white font-bold tracking-widest ${isLargeScreen ? "text-3xl mt-2 drop-shadow-md" : "text-xl"}`}>
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
                  className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                />
              ))}
            </View>
          </View>

          {/* Shop By Category */}
          <View className={`mt-10 px-4 ${isLargeScreen ? "mb-6" : ""}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-neutral-900 tracking-wide">
                SHOP BY CATEGORY
              </Text>
              <TouchableOpacity
                className="flex-row items-center cursor-pointer hover:opacity-70 transition-opacity"
                onPress={() => router.push("/categories")}
              >
                <Text className="text-[#ff3f6c] font-bold text-sm tracking-wide">VIEW ALL</Text>
                <Ionicons name="arrow-forward" size={16} color="#ff3f6c" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {isLargeScreen ? (
              <View className="flex-row flex-wrap justify-start gap-8">
                {categories?.map((cat: any) => (
                  <TouchableOpacity
                    key={cat._id}
                    className="items-center group cursor-pointer"
                    activeOpacity={0.9}
                    onPress={() => {
                      router.push({ pathname: "/categories", params: { categoryName: cat.name } });
                    }}
                  >
                    <View className="w-32 h-32 rounded-full bg-white items-center justify-center shadow-md shadow-pink-100 border-2 border-transparent group-hover:border-[#ff3f6c] transition-colors p-1">
                      <Image
                        source={{ uri: cat.image || "https://via.placeholder.com/150" }}
                        className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </View>
                    <Text className="mt-4 text-base font-bold text-neutral-800 tracking-tight group-hover:text-[#ff3f6c] transition-colors">
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
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {categories?.map((cat: any) => (
                  <TouchableOpacity
                    key={cat._id}
                    className="items-center mr-6 group"
                    activeOpacity={0.7}
                    onPress={() => {
                      router.push({ pathname: "/categories", params: { categoryName: cat.name } });
                    }}
                  >
                    <View className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-lg shadow-pink-200 border-[2px] border-[#ff3f6c]/20 p-[2px]">
                      <Image
                        source={{ uri: cat.image || "https://via.placeholder.com/150" }}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </View>
                    <Text className="mt-3 text-[13px] font-bold text-neutral-700 tracking-tight">
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Deals of the Day */}
          <View className="mt-10 py-8 bg-neutral-50 px-4 rounded-2xl mx-4">
            <Text className="text-xl font-black text-neutral-900 tracking-wide mb-6">
              DEALS OF THE DAY
            </Text>
            
            {isLargeScreen ? (
              <View className="flex-row flex-wrap justify-between gap-y-6">
                {deals?.map((deal: any, index: number) => (
                  <TouchableOpacity
                    key={deal._id || index}
                    style={{ width: isDesktop ? "32%" : "48%" }}
                    className="h-64 rounded-2xl overflow-hidden relative shadow-sm group cursor-pointer"
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
                      <Text className="text-white text-2xl font-black drop-shadow-md">
                        {deal.title}
                      </Text>
                      <Text className="text-white/90 text-base font-semibold mt-1 drop-shadow-sm">
                        {deal.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {deals?.map((deal: any, index: number) => (
                  <TouchableOpacity
                    key={deal._id || index}
                    className="mr-5 w-72 h-44 rounded-2xl overflow-hidden relative shadow-md shadow-neutral-300"
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
                    <View className="absolute inset-0 bg-black/30 p-5 justify-between">
                      <View className="bg-white/15 self-start px-2 py-1 rounded border border-white/30 backdrop-blur-md">
                        <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
                          Limited Offer
                        </Text>
                      </View>
                      <View>
                        <Text className="text-white text-lg font-black shadow-lg">
                          {deal.title}
                        </Text>
                        <Text className="text-white/90 text-sm font-semibold mt-1">
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
          <View className="mt-12 px-4">
            <Text className="text-xl font-black text-neutral-900 tracking-wide mb-8">
              TRENDING NOW
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {products?.map((product: any) => (
                <TouchableOpacity
                  key={product._id}
                  style={{ width: getProductWidth() }}
                  className="mb-8 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow duration-300 hover:-translate-y-1"
                  onPress={() => router.push(`/product/${product._id}`)}
                  activeOpacity={0.9}
                >
                  <View className={`relative w-full bg-neutral-100 overflow-hidden ${isLargeScreen ? "h-72" : "h-60"}`}>
                    <Image
                      source={{ uri: product.images?.[0] }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Wishlist Button */}
                    <TouchableOpacity
                      className="absolute top-3 right-3 p-2.5 bg-white/80 hover:bg-white rounded-full backdrop-blur-md shadow-sm transition-colors cursor-pointer z-10"
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product._id);
                      }}
                    >
                      <Ionicons
                        name={wishlistIds?.includes(product._id) ? "heart" : "heart-outline"}
                        size={20}
                        color={wishlistIds?.includes(product._id) ? "#ff3f6c" : "#171717"}
                      />
                    </TouchableOpacity>

                    {product.discount && (
                      <View className="absolute bottom-3 left-3 bg-[#ff3f6c] px-2.5 py-1.5 rounded shadow-sm">
                        <Text className="text-white text-xs font-black tracking-wider">
                          {product.discount}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="p-4">
                    <Text
                      className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-1"
                      numberOfLines={1}
                    >
                      {product.brand}
                    </Text>
                    <Text
                      className="text-neutral-900 text-base font-semibold mb-2 leading-5"
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-neutral-900 font-black text-lg tracking-tight">
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
    </SafeAreaView>
  );
}