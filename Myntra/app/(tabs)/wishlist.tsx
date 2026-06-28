import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useGlobalContext } from "../context/GlobalContext";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { setWishlistIds } = useGlobalContext();

  const fetchWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch (decodeError) {
        console.log("Token decode failed:", decodeError);
        return;
      }

      const userId = decodedToken?.id || decodedToken?._id; 
      if (!userId) return;

      const API_URL = `http://10.132.253.253:5000/api/wishlist/${userId}`;
      const response = await axios.get(API_URL);
      
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

  useEffect(() => {
    fetchWishlist();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist(); 
    setRefreshing(false);
  }, []);

  // Updated Remove item logic
  const removeItem = async (wishlistId: string, productId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      // 1. UI se item turant hatao
      setWishlistItems(prev => prev.filter(item => item._id !== wishlistId));

      // 2. Global State update karo taaki Home screen sync ho jaye
      if (productId) {
        setWishlistIds((prev: string[]) => prev.filter(id => id !== productId));
      }

      // 3. Database se delete karo (Sahi route aur token ke saath)
      const API_URL = `http://10.132.253.253:5000/api/wishlist/product/${productId}`;
      await axios.delete(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchWishlist(); 
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
      <View className="px-4 py-3 bg-white border-b border-neutral-100 mb-2">
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">
          Wishlist
        </Text>
      </View>

     <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-4" 
        contentContainerStyle={{ flexGrow: 1 }} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#ff3f6c"]} />
        }
      >
        {wishlistItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="heart-dislike-outline" size={64} color="#d4d4d8" />
            <Text style={{ color: '#737373', fontSize: 18, fontWeight: '500', marginTop: 16, textAlign: 'center', lineHeight: 24 }}>
              Your wishlist is empty
            </Text>
          </View>
        ) : (
          wishlistItems.map((item) => {
            const product = item.productId || {};
            const imageUrl = product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/150";

            return (
              <View key={item._id} className="flex-row items-center py-4 border-b border-neutral-100">
                <Image source={{ uri: imageUrl }} className="w-24 h-32 rounded-lg object-cover" />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-neutral-500 text-sm font-bold mb-1">{product.brand || "Brand"}</Text>
                  <Text className="text-neutral-800 text-base font-medium mb-2 leading-5" numberOfLines={2}>{product.name || "Product Name"}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-neutral-900 font-bold text-lg mr-2">₹{product.price || 0}</Text>
                    <Text className="text-[#ff3f6c] text-sm font-bold">{product.discount || ""}</Text>
                  </View>
                </View>
                <TouchableOpacity className="p-2 ml-2" onPress={() => removeItem(item._id, product._id)}>
                  <Ionicons name="trash-outline" size={24} color="#ff3f6c" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}