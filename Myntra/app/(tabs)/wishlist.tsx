import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Wishlist Data Safely
  const fetchWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("No token found");
        return;
      }

      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch (decodeError) {
        console.log("Token decode failed:", decodeError);
        return;
      }

      // Extract user ID (ID match ka dhyaan rakhna bhai!)
      const userId = decodedToken?.id || decodedToken?._id; 
      if (!userId) return;

      const API_URL = `http://172.16.52.102:5000/api/wishlist/${userId}`;
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

  // Jab page pehli baar khule
  useEffect(() => {
    fetchWishlist();
  }, []);

  // 2. Pull to Refresh Logic
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist(); // Wapas backend se data laao
    setRefreshing(false);
  }, []);

  // 3. Delete item from Database and UI
  const removeItem = async (wishlistId: string) => {
    try {
      // Pehle UI se hatao taaki fast lage (Optimistic UI)
      setWishlistItems(prev => prev.filter(item => item._id !== wishlistId));

      // Phir Database se delete karo
      const API_URL = `http://172.16.52.102:5000/api/wishlist/${wishlistId}`;
      await axios.delete(API_URL);
    } catch (error) {
      console.log("Error deleting item:", error);
      fetchWishlist(); // Agar error aaye toh data wapas original state mein laao
    }
  };

  // Jab tak data aa raha hai, loader dikhao
  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
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
        
       {/* Check if Wishlist is Empty */}
        {wishlistItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="heart-dislike-outline" size={64} color="#d4d4d8" />
            <Text style={{ 
              color: '#737373', 
              fontSize: 18, 
              fontWeight: '500', 
              marginTop: 16, 
              textAlign: 'center',
              lineHeight: 24
            }}>
              Your wishlist is empty
            </Text>
          </View>
        ) : (
          /* Render Wishlist Items from DB */
          wishlistItems.map((item) => {
            // Safe extraction: Agar product delete ho gaya ho par wishlist me reh gaya ho
            const product = item.productId || {};
            const imageUrl = product.images && product.images.length > 0 
              ? product.images[0] 
              : "https://via.placeholder.com/150";

            return (
              <View 
                key={item._id} 
                className="flex-row items-center py-4 border-b border-neutral-100"
              >
                {/* Product Image */}
                <Image 
                  source={{ uri: imageUrl }} 
                  className="w-24 h-32 rounded-lg object-cover"
                />

                {/* Product Details */}
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-neutral-500 text-sm font-bold mb-1">
                    {product.brand || "Brand"}
                  </Text>
                  <Text className="text-neutral-800 text-base font-medium mb-2 leading-5" numberOfLines={2}>
                    {product.name || "Product Name"}
                  </Text>
                  
                  <View className="flex-row items-center">
                    <Text className="text-neutral-900 font-bold text-lg mr-2">
                      ₹{product.price || 0}
                    </Text>
                    <Text className="text-[#ff3f6c] text-sm font-bold">
                      {product.discount || ""}
                    </Text>
                  </View>
                </View>

                {/* Delete (Trash) Button */}
                <TouchableOpacity 
                  className="p-2 ml-2"
                  onPress={() => removeItem(item._id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#ff3f6c" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
        
        {/* Extra padding at bottom for tab bar */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}