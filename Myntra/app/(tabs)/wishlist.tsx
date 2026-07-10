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
import { useTheme } from "../context/ThemeContext";

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
  const { colors, isDark } = useTheme();
  const { setWishlistIds } = useGlobalContext();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 768;
  const isDesktop: boolean = width >= 1024;
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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6 w-full max-w-md mx-auto">
          <View 
            className="w-24 h-24 md:w-28 md:h-28 rounded-full items-center justify-center mb-6 shadow-sm"
            style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
          >
            <Ionicons name="heart-outline" size={44} color={colors.primary} />
          </View>
          <Text className="text-3xl md:text-4xl font-bold mb-3 text-center tracking-tight" style={{ color: colors.textMain }}>
            Login Required
          </Text>
          <Text className="text-base md:text-lg mb-10 text-center px-4 leading-6 md:leading-7 font-medium" style={{ color: colors.textMuted }}>
            Login to your account to save your favorite items and view them anytime, anywhere.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="w-full py-4 rounded-xl items-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: colors.primary }}
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Header for Mobile Only */}
        {!isLargeScreen && (
          <View 
            className="px-5 py-4 md:py-5 border-b z-10 flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
          >
            <View className="flex-row items-center">
              <Ionicons name="heart" size={24} color={colors.primary} />
              <Text className="text-2xl font-bold tracking-tight ml-3" style={{ color: colors.textMain }}>
                Wishlist
              </Text>
            </View>
            <Text className="text-sm md:text-base font-semibold" style={{ color: colors.textMuted }}>
              {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"} saved
            </Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingTop: 16,
            paddingBottom: isLargeScreen ? 60 : TABBAR_HEIGHT + 40 
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {wishlistItems.length === 0 ? (
            /* Empty State */
            <View className="flex-1 items-center justify-center pt-10">
              <View 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full items-center justify-center mb-6 shadow-sm"
                style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
              >
                <Ionicons name="heart-outline" size={48} color={colors.primary} />
              </View>
              <Text className="text-2xl md:text-3xl font-bold mb-3 tracking-tight" style={{ color: colors.textMain }}>
                It feels so light!
              </Text>
              <Text className="text-base md:text-lg text-center px-10 max-w-sm font-medium leading-6" style={{ color: colors.textMuted }}>
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
                  <TouchableOpacity
                    key={item._id}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/product/${product._id}`)}
                    style={{ 
                      width: getCardWidth() as any, 
                      backgroundColor: colors.surface, 
                      borderColor: colors.border 
                    }}
                    className="rounded-2xl overflow-hidden shadow-sm border hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group relative"
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-56 md:h-64 object-cover group-hover:opacity-95 transition-opacity"
                      style={{ backgroundColor: colors.background }}
                    />
                    
                    <TouchableOpacity
                      className="absolute top-3 right-3 p-2.5 rounded-full shadow-sm transition-colors z-10"
                      style={{ backgroundColor: isDark ? 'rgba(38,38,38,0.9)' : 'rgba(255,255,255,0.9)' }}
                      onPress={(e) => {
                        e.stopPropagation();
                        removeItem(item._id, product._id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <View className="p-4 md:p-5">
                      <Text className="text-[10px] md:text-xs font-bold mb-1.5 tracking-widest uppercase" numberOfLines={1} style={{ color: colors.textMuted }}>
                        {product.brand || "Brand"}
                      </Text>
                      <Text className="text-sm md:text-base font-semibold mb-2.5 leading-5" numberOfLines={1} style={{ color: colors.textMain }}>
                        {product.name || "Product Name"}
                      </Text>

                      <View className="flex-row items-center">
                        <Text className="font-bold text-lg md:text-xl mr-2 tracking-tight" style={{ color: colors.textMain }}>
                          ₹{product.price || 0}
                        </Text>
                        {product.discount && (
                          <Text 
                            className="text-[10px] md:text-xs font-bold px-2 py-1 rounded"
                            style={{ color: colors.primary, backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
                          >
                            {product.discount}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={item._id}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/product/${product._id}`)}
                    className="flex-row items-center p-3 mb-4 rounded-2xl shadow-sm border"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    <View 
                      className="rounded-xl overflow-hidden border"
                      style={{ backgroundColor: colors.background, borderColor: colors.border }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-24 h-32 object-cover"
                      />
                    </View>

                    <View className="flex-1 ml-4 justify-center">
                      <Text className="text-[10px] font-bold mb-1 tracking-widest uppercase" numberOfLines={1} style={{ color: colors.textMuted }}>
                        {product.brand || "Brand"}
                      </Text>
                      <Text
                        className="text-sm font-semibold mb-2 leading-5"
                        numberOfLines={2}
                        style={{ color: colors.textMain }}
                      >
                        {product.name || "Product Name"}
                      </Text>

                      <View className="flex-row items-center mt-1">
                        <Text className="font-bold text-lg mr-2 tracking-tight" style={{ color: colors.textMain }}>
                          ₹{product.price || 0}
                        </Text>
                        {product.discount && (
                          <Text 
                            className="text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{ color: colors.primary, backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
                          >
                            {product.discount}
                          </Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      className="p-3 rounded-full ml-2 transition-colors"
                      style={{ backgroundColor: isDark ? '#450a0a' : '#fef2f2' }}
                      onPress={(e) => {
                        e.stopPropagation();
                        removeItem(item._id, product._id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.primary} />
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