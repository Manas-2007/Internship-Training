import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useGlobalContext } from "../context/GlobalContext";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/api";

interface Product {
  _id: string;
  brand?: string;
  name?: string;
  price?: number | string;
  images?: string[];
  discount?: string;
}

interface WishlistItem {
  _id: string;
  productId: Product;
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  const { setWishlistIds } = useGlobalContext();
  const router = useRouter();
  
  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 768;
  const isDesktop: boolean = width >= 1024;
  
  // TabBar height for proper bottom padding on mobile
  const TABBAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const getCardWidth = (): string => {
    if (isDesktop) return "31%";
    if (isLargeScreen) return "48%";
    return "100%";
  };

  const fetchWishlist = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch (decodeError) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const userId = decodedToken?.id || decodedToken?._id;
      if (!userId) return;

      const response = await axios.get(`${API_URL}/api/wishlist/${userId}`);

      if (Array.isArray(response.data)) {
        setWishlistItems(response.data);
      } else {
        setWishlistItems([]);
      }
    } catch (error: any) {
      console.log("Frontend API Error:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [])
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  }, []);

  const removeItem = async (wishlistId: string, productId: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      setWishlistItems((prev) =>
        prev.filter((item) => item._id !== wishlistId)
      );

      if (productId) {
        setWishlistIds((prev: string[]) =>
          prev.filter((id) => id !== productId)
        );
      }

      await axios.delete(`${API_URL}/api/wishlist/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      showMessage("Error", "Could not remove item. Please try again.");
      fetchWishlist();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6 w-full max-w-md mx-auto">
          <View className="w-24 h-24 md:w-28 md:h-28 bg-pink-50 rounded-full items-center justify-center mb-6 shadow-sm">
            <Ionicons name="heart-outline" size={44} color="#ff3f6c" />
          </View>
          <Text className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 text-center tracking-tight">
            Login Required
          </Text>
          <Text className="text-base md:text-lg text-neutral-500 mb-10 text-center px-4 leading-6 md:leading-7 font-medium">
            Login to your account to save your favorite items and view them anytime, anywhere.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-[#ff3f6c] w-full py-4 rounded-xl items-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Text className="text-white font-bold text-lg md:text-xl tracking-wide">
              LOGIN NOW
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1400px Centering Wrapper */}
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Header for Mobile Only */}
        {!isLargeScreen && (
          <View className="px-5 py-4 md:py-5 bg-white border-b border-neutral-100 z-10 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="heart" size={24} color="#ff3f6c" />
              <Text className="text-2xl font-bold text-neutral-900 tracking-tight ml-3">
                Wishlist
              </Text>
            </View>
            <Text className="text-sm md:text-base font-semibold text-neutral-500">
              {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"} saved
            </Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-neutral-50"
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingTop: 16,
            // TabBar padding logic so items don't hide on mobile
            paddingBottom: isLargeScreen ? 60 : TABBAR_HEIGHT + 40 
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff3f6c"
              colors={["#ff3f6c"]}
            />
          }
        >
          {wishlistItems.length === 0 ? (
            /* Empty State */
            <View className="flex-1 items-center justify-center pt-10">
              <View className="w-24 h-24 md:w-32 md:h-32 bg-pink-50 rounded-full items-center justify-center mb-6 shadow-sm">
                <Ionicons name="heart-outline" size={48} color="#ff3f6c" />
              </View>
              <Text className="text-neutral-900 text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                It feels so light!
              </Text>
              <Text className="text-neutral-500 text-base md:text-lg text-center px-10 max-w-sm font-medium leading-6">
                There is nothing in your wishlist. Let's add some items.
              </Text>
            </View>
          ) : (
            /* Wishlist Items Grid/List */
            <View className={isLargeScreen ? "flex-row flex-wrap justify-start gap-y-8 gap-x-[2%] px-4 md:px-8" : "flex-col px-4"}>
              {wishlistItems.map((item) => {
                const product = item.productId || {} as Product;
                const imageUrl =
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : "https://via.placeholder.com/400";

                return isLargeScreen ? (
                  /* DESKTOP/TABLET VIEW (Grid Card) */
                  <TouchableOpacity
                    key={item._id}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/product/${product._id}`)}
                    style={{ width: getCardWidth() as any }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group relative"
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-56 md:h-64 object-cover bg-neutral-100 group-hover:opacity-95 transition-opacity"
                    />
                    
                    <TouchableOpacity
                      className="absolute top-3 right-3 p-2.5 bg-white/90 rounded-full shadow-sm hover:bg-red-50 transition-colors z-10"
                      onPress={(e) => {
                        e.stopPropagation();
                        removeItem(item._id, product._id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ff3f6c" />
                    </TouchableOpacity>

                    <View className="p-4 md:p-5">
                      <Text className="text-neutral-500 text-[10px] md:text-xs font-bold mb-1.5 tracking-widest uppercase" numberOfLines={1}>
                        {product.brand || "Brand"}
                      </Text>
                      <Text className="text-neutral-900 text-sm md:text-base font-semibold mb-2.5 leading-5" numberOfLines={1}>
                        {product.name || "Product Name"}
                      </Text>

                      <View className="flex-row items-center">
                        <Text className="text-neutral-900 font-bold text-lg md:text-xl mr-2 tracking-tight">
                          ₹{product.price || 0}
                        </Text>
                        {product.discount && (
                          <Text className="text-[#ff3f6c] text-[10px] md:text-xs font-bold bg-pink-50 px-2 py-1 rounded">
                            {product.discount}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  /* MOBILE VIEW (Horizontal Row Card) */
                  <TouchableOpacity
                    key={item._id}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/product/${product._id}`)}
                    className="flex-row items-center p-3 mb-4 bg-white rounded-2xl shadow-sm border border-neutral-100 active:bg-neutral-50"
                  >
                    <View className="bg-neutral-100 rounded-xl overflow-hidden border border-neutral-50">
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-24 h-32 object-cover"
                      />
                    </View>

                    <View className="flex-1 ml-4 justify-center">
                      <Text className="text-neutral-500 text-[10px] font-bold mb-1 tracking-widest uppercase" numberOfLines={1}>
                        {product.brand || "Brand"}
                      </Text>
                      <Text
                        className="text-neutral-900 text-sm font-semibold mb-2 leading-5"
                        numberOfLines={2}
                      >
                        {product.name || "Product Name"}
                      </Text>

                      <View className="flex-row items-center mt-1">
                        <Text className="text-neutral-900 font-bold text-lg mr-2 tracking-tight">
                          ₹{product.price || 0}
                        </Text>
                        {product.discount && (
                          <Text className="text-[#ff3f6c] text-[10px] font-bold bg-pink-50 px-2 py-0.5 rounded">
                            {product.discount}
                          </Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      className="p-3 bg-red-50 hover:bg-red-100 rounded-full ml-2 transition-colors"
                      onPress={(e) => {
                        e.stopPropagation();
                        removeItem(item._id, product._id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ff3f6c" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}