import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl, useWindowDimensions, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter, useFocusEffect } from "expo-router";

import { API_URL } from "../constants/api";
import { useTheme } from "../context/ThemeContext";

import BagEmptyState from "../../components/Bag Tab/BagEmptyState";
import BagSummaryCard from "../../components/Bag Tab/BagSummaryCard";
import ActiveBagSection from "../../components/Bag Tab/ActiveBagSection";
import SavedLaterSection from "../../components/Bag Tab/SavedLaterSection";

export default function Bag() {
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const isDesktop = width >= 1024; 
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = isDesktop || isTablet;
  const TABBAR_HEIGHT = Platform.OS === "ios" ? 88 : 75;

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const fetchBagItems = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) { setIsGuest(true); setLoading(false); return; }
      
      setIsGuest(false);
      let decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;
      if (!userId) return;

     const response = await axios.get(
        `${API_URL}/api/bag/${userId}?t=${new Date().getTime()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mapQty = (items: any[]) => items.map((item: any) => ({ ...item, localQuantity: item.quantity || 1 }));
      
      setActiveItems(mapQty(response.data.activeItems || []));
      setSavedItems(mapQty(response.data.savedItems || []));
    } catch (error) {
      console.error("Bag Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBagItems(); }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBagItems();
    setRefreshing(false);
  }, []);

  const removeBagItem = async (itemId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken"); 
      setActiveItems((prev) => prev.filter((item) => item._id !== itemId));
      setSavedItems((prev) => prev.filter((item) => item._id !== itemId));
      
      await axios.delete(`${API_URL}/api/bag/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      showMessage("Error", "Could not remove item.");
      fetchBagItems();
    }
  };

  const toggleItemStatus = async (itemId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(`${API_URL}/api/bag/toggle-status/${itemId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBagItems(); 
    } catch (error: any) {
      if (error.response?.status === 409) showMessage("Conflict", error.response.data.message);
    }
  };

  const updateQuantity = async (itemId: string, type: "inc" | "dec") => {
    let newQty = 1;
    const updateLogic = (prevItems: any[]) => prevItems.map((item) => {
      if (item._id === itemId) {
        newQty = item.localQuantity;
        if (type === "inc") newQty += 1;
        if (type === "dec" && newQty > 1) newQty -= 1;
        return { ...item, localQuantity: newQty, quantity: newQty };
      }
      return item;
    });

    setActiveItems(updateLogic);
    setSavedItems(updateLogic);

   try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(`${API_URL}/api/bag/${itemId}`, { quantity: newQty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error: any) {
      if (error.response?.status === 409) showMessage("Notice", error.response.data.message);
      fetchBagItems();
    }
  };

 const handleCheckout = async () => {
    setIsValidating(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const decoded: any = jwtDecode(token!);
      const userId = decoded.id || decoded._id;

      const res = await axios.get(
        `${API_URL}/api/bag/validate/${userId}?t=${new Date().getTime()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const totalAmount = activeItems.reduce((sum, item) => sum + (item.productId?.price || 0) * item.localQuantity, 0);

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
          <View className="w-24 h-24 md:w-28 md:h-28 rounded-full items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}>
            <Ionicons name="bag-handle-outline" size={44} color={colors.primary} />
          </View>
          <Text className="text-3xl md:text-4xl font-bold mb-3 text-center tracking-tight" style={{ color: colors.textMain }}>Login Required</Text>
          <Text className="text-base md:text-lg mb-10 text-center px-4 leading-6 font-medium" style={{ color: colors.textMuted }}>
            Login to your account to add items to your shopping bag, apply coupons, and checkout smoothly.
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")} className="w-full py-4 rounded-xl items-center shadow-sm" style={{ backgroundColor: colors.primary }}>
            <Text className="text-white font-bold text-lg md:text-xl tracking-wide">LOGIN NOW</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1 relative">
        
        {!isLargeScreen && (
          <View className="px-5 py-4 border-b z-10 flex-row items-center justify-between shadow-sm" style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}>
            <View className="flex-row items-center">
              <Ionicons name="bag-handle" size={24} color={colors.primary} />
              <Text className="text-xl md:text-2xl font-bold tracking-tight ml-2.5" style={{ color: colors.textMain }}>Shopping Bag</Text>
            </View>
            <Text className="text-xs md:text-sm font-semibold" style={{ color: colors.textMuted }}>
              {activeItems.length} {activeItems.length === 1 ? "Item" : "Items"}
            </Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingTop: isLargeScreen ? 24 : 16, paddingBottom: isDesktop ? 60 : TABBAR_HEIGHT + 140 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <View className="w-full flex-1 px-4 md:px-6 lg:px-8">
            {activeItems.length === 0 && savedItems.length === 0 ? (
              <BagEmptyState />
            ) : (
              <View className={isDesktop ? "flex-row w-full gap-8 lg:gap-12" : "flex-col"}>
                
                {/* Left Side: Items */}
                <View className="flex-1">
                  <ActiveBagSection
                    activeItems={activeItems}
                    isDesktop={isDesktop}
                    router={router}
                    removeBagItem={removeBagItem}
                    updateQuantity={updateQuantity}
                    toggleItemStatus={toggleItemStatus}
                  />
                  <SavedLaterSection
                    savedItems={savedItems}
                    isDesktop={isDesktop}
                    router={router}
                    removeBagItem={removeBagItem}
                    toggleItemStatus={toggleItemStatus}
                  />
                </View>

                {/* Right Side: Order Summary (Desktop) */}
                {isDesktop && (
                  <View className="w-[350px] lg:w-[380px]">
                    <View className="sticky top-6">
                      <BagSummaryCard
                        variant="desktop"
                        totalAmount={totalAmount}
                        isValidating={isValidating}
                        isDisabled={isValidating || activeItems.length === 0}
                        handleCheckout={handleCheckout}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Order Summary (Mobile/Tablet) */}
        {(!isDesktop && activeItems.length > 0) && (
          <BagSummaryCard
            variant="mobile"
            totalAmount={totalAmount}
            isValidating={isValidating}
            isDisabled={isValidating || activeItems.length === 0}
            handleCheckout={handleCheckout}
            bottomPadding={Math.max(insets.bottom + 10, TABBAR_HEIGHT + 10)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}