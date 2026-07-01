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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  
  // Use 1024px for Desktop split view, 768px for Tablet width
  const isDesktop: boolean = width >= 1024; 
  const isTablet: boolean = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

  // Platform specific TabBar offset for mobile sticky footer
  const TABBAR_HEIGHT = Platform.OS === "ios" ? 88 : 75;

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
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6 w-full max-w-md mx-auto">
          <View className="w-24 h-24 md:w-28 md:h-28 bg-pink-50 rounded-full items-center justify-center mb-6 shadow-sm">
            <Ionicons name="bag-handle-outline" size={44} color="#ff3f6c" />
          </View>
          <Text className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 text-center tracking-tight">
            Login Required
          </Text>
          <Text className="text-base md:text-lg text-neutral-500 mb-10 text-center px-4 leading-6 font-medium">
            Login to your account to add items to your shopping bag, apply coupons, and checkout smoothly.
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

  const DesktopOrderSummary = () => (
    <View className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
      <View className="flex-row items-center mb-6">
        <Ionicons name="receipt" size={20} color="#ff3f6c" />
        <Text className="text-lg md:text-xl font-bold text-neutral-800 ml-2.5 tracking-tight">Price Details</Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <Text className="text-neutral-600 text-sm md:text-base font-medium">Total MRP</Text>
        <Text className="text-neutral-900 font-semibold text-sm md:text-base">₹{totalAmount}</Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <Text className="text-neutral-600 text-sm md:text-base font-medium">Platform Fee</Text>
        <Text className="text-emerald-600 font-semibold text-sm md:text-base">FREE</Text>
      </View>

      <View className="flex-row justify-between mb-6 pb-6 border-b border-dashed border-neutral-200">
        <Text className="text-neutral-600 text-sm md:text-base font-medium">Shipping Fee</Text>
        <Text className="text-emerald-600 font-semibold text-sm md:text-base">FREE</Text>
      </View>

      <View className="flex-row justify-between items-center mb-8 pt-1">
        <Text className="text-neutral-800 font-bold text-base md:text-lg">Total Amount</Text>
        <Text className="text-neutral-900 font-bold text-xl md:text-2xl tracking-tight">₹{totalAmount}</Text>
      </View>

      <TouchableOpacity
        className="bg-[#ff3f6c] w-full py-4 rounded-xl items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
        onPress={() => router.push({ pathname: "/checkout", params: { totalAmount } })}
      >
        <Text className="text-white font-bold text-sm md:text-base tracking-widest uppercase">
          PLACE ORDER
        </Text>
      </TouchableOpacity>
    </View>
  );

  const MobileOrderSummary = () => (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-4 border-t border-neutral-100 shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)] z-50"
      style={{ paddingBottom: Math.max(insets.bottom + 10, TABBAR_HEIGHT + 10) }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-neutral-600 font-semibold text-sm">Total Amount</Text>
        <Text className="text-neutral-900 font-bold text-xl tracking-tight">₹{totalAmount}</Text>
      </View> 
      <TouchableOpacity
        className="bg-[#ff3f6c] w-full py-3.5 rounded-xl items-center justify-center shadow-sm active:opacity-90"
        onPress={() => router.push({ pathname: "/checkout", params: { totalAmount } })}
      >
        <Text className="text-white font-bold text-sm tracking-widest uppercase">
          PLACE ORDER
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1 relative">
        
        {/* Mobile Header */}
        {!isLargeScreen && (
          <View className="px-5 py-4 bg-white border-b border-neutral-100 z-10 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center">
              <Ionicons name="bag-handle" size={24} color="#ff3f6c" />
              <Text className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight ml-2.5">
                Shopping Bag
              </Text>
            </View>
            <Text className="text-xs md:text-sm font-semibold text-neutral-500">
              {bagItems.length} {bagItems.length === 1 ? "Item" : "Items"}
            </Text>
          </View>
        )}

        {/* Main Content Area */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          // Responsive padding: Extra padding on mobile so content doesn't hide behind absolute footer
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingTop: isLargeScreen ? 24 : 16,
            paddingBottom: isDesktop ? 60 : TABBAR_HEIGHT + 140 
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff3f6c" />
          }
        >
          <View className={`w-full flex-1 px-4 md:px-6 lg:px-8`}>
            {bagItems.length === 0 ? (
              <View className="flex-1 items-center justify-center pt-20">
                <View className="w-24 h-24 md:w-32 md:h-32 bg-white border border-neutral-100 shadow-sm rounded-full items-center justify-center mb-6">
                  <Ionicons name="bag-handle-outline" size={48} color="#a3a3a3" />
                </View>
                <Text className="text-neutral-900 text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                  Your bag is empty!
                </Text>
                <Text className="text-neutral-500 text-base md:text-lg font-medium text-center px-10">
                  Explore our categories and add some items to your bag.
                </Text>
              </View>
            ) : (
              // Side-by-Side Layout Wrapper for Desktop
              <View className={isDesktop ? "flex-row w-full gap-8 lg:gap-12" : "flex-col"}>
                
                {/* Left Side: Items */}
                <View className="flex-1">
                  {bagItems.map((item, index) => {
                    const product = item.productId || ({} as Product);
                    const imageUrl = product.images?.[0] || product.image || "https://via.placeholder.com/150";

                    return (
                      <View
                        key={item._id}
                        className={`flex-row p-4 md:p-5 bg-white rounded-2xl border border-neutral-100 mb-4 md:mb-5 shadow-sm transition-all ${
                          isDesktop ? "hover:shadow-md" : ""
                        }`}
                      >
                        {/* Product Image + Cross Button Container */}
                        <View className="relative">
                          <TouchableOpacity
                            onPress={() => router.push(`/product/${product._id}`)}
                            className="cursor-pointer"
                            activeOpacity={0.9}
                          >
                            <Image
                              source={{ uri: imageUrl }}
                              className="w-[100px] h-[130px] md:w-[120px] md:h-[160px] rounded-xl object-cover bg-neutral-50 border border-neutral-100"
                            />
                          </TouchableOpacity>

                          {/* Cross Button */}
                          <TouchableOpacity
                            onPress={() => removeBagItem(item._id)}
                            className="absolute -top-2.5 -right-2.5 bg-white p-1.5 rounded-full shadow-sm border border-neutral-200 z-10 hover:bg-red-50 transition-colors"
                          >
                            <Ionicons name="close" size={16} color="#404040" />
                          </TouchableOpacity>
                        </View>

                        {/* Product Details & Quantity */}
                        <View className="flex-1 ml-5 md:ml-6 justify-between py-1">
                          <View>
                            <Text className="text-neutral-500 text-[10px] md:text-xs font-bold mb-1.5 tracking-widest uppercase" numberOfLines={1}>
                              {product.brand || "Brand"}
                            </Text>
                            <Text
                              className="text-neutral-900 text-sm md:text-base font-semibold mb-2 leading-5"
                              numberOfLines={2}
                            >
                              {product.name || "Product Name"}
                            </Text>
                            <Text className="text-neutral-500 text-xs md:text-sm font-medium mb-2.5">
                              Size: <Text className="text-neutral-800 font-bold">{item.size || "M"}</Text>
                            </Text>
                            <Text className="text-neutral-900 font-bold text-lg md:text-xl tracking-tight">
                              ₹{product.price || 0}
                            </Text>
                          </View>

                          {/* Quantity Selector */}
                          <View className="flex-row items-center mt-3">
                            <View className="flex-row items-center bg-white rounded-lg border border-neutral-200 overflow-hidden">
                              <TouchableOpacity
                                onPress={() => updateQuantity(item._id, "dec")}
                                className="w-8 h-8 md:w-10 md:h-10 items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors active:bg-neutral-200"
                              >
                                <Ionicons name="remove" size={16} color="#404040" />
                              </TouchableOpacity>

                              <Text className="font-bold text-sm md:text-base w-8 md:w-10 text-center text-neutral-800">
                                {item.localQuantity}
                              </Text>

                              <TouchableOpacity
                                onPress={() => updateQuantity(item._id, "inc")}
                                className="w-8 h-8 md:w-10 md:h-10 items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors active:bg-neutral-200"
                              >
                                <Ionicons name="add" size={16} color="#404040" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Right Side: Order Summary (Desktop Only) */}
                {isDesktop && (
                  <View className="w-[350px] lg:w-[380px]">
                    <View className="sticky top-6">
                      <DesktopOrderSummary />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Mobile/Tablet Order Summary Footer */}
        {(!isDesktop && bagItems.length > 0) && <MobileOrderSummary />}
      </View>
    </SafeAreaView>
  );
}