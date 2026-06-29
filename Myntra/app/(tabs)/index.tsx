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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  // Saara state Global Context se aayega
  const { categories, deals, products, loading, fetchHomeData, wishlistIds, setWishlistIds, fetchWishlistIds } = useGlobalContext();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData(); 
    await fetchWishlistIds(); // Refresh karne par IDs bhi update hongi
    setRefreshing(false);
  };

  // Toggle Logic: Add/Remove instantly without alerts
  const toggleWishlist = async (productId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Login Required", "Please login to manage your wishlist.");
        return;
      }

      const isAlreadyWishlisted = wishlistIds.includes(productId);

      if (isAlreadyWishlisted) {
        // Optimistic UI: Heart ko turant black/outline karo
        setWishlistIds((prev: string[]) => prev.filter((id) => id !== productId));
        
        // API Call: Delete
        await axios.delete(`http://10.132.206.253:5000/api/wishlist/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Optimistic UI: Heart ko turant pink/filled karo
        setWishlistIds((prev: string[]) => [...prev, productId]);
        
        // API Call: Add product
        await axios.post(`http://10.132.206.253:5000/api/wishlist`, { productId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log("Wishlist Toggle Error:", error);
      fetchWishlistIds(); // Agar error aaye, toh UI ko server se resync karo
    }
  };

  const bannerData = [
    { 
      image: "https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=800&auto=format&fit=crop", 
      productId: "6a41fc6587c055c8a09c323d" 
    },
    { 
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop", 
      productId: "6a41f21987c055c8a09c3230" 
    },
    { 
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop", 
      productId: "6a41fce787c055c8a09c323f" 
    },
  ];

  // Slider Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % bannerData.length; // Yahan change kiya
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeIndex, width]);


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

      {/* 1. Sleek Header Section */}
      <View className="flex-row justify-between items-center px-4 py-1 bg-white border-b border-neutral-100">
        <View className="flex-row items-center gap-2">
          <Image
            source={require("../../assets/images/favicon.png")}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
          <Text className="text-xl font-black text-neutral-900 tracking-wider">
            MYNTRA
          </Text>
        </View>
        <TouchableOpacity className="p-2" onPress={() => router.push("/categories")}>
          <Ionicons name="search-outline" size={26} color="#ff3f6c" />
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#ff3f6c" 
            colors={["#ff3f6c"]}
          />
        }
      >
        {/* 2. Hero Banner (UPDATED WITH LINKS) */}
        <View className="w-full mt-2">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
          >
            {bannerData.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={{ width }} 
                activeOpacity={0.9} 
                onPress={() => router.push(`/product/${item.productId}`)} // 🔥 Yahan Link attach kiya
              >
                <Image source={{ uri: item.image }} className="w-full h-56 object-cover" />
                <View className="absolute inset-0 bg-black/30" />
                <View className="absolute bottom-10 left-8">
                  <Text className="text-white text-3xl font-black tracking-wide">SUMMER</Text>
                  <Text className="text-white text-xl font-bold tracking-widest">COLLECTION</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="absolute bottom-4 w-full flex-row justify-center gap-2">
            {bannerData.map((_, i) => ( // Yahan bhi bannerImages ki jagah bannerData kiya
              <View key={i} className={`h-2 rounded-full ${activeIndex === i ? "w-4 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </View>
        </View>

        {/* 3. Shop By Category */}
        <View className="mt-6 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-black text-neutral-800 tracking-wide">SHOP BY CATEGORY</Text>
            <TouchableOpacity 
              className="flex-row items-center" 
              onPress={() => router.push("/categories")}
            >
              <Text className="text-[#ff3f6c] font-bold text-sm">View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#ff3f6c" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible" contentContainerStyle={{ paddingRight: 20 }}>
            {categories?.map((cat: any) => (
              <TouchableOpacity key={cat._id} className="items-center mr-6 group" activeOpacity={0.7}
              onPress={()=>{router.push({pathname: "/categories",params: { categoryName: cat.name }})}}
              >
                <View className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-lg shadow-pink-200 border-[2px] border-[#ff3f6c]/20 p-[2px]">
                  <Image source={{ uri: cat.image || "https://via.placeholder.com/150" }} className="w-full h-full rounded-full object-cover" />
                </View>
                <Text className="mt-3 text-[13px] font-bold text-neutral-700 tracking-tight">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. Deals of the Day */}
        <View className="mt-6 py-5 bg-white px-4">
          <Text className="text-xl font-black text-neutral-800 tracking-wide mb-5">DEALS OF THE DAY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {deals?.map((deal: any, index: number) => (
              <TouchableOpacity key={deal._id || index} className="mr-5 w-72 h-44 rounded-2xl overflow-hidden relative shadow-lg shadow-neutral-300" activeOpacity={0.9} onPress={() => {
      if (deal.productId) {
        router.push(`/product/${deal.productId}`);
      } else {
        Alert.alert("Coming Soon", "Deal link will be available shortly.");
      }
    }}
  >
                <Image source={{ uri: deal.image }} className="w-full h-full object-cover" />
                <View className="absolute inset-0 bg-black/30 p-5 justify-between">
                  <View className="bg-white/15 self-start px-2 py-1 rounded border border-white/30 backdrop-blur-md">
                    <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Limited Offer</Text>
                  </View>
                  <View>
                    <Text className="text-white text-3sm font-black shadow-lg">{deal.title}</Text>
                    <Text className="text-white/90 text-sm font-semibold mt-1">{deal.subtitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. Trending Now (Product Grid) */}
        <View className="mt-6 px-4 mb-24">
          <Text className="text-lg font-black text-neutral-800 tracking-wide mb-6">TRENDING NOW</Text>
          <View className="flex-row flex-wrap justify-between">
            {products?.map((product: any) => (
              <TouchableOpacity
                key={product._id}
                onPress={() => router.push(`/product/${product._id}`)}
                className="w-[48%] mb-6 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
              >
                <View className="relative w-full h-60 bg-neutral-100">
                  <Image source={{ uri: product.images?.[0] }} className="w-full h-full object-cover" />
                  
                  {/* Wishlist Button (UPDATED) */}
                  <TouchableOpacity 
                    className="absolute top-2 right-2 p-2 bg-white/70 rounded-full backdrop-blur-md"
                    onPress={() => toggleWishlist(product._id)} 
                  >
                    <Ionicons 
                      name={wishlistIds?.includes(product._id) ? "heart" : "heart-outline"} 
                      size={18} 
                      color={wishlistIds?.includes(product._id) ? "#ff3f6c" : "#000"} 
                    />
                  </TouchableOpacity>

                  {product.discount && (
                    <View className="absolute bottom-2 left-2 bg-[#ff3f6c] px-2 py-1 rounded">
                      <Text className="text-white text-[10px] font-black">{product.discount}</Text>
                    </View>
                  )}
                </View>

                <View className="p-3">
                  <Text className="text-neutral-900 text-[14px] font-extrabold" numberOfLines={1}>{product.brand}</Text>
                  <Text className="text-neutral-500 text-[12px] mb-2" numberOfLines={1}>{product.name}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-neutral-900 font-bold text-[15px]">₹{product.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}