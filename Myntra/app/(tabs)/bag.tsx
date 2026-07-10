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
import { useRouter, useFocusEffect } from "expo-router";
import { API_URL } from "../constants/api";
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
  // 👉 NAYA: Status batayega ki item cart mein hai ya save for later mein
  status?: 'active' | 'saved'; 
}

export default function Bag() {
  // 👉 UPDATED: bagItems ki jagah 2 alag states bana di hain
  const [activeItems, setActiveItems] = useState<BagItem[]>([]);
  const [savedItems, setSavedItems] = useState<BagItem[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const router = useRouter();

  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const isDesktop: boolean = width >= 1024; 
  const isTablet: boolean = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;

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
      const mapQty = (items: any[]) => items.map((item: any) => ({ ...item, localQuantity: item.quantity || 1 }));
      
      // 👉 UPDATED: Backend se aayi dono lists set kar di
      setActiveItems(mapQty(response.data.activeItems || []));
      setSavedItems(mapQty(response.data.savedItems || []));
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
      // 👉 UPDATED: Dono lists se remove karna handle kiya
      setActiveItems((prev) => prev.filter((item) => item._id !== itemId));
      setSavedItems((prev) => prev.filter((item) => item._id !== itemId));
      await axios.delete(`${API_URL}/api/bag/${itemId}`);
    } catch (error) {
      showMessage("Error", "Could not remove item.");
      fetchBagItems();
    }
  };

  // 👉 NAYA FUNCTION: Active se Saved For Later mein move karna
  const toggleItemStatus = async (itemId: string): Promise<void> => {
    try {
      await axios.put(`${API_URL}/api/bag/toggle-status/${itemId}`);
      fetchBagItems(); // Refresh items to show new list
    } catch (error: any) {
      if (error.response?.status === 409) showMessage("Conflict", error.response.data.message);
    }
  };

  const updateQuantity = async (itemId: string, type: "inc" | "dec"): Promise<void> => {
    let newQty = 1;
    const updateLogic = (prevItems: BagItem[]) => prevItems.map((item) => {
      if (item._id === itemId) {
        newQty = item.localQuantity;
        if (type === "inc") newQty += 1;
        if (type === "dec" && newQty > 1) newQty -= 1;
        return { ...item, localQuantity: newQty, quantity: newQty };
      }
      return item;
    });

    // 👉 UPDATED: Update quantity in both active and saved views
    setActiveItems(updateLogic);
    setSavedItems(updateLogic);

    try {
      await axios.put(`${API_URL}/api/bag/${itemId}`, { quantity: newQty });
    } catch (error: any) {
      if (error.response?.status === 409) showMessage("Notice", error.response.data.message);
      fetchBagItems();
    }
  };

  // 👉 NAYA FUNCTION: Checkout se pehle validation and price check
  const handleCheckout = async () => {
    setIsValidating(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const decoded: any = jwtDecode(token!);
      const userId = decoded.id || decoded._id;

      const res = await axios.get(`${API_URL}/api/bag/validate/${userId}`);
      if (res.data.success) {
        router.push({ pathname: "/checkout", params: { totalAmount: String(res.data.cartTotal) } });
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        showMessage("Cart Updated", error.response.data.issues.join("\n\n"));
        fetchBagItems(); 
      } else {
        showMessage("Error", "Validation failed. Please try again.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  // 👉 UPDATED: Total amount sirf 'active' items ka count hoga
  const totalAmount: number = activeItems.reduce((sum, item) => {
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
        style={{ backgroundColor: (isValidating || activeItems.length === 0) ? colors.border : colors.primary }}
        onPress={handleCheckout}
        disabled={isValidating || activeItems.length === 0}
      >
        {isValidating ? (
           <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-bold text-sm md:text-base tracking-widest uppercase">
            PLACE ORDER
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const MobileOrderSummary = () => (
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
        className="w-full py-4 rounded-xl items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
        style={{ backgroundColor: (isValidating || activeItems.length === 0) ? colors.border : colors.primary }}
        onPress={handleCheckout}
        disabled={isValidating || activeItems.length === 0}
      >
        {isValidating ? (
           <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-bold text-sm tracking-widest uppercase">
            PLACE ORDER
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
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
              </Text>
            </View>
            <Text className="text-xs md:text-sm font-semibold" style={{ color: colors.textMuted }}>
              {activeItems.length} {activeItems.length === 1 ? "Item" : "Items"}
            </Text>
          </View>
        )}

        {/* Main Content Area */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
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
            {activeItems.length === 0 && savedItems.length === 0 ? (
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
                  
                  {/* ===================== ACTIVE BAG SECTION ===================== */}
                  {activeItems.length > 0 && (
                    <View>
                      <Text className="font-bold text-base uppercase tracking-widest mb-4 mt-2" style={{ color: colors.textMain }}>
                        Active Bag ({activeItems.length})
                      </Text>

                      {activeItems.map((item, index) => {
                        const product = item.productId || ({} as Product);
                        const imageUrl = product.images?.[0] || product.image || "https://via.placeholder.com/150";

                        return (
                          <View
                            key={item._id}
                            className={`flex-row p-4 md:p-5 rounded-2xl border mb-4 md:mb-5 shadow-sm transition-all ${
                              isDesktop ? "hover:shadow-md" : ""
                            }`}
                            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                          >
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
                            </View>

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

                              {/* 👉 NAYA ROW: Quantity aur Save for Later button ek sath */}
                              <View className="flex-row items-center justify-between mt-3">
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

                                <TouchableOpacity 
                                  onPress={() => toggleItemStatus(item._id)}
                                  className="px-3 py-1.5 rounded-lg border border-dashed"
                                  style={{ borderColor: colors.border }}
                                >
                                  <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.textMuted }}>
                                    Save
                                  </Text>
                                </TouchableOpacity>
                              </View>

                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* ===================== SAVED FOR LATER SECTION ===================== */}
                  {savedItems.length > 0 && (
                    <View className="mt-4 pt-6 border-t border-dashed" style={{ borderTopColor: colors.border }}>
                      <Text className="font-bold text-base uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>
                        Saved For Later ({savedItems.length})
                      </Text>

                      {savedItems.map((item, index) => {
                        const product = item.productId || ({} as Product);
                        const imageUrl = product.images?.[0] || product.image || "https://via.placeholder.com/150";

                        return (
                          <View
                            key={item._id}
                            className={`flex-row p-4 md:p-5 rounded-2xl border mb-4 md:mb-5 shadow-sm transition-all ${
                              isDesktop ? "hover:shadow-md" : ""
                            }`}
                            // 👉 Save for later items slightly faded
                            style={{ backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.85 }}
                          >
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
                            </View>

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

                              {/* 👉 Move to Bag Button */}
                              <View className="flex-row items-center justify-end mt-3">
                                <TouchableOpacity 
                                  onPress={() => toggleItemStatus(item._id)}
                                  className="px-4 py-2 rounded-lg border"
                                  style={{ borderColor: colors.primary, backgroundColor: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.05)' }}
                                >
                                  <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.primary }}>
                                    Move to Bag
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

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
        {(!isDesktop && activeItems.length > 0) && <MobileOrderSummary />}
      </View>
    </SafeAreaView>
  );
}