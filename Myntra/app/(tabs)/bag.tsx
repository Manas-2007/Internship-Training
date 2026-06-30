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
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/api";

interface Product {
  _id: string;
  brand?: string;
  name?: string;
  price?: number;
  images?: string[];
  image?: string;
}

interface BagItem {
  _id: string;
  productId: Product;
  size?: string;
  quantity?: number;
  localQuantity: number;
}

export default function Bag() {
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 768;

  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const fetchBagItems = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setIsGuest(true);
        setLoading(false);
        return;
      }
      setIsGuest(false);

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

      const response = await axios.get(`${API_URL}/api/bag/${userId}`);
      if (Array.isArray(response.data)) {
        const itemsWithLocalQty = response.data.map((item: any) => ({
          ...item,
          localQuantity: item.quantity || 1,
        }));
        setBagItems(itemsWithLocalQty);
      } else {
        setBagItems([]);
      }
    } catch (error) {
      console.log("Bag Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBagItems();
    }, [])
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchBagItems();
    setRefreshing(false);
  }, []);

  const removeBagItem = async (itemId: string): Promise<void> => {
    try {
      setBagItems((prev) => prev.filter((item) => item._id !== itemId));
      await axios.delete(`${API_URL}/api/bag/${itemId}`);
    } catch (error) {
      showMessage("Error", "Could not remove item from bag.");
      fetchBagItems();
    }
  };

  const updateQuantity = async (itemId: string, type: "inc" | "dec"): Promise<void> => {
    let newQty = 1;

    setBagItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === itemId) {
          newQty = item.localQuantity;
          if (type === "inc") newQty += 1;
          if (type === "dec" && newQty > 1) newQty -= 1;
          return { ...item, localQuantity: newQty, quantity: newQty };
        }
        return item;
      })
    );

    try {
      await axios.put(`${API_URL}/api/bag/${itemId}`, { quantity: newQty });
    } catch (error) {
      console.log("Error updating quantity in DB:", error);
      fetchBagItems();
    }
  };

  const totalAmount: number = bagItems.reduce((sum, item) => {
    const price = item.productId?.price || 0;
    return sum + price * item.localQuantity;
  }, 0);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f43365" />
      </View>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6 w-full max-w-md mx-auto">
          <View className="w-24 h-24 bg-pink-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="bag-handle-outline" size={40} color="#f43365" />
          </View>
          <Text className="text-3xl font-bold text-neutral-800 mb-3 text-center tracking-tight">
            Login Required
          </Text>
          <Text className="text-base text-neutral-500 mb-10 text-center px-4 leading-6 font-medium">
            Login to your account to add items to your shopping bag, apply coupons, and checkout smoothly.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-[#f43365] w-full py-4 rounded-xl items-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Text className="text-white font-bold text-lg tracking-wide">
              LOGIN NOW
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const DesktopOrderSummary = () => (
    <View className="mt-8 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
      <Text className="text-xl font-bold text-neutral-900 mb-6">Price Details</Text>
      
      <View className="flex-row justify-between mb-4">
        <Text className="text-neutral-600 text-base">Total MRP</Text>
        <Text className="text-neutral-900 font-medium text-base">₹{totalAmount}</Text>
      </View>
      
      <View className="flex-row justify-between mb-4">
        <Text className="text-neutral-600 text-base">Platform Fee</Text>
        <Text className="text-emerald-600 font-medium text-base">FREE</Text>
      </View>
      
      <View className="flex-row justify-between mb-6 pb-6 border-b border-neutral-200">
        <Text className="text-neutral-600 text-base">Shipping Fee</Text>
        <Text className="text-emerald-600 font-medium text-base">FREE</Text>
      </View>

      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-neutral-900 font-bold text-xl">Total Amount</Text>
        <Text className="text-neutral-900 font-bold text-2xl tracking-tight">₹{totalAmount}</Text>
      </View>

      <TouchableOpacity
        className="bg-[#f43365] w-full py-4 rounded-xl items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
        onPress={() => router.push({ pathname: "/checkout", params: { totalAmount } })}
      >
        <Text className="text-white font-bold text-lg tracking-wider">
          PLACE ORDER
        </Text>
      </TouchableOpacity>
    </View>
  );

  const MobileOrderSummary = () => (
    <View className="bg-white px-5 py-5 border-t border-neutral-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] absolute bottom-0 w-full z-50">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-neutral-600 font-semibold text-base">Total Amount</Text>
        <Text className="text-neutral-900 font-bold text-xl tracking-tight">₹{totalAmount}</Text>
      </View>
      <TouchableOpacity
        className="bg-[#f43365] w-full py-3.5 rounded-xl items-center justify-center shadow-sm shadow-pink-200"
        onPress={() => router.push({ pathname: "/checkout", params: { totalAmount } })}
      >
        <Text className="text-white font-bold text-base tracking-wider">
          PLACE ORDER
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-5 py-5 bg-white border-b border-neutral-100 z-10">
        <View className="w-full max-w-3xl mx-auto flex-row justify-between items-end">
          <Text className="text-3xl font-bold text-neutral-900 tracking-tight">
            Shopping Bag
          </Text>
          <Text className="text-sm font-medium text-neutral-500 mb-1">
            {bagItems.length} {bagItems.length === 1 ? "Item" : "Items"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f43365"
          />
        }
      >
        <View className={`w-full max-w-3xl mx-auto flex-1 ${isLargeScreen ? "px-8 py-8" : "px-4 py-4"}`}>
          {bagItems.length === 0 ? (
            <View className="flex-1 items-center justify-center pt-20">
              <View className="w-24 h-24 bg-neutral-50 rounded-full items-center justify-center mb-5">
                <Ionicons name="bag-handle-outline" size={40} color="#a3a3a3" />
              </View>
              <Text className="text-neutral-800 text-2xl font-bold mb-2">
                Your bag is empty!
              </Text>
              <Text className="text-neutral-500 text-base text-center px-10">
                Explore our categories and add some items to your bag.
              </Text>
            </View>
          ) : (
            <View className={isLargeScreen ? "pb-10" : "pb-32"}>
              {bagItems.map((item) => {
                const product = item.productId || {} as Product;
                const imageUrl =
                  product.images?.[0] ||
                  product.image ||
                  "https://via.placeholder.com/150";

                return (
                  <View
                    key={item._id}
                    className={`flex-row py-6 border-b border-neutral-100 ${isLargeScreen ? "hover:bg-neutral-50 transition-colors -mx-4 px-4 rounded-xl" : ""}`}
                  >
                    <TouchableOpacity
                      onPress={() => router.push(`/product/${product._id}`)}
                      className="cursor-pointer"
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-[120px] h-[160px] rounded-xl object-cover bg-neutral-100"
                      />
                    </TouchableOpacity>

                    <View className="flex-1 ml-6 justify-between py-1">
                      <View>
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1 pr-4">
                            <Text className="text-neutral-500 text-xs font-bold mb-1.5 tracking-widest uppercase">
                              {product.brand || "Brand"}
                            </Text>
                            <Text
                              className="text-neutral-900 text-lg font-semibold mb-2 leading-6"
                              numberOfLines={2}
                            >
                              {product.name || "Product Name"}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => removeBagItem(item._id)}
                            className="p-2 -mt-2 -mr-2 bg-transparent rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Ionicons name="close" size={24} color="#a3a3a3" />
                          </TouchableOpacity>
                        </View>
                        
                        <Text className="text-neutral-500 text-sm font-medium mb-3">
                          Size: <Text className="text-neutral-800 font-bold">{item.size || "M"}</Text>
                        </Text>
                        <Text className="text-neutral-900 font-bold text-2xl tracking-tight">
                          ₹{product.price || 0}
                        </Text>
                      </View>

                      <View className="flex-row items-center mt-4">
                        <View className="flex-row items-center bg-neutral-50 rounded-full border border-neutral-200">
                          <TouchableOpacity
                            onPress={() => updateQuantity(item._id, "dec")}
                            className="w-10 h-10 items-center justify-center hover:bg-neutral-100 rounded-l-full transition-colors cursor-pointer"
                          >
                            <Ionicons name="remove" size={16} color="#404040" />
                          </TouchableOpacity>

                          <Text className="font-bold text-base w-8 text-center text-neutral-800">
                            {item.localQuantity}
                          </Text>

                          <TouchableOpacity
                            onPress={() => updateQuantity(item._id, "inc")}
                            className="w-10 h-10 items-center justify-center hover:bg-neutral-100 rounded-r-full transition-colors cursor-pointer"
                          >
                            <Ionicons name="add" size={16} color="#404040" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
              
              {isLargeScreen && <DesktopOrderSummary />}
            </View>
          )}
        </View>
      </ScrollView>

      {(!isLargeScreen && bagItems.length > 0) && <MobileOrderSummary />}
    </SafeAreaView>
  );
}