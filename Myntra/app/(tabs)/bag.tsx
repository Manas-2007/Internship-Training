import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// Dummy data for Cart/Bag
const initialCart = [
  {
    id: 1,
    name: "White Cotton T-Shirt",
    brand: "H&M",
    size: "L",
    price: 799,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Blue Denim Jacket",
    brand: "Levis",
    size: "M",
    price: 2999,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
  },
];

export default function Bag() {
  const router=useRouter();

  const [cartItems, setCartItems] = useState(initialCart);

  // --- Logic Functions ---
  const updateQuantity = (id: number, type: 'inc' | 'dec') => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = type === 'inc' ? item.quantity + 1 : item.quantity - 1;
          // Quantity 1 se kam nahi honi chahiye (uske liye delete button hai)
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Calculate Total Amount dynamically
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-neutral-100">
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">
          Shopping Bag
        </Text>
      </View>

      {/* Cart Items List */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4">
        {cartItems.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-32">
            <Ionicons name="bag-outline" size={64} color="#d4d4d8" />
            <Text className="text-neutral-500 text-lg font-medium mt-4">
              Your bag is empty
            </Text>
          </View>
        ) : (
          cartItems.map((item) => (
            <View 
              key={item.id} 
              className="flex-row py-4 border-b border-neutral-100"
            >
              {/* Product Image */}
              <Image 
                source={{ uri: item.image }} 
                className="w-24 h-32 rounded-lg object-cover bg-neutral-100"
              />

              {/* Product Details & Controls */}
              <View className="flex-1 ml-4 justify-between py-1">
                <View>
                  <Text className="text-neutral-500 text-sm font-bold mb-1">{item.brand}</Text>
                  <Text className="text-neutral-800 text-base font-medium leading-5 mb-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-neutral-500 text-sm mb-2">Size: {item.size}</Text>
                  <Text className="text-neutral-900 font-bold text-lg">₹{item.price}</Text>
                </View>

                {/* Bottom Row: Quantity Controls & Delete */}
                <View className="flex-row items-center justify-between mt-3">
                  
                  {/* Quantity Pill */}
                  <View className="flex-row items-center bg-neutral-100 rounded-full">
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.id, 'dec')}
                      className="w-8 h-8 items-center justify-center rounded-l-full"
                    >
                      <Ionicons name="remove" size={18} color="#52525b" />
                    </TouchableOpacity>
                    
                    <Text className="w-8 text-center font-bold text-neutral-800">
                      {item.quantity}
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.id, 'inc')}
                      className="w-8 h-8 items-center justify-center rounded-r-full"
                    >
                      <Ionicons name="add" size={18} color="#52525b" />
                    </TouchableOpacity>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity 
                    onPress={() => removeItem(item.id)}
                    className="p-2 bg-pink-50 rounded-full"
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff3f6c" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Checkout Footer - Only show if cart is not empty */}
      {cartItems.length > 0 && (
        <View className="p-4 bg-white border-t border-neutral-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-neutral-600">Total Amount</Text>
            <Text className="text-2xl font-black text-neutral-900">₹{totalAmount}</Text>
          </View>
          
          <TouchableOpacity className="bg-[#ff3f6c] py-4 rounded-xl items-center shadow-sm mb-2"
          onPress={() => router.push("/checkout")}
          >
            <Text className="text-white font-bold text-lg tracking-widest">
              PLACE ORDER
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}