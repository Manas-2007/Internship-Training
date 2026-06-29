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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useGlobalContext } from "../context/GlobalContext";
import { useFocusEffect, useRouter } from "expo-router";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { setWishlistIds } = useGlobalContext();
  const router = useRouter();

  const fetchWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setLoading(false);
        return;
      }

      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch (decodeError) {
        console.log("Token decode failed:", decodeError);
        setLoading(false);
        return;
      }

      const userId = decodedToken?.id || decodedToken?._id;
      if (!userId) return;

      const API_URL = `http://10.132.206.253:5000/api/wishlist/${userId}`;
      const response = await axios.get(API_URL);

      if (Array.isArray(response.data)) {
        setWishlistItems(response.data);
      } else {
        setWishlistItems([]);
      }
    } catch (error: any) {
      console.log(
        "Frontend API Error:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  }, []);

  const removeItem = async (wishlistId: string, productId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      setWishlistItems((prev) =>
        prev.filter((item) => item._id !== wishlistId),
      );

      if (productId) {
        setWishlistIds((prev: string[]) =>
          prev.filter((id) => id !== productId),
        );
      }

      const API_URL = `http://10.132.206.253:5000/api/wishlist/product/${productId}`;
      await axios.delete(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.log("Error deleting item:", error);
      Alert.alert("Error", "Could not remove item. Please try again.");
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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-5 py-4 bg-white border-b border-neutral-100 z-10">
        <Text className="text-3xl font-black text-neutral-900 tracking-tight">
          Wishlist
        </Text>
        <Text className="text-sm font-medium text-neutral-500 mt-1">
          {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}{" "}
          saved
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-4 bg-neutral-50"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
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
          <View className="flex-1 items-center justify-center">
            <View className="w-24 h-24 bg-pink-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="heart-outline" size={40} color="#ff3f6c" />
            </View>
            <Text className="text-neutral-800 text-xl font-bold mb-2">
              It feels so light!
            </Text>
            <Text className="text-neutral-500 text-base text-center px-10">
              There is nothing in your wishlist. Let's add some items.
            </Text>
          </View>
        ) : (
          wishlistItems.map((item) => {
            const product = item.productId || {};
            const imageUrl =
              product.images && product.images.length > 0
                ? product.images[0]
                : "https://via.placeholder.com/150";

            return (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${product._id}`)}
                className="flex-row items-center p-3 mb-4 bg-white rounded-2xl shadow-sm border border-neutral-100"
              >
                <View className="bg-neutral-100 rounded-xl overflow-hidden">
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-24 h-32 object-cover"
                  />
                </View>

                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-neutral-500 text-xs font-extrabold mb-1 tracking-widest uppercase">
                    {product.brand || "Brand"}
                  </Text>
                  <Text
                    className="text-neutral-800 text-sm font-semibold mb-2 leading-5"
                    numberOfLines={2}
                  >
                    {product.name || "Product Name"}
                  </Text>

                  <View className="flex-row items-center">
                    <Text className="text-neutral-900 font-black text-lg mr-2">
                      ₹{product.price || 0}
                    </Text>
                    {product.discount && (
                      <Text className="text-[#ff3f6c] text-xs font-bold bg-pink-50 px-2 py-1 rounded">
                        {product.discount}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  className="p-3 bg-red-50 rounded-full ml-2"
                  onPress={(e) => {
                    e.stopPropagation();
                    removeItem(item._id, product._id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3f6c" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
