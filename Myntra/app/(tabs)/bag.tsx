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
<<<<<<< HEAD
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";import { Ionicons } from "@expo/vector-icons";
=======
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
>>>>>>> 130e18e5da03865e4a9c1ddc47f97e0b62ba2c05
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/api";
// 👉 Import ThemeContext
import { useTheme } from "../context/ThemeContext";

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
  const insets = useSafeAreaInsets();
  

  // 👉 Extract colors and isDark
  const { colors, isDark } = useTheme();

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
            <Ionicons name="bag-handle-outline" size={44} color={colors.primary} />
          </View>
          <Text className="text-3xl md:text-4xl font-bold mb-3 text-center tracking-tight" style={{ color: colors.textMain }}>
            Login Required
          </Text>
          <Text className="text-base md:text-lg mb-10 text-center px-4 leading-6 font-medium" style={{ color: colors.textMuted }}>
            Login to your account to add items to your shopping bag, apply coupons, and checkout smoothly.
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

  const DesktopOrderSummary = () => (
    <View 
      className="p-6 rounded-2xl border shadow-sm"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-center mb-6">
        <Ionicons name="receipt" size={20} color={colors.primary} />
        <Text className="text-lg md:text-xl font-bold ml-2.5 tracking-tight" style={{ color: colors.textMain }}>Price Details</Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <Text className="text-sm md:text-base font-medium" style={{ color: colors.textMuted }}>Total MRP</Text>
        <Text className="font-semibold text-sm md:text-base" style={{ color: colors.textMain }}>₹{totalAmount}</Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <Text className="text-sm md:text-base font-medium" style={{ color: colors.textMuted }}>Platform Fee</Text>
        <Text className="font-semibold text-sm md:text-base" style={{ color: isDark ? '#34d399' : '#059669' }}>FREE</Text>
      </View>

      <View 
        className="flex-row justify-between mb-6 pb-6 border-b border-dashed"
        style={{ borderBottomColor: colors.border }}
      >
        <Text className="text-sm md:text-base font-medium" style={{ color: colors.textMuted }}>Shipping Fee</Text>
        <Text className="font-semibold text-sm md:text-base" style={{ color: isDark ? '#34d399' : '#059669' }}>FREE</Text>
      </View>

      <View className="flex-row justify-between items-center mb-8 pt-1">
        <Text className="font-bold text-base md:text-lg" style={{ color: colors.textMain }}>Total Amount</Text>
        <Text className="font-bold text-xl md:text-2xl tracking-tight" style={{ color: colors.textMain }}>₹{totalAmount}</Text>
      </View>

      <TouchableOpacity
        className="w-full py-4 rounded-xl items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
        style={{ backgroundColor: colors.primary }}
        onPress={() => router.push({ pathname: "/checkout", params: { totalAmount } })}
      >
        <Text className="text-white font-bold text-sm md:text-base tracking-widest uppercase">
          PLACE ORDER
        </Text>
      </TouchableOpacity>
    </View>
  );

  const MobileOrderSummary = () => (
<<<<<<< HEAD
  <View 
    className="bg-white px-5 pt-4 border-t border-neutral-200 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    style={{ paddingBottom: insets.bottom + 16 }} // device ki safe area ke hisaab se space legi
  >
    <View className="flex-row justify-between items-center mb-3.5">
      <Text className="text-neutral-600 font-semibold text-base">Total Amount</Text>
      <Text className="text-neutral-900 font-bold text-xl tracking-tight">₹{totalAmount}</Text>
=======
    <View 
      className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-4 border-t shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)] z-50"
      style={{ 
        backgroundColor: colors.surface, 
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom + 10, TABBAR_HEIGHT + 10) 
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semibold text-sm" style={{ color: colors.textMuted }}>Total Amount</Text>
        <Text className="font-bold text-xl tracking-tight" style={{ color: colors.textMain }}>₹{totalAmount}</Text>
      </View> 
      <TouchableOpacity
        className="w-full py-3.5 rounded-xl items-center justify-center shadow-sm active:opacity-90"
        style={{ backgroundColor: colors.primary }}
        onPress={() => router.push({ pathname: "/checkout", params: { totalAmount } })}
      >
        <Text className="text-white font-bold text-sm tracking-widest uppercase">
          PLACE ORDER
        </Text>
      </TouchableOpacity>
>>>>>>> 130e18e5da03865e4a9c1ddc47f97e0b62ba2c05
    </View>
    <TouchableOpacity
      className="bg-[#ff3f6c] w-full py-3.5 rounded-xl items-center justify-center shadow-sm shadow-pink-200"
      onPress={() => router.push({ pathname: "/checkout", params: { totalAmount } })}
    >
      <Text className="text-white font-bold text-base tracking-wider">
        PLACE ORDER
      </Text>
    </TouchableOpacity>
  </View>
);

  return (
<<<<<<< HEAD
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
     {/* HEADER: Hidden on Large Screens */}
{!isLargeScreen && (
  <View className="px-5 py-5 bg-white border-b border-neutral-100 z-10 flex-row items-center justify-between">
    
    {/* Left Side: Icon + Title */}
    <View className="flex-row items-center">
      <Ionicons name="bag-handle" size={24} color="#f43365" />
      <Text className="text-2xl font-bold text-neutral-900 tracking-tight ml-3">
        Shopping Bag
      </Text>
    </View>
    
    {/* Right Side: Items Count */}
    <Text className="text-sm font-medium text-neutral-500">
      {bagItems.length} {bagItems.length === 1 ? "Item" : "Items"}
    </Text>
    
  </View>
)}

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f43365" />
        }
      >
        <View className={`w-full flex-1 px-4 lg:px-12 py-0 lg:py-6`}>
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
=======
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1 relative">
        
        {/* Mobile Header */}
        {!isLargeScreen && (
          <View 
            className="px-5 py-4 border-b z-10 flex-row items-center justify-between shadow-sm"
            style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
          >
            <View className="flex-row items-center">
              <Ionicons name="bag-handle" size={24} color={colors.primary} />
              <Text className="text-xl md:text-2xl font-bold tracking-tight ml-2.5" style={{ color: colors.textMain }}>
                Shopping Bag
>>>>>>> 130e18e5da03865e4a9c1ddc47f97e0b62ba2c05
              </Text>
            </View>
            <Text className="text-xs md:text-sm font-semibold" style={{ color: colors.textMuted }}>
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
        >
          <View className={`w-full flex-1 px-4 md:px-6 lg:px-8`}>
            {bagItems.length === 0 ? (
              <View className="flex-1 items-center justify-center pt-20">
                <View 
                  className="w-24 h-24 md:w-32 md:h-32 border shadow-sm rounded-full items-center justify-center mb-6"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <Ionicons name="bag-handle-outline" size={48} color={colors.textMuted} />
                </View>
                <Text className="text-2xl md:text-3xl font-bold mb-3 tracking-tight" style={{ color: colors.textMain }}>
                  Your bag is empty!
                </Text>
                <Text className="text-base md:text-lg font-medium text-center px-10" style={{ color: colors.textMuted }}>
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

<<<<<<< HEAD
                        {/* Cross Button inside the Image */}
                        <TouchableOpacity
                          onPress={() => removeBagItem(item._id)}
                          className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md border border-neutral-100 z-10"
                        >
                          <Ionicons name="close" size={18} color="#404040" />
                        </TouchableOpacity>
                      </View>

                      {/* Product Details & Quantity */}
                      <View className="flex-1 ml-6 justify-between py-1">
                        <View>
                          <Text className="text-neutral-500 text-xs font-bold mb-1.5 tracking-widest uppercase">
                            {product.brand || "Brand"}
                          </Text>
                          <Text
                            className="text-neutral-900 text-2sm md:text-lg font-semibold mb-2 leading-6"
                            numberOfLines={2}
                          >
                            {product.name || "Product Name"}
                          </Text>
                          <Text className="text-neutral-500 text-sm font-medium mb-3">
                            Size: <Text className="text-neutral-800 font-bold">{item.size || "M"}</Text>
                          </Text>
                          <Text className="text-neutral-900 font-bold text-xl md:text-2xl tracking-tight">
                            ₹{product.price || 0}
                          </Text>
=======
                    return (
                      <View
                        key={item._id}
                        className={`flex-row p-4 md:p-5 rounded-2xl border mb-4 md:mb-5 shadow-sm transition-all ${
                          isDesktop ? "hover:shadow-md" : ""
                        }`}
                        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
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
                              className="w-[100px] h-[130px] md:w-[120px] md:h-[160px] rounded-xl object-cover border"
                              style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            />
                          </TouchableOpacity>

                          {/* Cross Button */}
                          <TouchableOpacity
                            onPress={() => removeBagItem(item._id)}
                            className="absolute -top-2.5 -right-2.5 p-1.5 rounded-full shadow-sm border z-10 transition-colors"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(38,38,38,0.95)' : 'rgba(255,255,255,0.95)', 
                              borderColor: colors.border 
                            }}
                          >
                            <Ionicons name="close" size={16} color={colors.textMain} />
                          </TouchableOpacity>
>>>>>>> 130e18e5da03865e4a9c1ddc47f97e0b62ba2c05
                        </View>

                        {/* Product Details & Quantity */}
                        <View className="flex-1 ml-5 md:ml-6 justify-between py-1">
                          <View>
                            <Text className="text-[10px] md:text-xs font-bold mb-1.5 tracking-widest uppercase" numberOfLines={1} style={{ color: colors.textMuted }}>
                              {product.brand || "Brand"}
                            </Text>
                            <Text
                              className="text-sm md:text-base font-semibold mb-2 leading-5"
                              numberOfLines={2}
                              style={{ color: colors.textMain }}
                            >
                              {product.name || "Product Name"}
                            </Text>
                            <Text className="text-xs md:text-sm font-medium mb-2.5" style={{ color: colors.textMuted }}>
                              Size: <Text className="font-bold" style={{ color: colors.textMain }}>{item.size || "M"}</Text>
                            </Text>
                            <Text className="font-bold text-lg md:text-xl tracking-tight" style={{ color: colors.textMain }}>
                              ₹{product.price || 0}
                            </Text>
                          </View>

                          {/* Quantity Selector */}
                          <View className="flex-row items-center mt-3">
                            <View 
                              className="flex-row items-center rounded-lg border overflow-hidden"
                              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                            >
                              <TouchableOpacity
                                onPress={() => updateQuantity(item._id, "dec")}
                                className="w-8 h-8 md:w-10 md:h-10 items-center justify-center transition-colors"
                                style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}
                              >
                                <Ionicons name="remove" size={16} color={colors.textMain} />
                              </TouchableOpacity>

                              <Text className="font-bold text-sm md:text-base w-8 md:w-10 text-center" style={{ color: colors.textMain }}>
                                {item.localQuantity}
                              </Text>

                              <TouchableOpacity
                                onPress={() => updateQuantity(item._id, "inc")}
                                className="w-8 h-8 md:w-10 md:h-10 items-center justify-center transition-colors"
                                style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}
                              >
                                <Ionicons name="add" size={16} color={colors.textMain} />
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