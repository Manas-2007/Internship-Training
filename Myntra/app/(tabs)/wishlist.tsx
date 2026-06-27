import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Dummy data for Wishlist
const initialWishlist = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    brand: "H&M",
    price: "₹799",
    discount: "40% OFF",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Slim Fit Denim Jacket",
    brand: "Levis",
    price: "₹2999",
    discount: "30% OFF",
    image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Classic White Sneakers",
    brand: "Puma",
    price: "₹1999",
    discount: "50% OFF",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
  },
];

export default function Wishlist() {
  // State to manage wishlist items (so we can delete them from UI)
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);

  // Function to handle item deletion
  const removeItem = (id: number) => {
    const updatedList = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updatedList);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-neutral-100 mb-2">
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">
          Wishlist
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        
        {/* Check if Wishlist is Empty */}
        {wishlistItems.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-32">
            <Ionicons name="heart-dislike-outline" size={64} color="#d4d4d8" />
            <Text className="text-neutral-500 text-lg font-medium mt-4">
              Your wishlist is empty
            </Text>
          </View>
        ) : (
          /* Render Wishlist Items */
          wishlistItems.map((item) => (
            <View 
              key={item.id} 
              className="flex-row items-center py-4 border-b border-neutral-100"
            >
              {/* Product Image */}
              <Image 
                source={{ uri: item.image }} 
                className="w-24 h-32 rounded-lg object-cover"
              />

              {/* Product Details */}
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-neutral-500 text-sm font-bold mb-1">
                  {item.brand}
                </Text>
                <Text className="text-neutral-800 text-base font-medium mb-2 leading-5" numberOfLines={2}>
                  {item.name}
                </Text>
                
                <View className="flex-row items-center">
                  <Text className="text-neutral-900 font-bold text-lg mr-2">
                    {item.price}
                  </Text>
                  <Text className="text-[#ff3f6c] text-sm font-bold">
                    {item.discount}
                  </Text>
                </View>
              </View>

              {/* Delete (Trash) Button */}
              <TouchableOpacity 
                className="p-2 ml-2"
                onPress={() => removeItem(item.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#ff3f6c" />
              </TouchableOpacity>
            </View>
          ))
        )}
        
        {/* Extra padding at bottom for tab bar */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}