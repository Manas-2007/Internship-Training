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
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/api";

export default function Bag() {
  const [bagItems, setBagItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  const fetchBagItems = async () => {
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
        const itemsWithLocalQty = response.data.map((item) => ({
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
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBagItems();
    setRefreshing(false);
  }, []);

  const removeBagItem = async (itemId: string) => {
    try {
      setBagItems((prev) => prev.filter((item) => item._id !== itemId));
      await axios.delete(`${API_URL}/api/bag/${itemId}`);
    } catch (error) {
      Alert.alert("Error", "Could not remove item from bag.");
      fetchBagItems();
    }
  };

  const updateQuantity = async (itemId: string, type: "inc" | "dec") => {
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
      }),
    );

    try {
      await axios.put(`${API_URL}/api/bag/${itemId}`, { quantity: newQty });
    } catch (error) {
      console.log("Error updating quantity in DB:", error);
      fetchBagItems();
    }
  };

  const totalAmount = bagItems.reduce((sum, item) => {
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6" edges={["top"]}>
        <View className="w-28 h-28 bg-pink-50 rounded-full items-center justify-center mb-6">
          <Ionicons name="bag-handle-outline" size={48} color="#f43365" />
        </View>
        <Text className="text-3xl font-black text-neutral-800 mb-3 text-center tracking-tight">
          Login Required
        </Text>
        <Text className="text-base text-neutral-500 mb-10 text-center px-4 leading-6 font-medium">
          Login to your account to add items to your shopping bag, apply coupons, and checkout smoothly.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          className="bg-[#f43365] w-full py-4 rounded-2xl items-center shadow-sm"
        >
          <Text className="text-white font-black text-lg tracking-widest">
            LOGIN NOW
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-5 py-4 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-bold text-[#3e4152] tracking-tight">
          Shopping Bag
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f43365"
          />
        }
      >
        {bagItems.length === 0 ? (
          <View className="items-center justify-center mt-32">
            <Ionicons name="bag-handle-outline" size={60} color="#d4d4d8" />
            <Text className="text-neutral-500 text-base mt-4">
              Your bag is empty!
            </Text>
          </View>
        ) : (
          bagItems.map((item) => {
            const product = item.productId || {};
            const imageUrl =
              product.images?.[0] ||
              product.image ||
              "https://via.placeholder.com/150";

            return (
              <View
                key={item._id}
                className="flex-row py-5 border-b border-neutral-100 bg-white"
              >
                <TouchableOpacity
                  onPress={() => router.push(`/product/${product._id}`)}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-[100px] h-[130px] rounded-md object-cover bg-neutral-100"
                  />
                </TouchableOpacity>

                <View className="flex-1 ml-4 justify-between">
                  <View>
                    <Text className="text-neutral-500 text-sm font-medium mb-0.5">
                      {product.brand}
                    </Text>
                    <Text
                      className="text-[#282c3f] text-base font-semibold mb-1"
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    <Text className="text-neutral-500 text-sm mb-1">
                      Size: {item.size || "M"}
                    </Text>
                    <Text className="text-[#282c3f] font-black text-xl">
                      ₹{product.price}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => updateQuantity(item._id, "dec")}
                        className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center"
                      >
                        <Ionicons name="remove" size={16} color="#282c3f" />
                      </TouchableOpacity>

                      <Text className="font-bold text-base mx-4 text-[#282c3f]">
                        {item.localQuantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(item._id, "inc")}
                        className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center"
                      >
                        <Ionicons name="add" size={16} color="#282c3f" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeBagItem(item._id)}
                      className="p-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={24}
                        color="#f43365"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {bagItems.length > 0 && (
        <View className="bg-white px-5 py-4 border-t border-neutral-100 shadow-lg mb-20">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#3e4152] font-bold text-lg">
              Total Amount
            </Text>
            <Text className="text-[#282c3f] font-black text-2xl">
              ₹{totalAmount}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#f43365] w-full py-4 rounded-lg items-center justify-center"
            onPress={() =>
              router.push({ pathname: "/checkout", params: { totalAmount } })
            }
          >
            <Text className="text-white font-black text-base tracking-wider">
              PLACE ORDER
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}