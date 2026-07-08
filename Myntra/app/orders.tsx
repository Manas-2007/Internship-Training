import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect, useRouter } from "expo-router";

import { API_URL } from "./constants/api";
// 👉 Import ThemeContext
import { useTheme } from "./context/ThemeContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Product {
  _id?: string;
  brand?: string;
  name?: string;
  images?: string[];
  image?: string;
}

interface OrderItem {
  productId: Product;
  size?: string;
  price?: number;
}

interface OrderTracking {
  number?: string;
  carrier?: string;
  timeline?: { status: string; location: string; timestamp: string }[];
}

interface Order {
  _id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
  tracking?: OrderTracking;
}

export default function Orders() {
  const router = useRouter();
  
  // 👉 Extract colors and isDark
  const { colors, isDark } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 768; // Tablet/Desktop Breakpoint

  const fetchOrders = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;
      if (!userId) return;

      const response = await axios.get(`${API_URL}/api/orders/user/${userId}`);

      if (Array.isArray(response.data)) {
        setOrders(response.data.reverse());
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("Fetch Orders Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const toggleExpand = (orderId: string): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // 👉 Updated status colors for dynamic Dark/Light modes
  const getStatusStyle = (status: string, isDarkMode: boolean) => {
    const s = status?.toLowerCase();
    if (s === "delivered")
      return { 
        bg: isDarkMode ? "#022c22" : "#ecfdf5", 
        text: isDarkMode ? "#34d399" : "#059669", 
        icon: "checkmark-circle", 
        border: isDarkMode ? "#064e3b" : "#d1fae5" 
      };
    if (s === "processing" || s === "shipped")
      return { 
        bg: isDarkMode ? "#172554" : "#eff6ff", 
        text: isDarkMode ? "#60a5fa" : "#2563eb", 
        icon: "time", 
        border: isDarkMode ? "#1e3a8a" : "#dbeafe" 
      };
    if (s === "cancelled")
      return { 
        bg: isDarkMode ? "#450a0a" : "#fef2f2", 
        text: isDarkMode ? "#f87171" : "#dc2626", 
        icon: "close-circle", 
        border: isDarkMode ? "#7f1d1d" : "#fee2e2" 
      };
    return { 
      bg: isDarkMode ? "#1e293b" : "#f8fafc", 
      text: isDarkMode ? "#94a3b8" : "#475569", 
      icon: "ellipse", 
      border: isDarkMode ? "#334155" : "#e2e8f0" 
    };
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    // 👉 Dynamic App Background
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      {/* 1400px Centering Wrapper */}
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* HEADER */}
        <View 
          className="px-2 py-4 md:py-5 border-b shadow-sm z-10 flex-row items-center"
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
        >
          <View className="w-full max-w-4xl mx-auto flex-row items-center">
           <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push("/"); 
                }
              }} 
              activeOpacity={0.7}
              className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full cursor-pointer"
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Ionicons name="cube" size={24} color={colors.primary} />
            <Text className="text-xl md:text-2xl font-bold tracking-tight ml-2.5" style={{ color: colors.textMain }}>
              My Orders
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-2 pt-2 md:pt-3"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Inner constraint for Orders List */}
          <View className="w-full max-w-4xl mx-auto flex-1">
            {orders.length === 0 ? (
              /* Empty State */
              <View className="flex-1 items-center justify-center pt-20">
                <View 
                  className="w-24 h-24 md:w-32 md:h-32 border shadow-sm rounded-full items-center justify-center mb-6"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
                </View>
                <Text className="text-2xl md:text-3xl font-bold mb-3 tracking-tight" style={{ color: colors.textMain }}>
                  No orders yet
                </Text>
                <Text className="text-base md:text-lg font-medium text-center px-8" style={{ color: colors.textMuted }}>
                  Looks like you haven't placed an order yet. Start exploring!
                </Text>
              </View>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrderId === order._id;
                const statusStyle = getStatusStyle(order.status, isDark);

                return (
                  <View
                    key={order._id}
                    className={`rounded-2xl mb-6 shadow-sm border overflow-hidden ${
                      isLargeScreen ? "hover:shadow-md transition-shadow duration-300" : ""
                    }`}
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    {/* Order Header & Items Summary */}
                    <View 
                      className={`border-b ${isLargeScreen ? "p-6 md:p-8" : "p-4 md:p-5"}`}
                      style={{ borderBottomColor: colors.border }}
                    >
                      
                      <View className="flex-row justify-between items-start mb-6">
                        <View>
                          <Text className="font-bold text-base md:text-lg tracking-tight mb-1" style={{ color: colors.textMain }}>
                            Order #ORD{order._id?.slice(-6).toUpperCase()}
                          </Text>
                          <Text className="text-xs md:text-sm font-medium" style={{ color: colors.textMuted }}>
                            Placed on {formatDate(order.date)}
                          </Text>
                        </View>
                        
                        {/* Status Badge */}
                        <View
                          className="flex-row items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full border"
                          style={{ backgroundColor: statusStyle.bg, borderColor: statusStyle.border }}
                        >
                          <Ionicons
                            name={statusStyle.icon as any}
                            size={14}
                            color={statusStyle.text}
                          />
                          <Text
                            className="ml-1.5 font-bold text-[10px] md:text-xs tracking-widest uppercase"
                            style={{ color: statusStyle.text }}
                          >
                            {order.status || "Pending"}
                          </Text>
                        </View>
                      </View>

                      {/* Products List */}
                      {order.items?.map((item: OrderItem, index: number) => {
                        const product = item.productId || ({} as Product);
                        const imageUrl =
                          product.images?.[0] ||
                          product.image ||
                          "https://via.placeholder.com/150";
                        
                        return (
                          <View key={index} className="flex-row mb-5 items-center">
                            <Image
                              source={{ uri: imageUrl }}
                              className="w-20 h-24 md:w-24 md:h-32 rounded-xl object-cover border"
                              style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            />
                            <View className="ml-4 md:ml-5 justify-center flex-1">
                              <Text className="text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1.5" numberOfLines={1} style={{ color: colors.textMuted }}>
                                {product.brand || "Brand"}
                              </Text>
                              <Text
                                className="font-semibold text-sm md:text-base leading-5 mb-1.5"
                                numberOfLines={2}
                                style={{ color: colors.textMain }}
                              >
                                {product.name || "Product Name"}
                              </Text>
                              <Text className="text-xs md:text-sm font-medium mb-1.5" style={{ color: colors.textMuted }}>
                                Size: <Text className="font-bold" style={{ color: colors.textMain }}>{item.size || "M"}</Text>
                              </Text>
                              <Text className="font-bold text-base md:text-lg tracking-tight" style={{ color: colors.textMain }}>
                                ₹{item.price}
                              </Text>
                            </View>
                          </View>
                        );
                      })}

                      {/* Total & Action Button */}
                      <View 
                        className="flex-row justify-between items-center mt-3 border-t border-dashed pt-5"
                        style={{ borderTopColor: colors.border }}
                      >
                        <Text className="font-semibold text-sm md:text-base" style={{ color: colors.textMuted }}>
                          Order Total
                        </Text>
                        <Text className="font-bold text-xl md:text-2xl tracking-tight" style={{ color: colors.textMain }}>
                          ₹{order.total}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => toggleExpand(order._id)}
                        activeOpacity={0.7}
                        className="mt-6 flex-row justify-center items-center py-3.5 rounded-xl transition-colors cursor-pointer border"
                        style={{ backgroundColor: colors.background, borderColor: colors.border }}
                      >
                        <Text className="font-bold text-xs md:text-sm tracking-widest uppercase mr-2" style={{ color: colors.primary }}>
                          {isExpanded ? "Hide Details" : "View Details"}
                        </Text>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* EXPANDED VIEW: Desktop Split Layout / Mobile Stack Layout */}
                    {isExpanded && (
                      <View 
                        className={`border-t ${isLargeScreen ? "p-8" : "p-5"}`}
                        style={{ backgroundColor: colors.background, borderTopColor: colors.border }}
                      >
                        <View className={isLargeScreen ? "flex-row gap-12" : "flex-col"}>
                          
                          {/* Left Column: Address & Payment */}
                          <View className={`flex-1 ${isLargeScreen ? "" : "mb-8"}`}>
                            {/* Shipping Address */}
                            <View className="mb-8">
                              <View className="flex-row items-center mb-3">
                                <View 
                                  className="w-8 h-8 rounded-full items-center justify-center border shadow-sm mr-3"
                                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                >
                                  <Ionicons name="location" size={16} color={colors.primary} />
                                </View>
                                <Text className="font-bold text-sm md:text-base tracking-tight" style={{ color: colors.primary }}>
                                  Shipping Address
                                </Text>
                              </View>
                              <Text className="leading-6 font-medium text-sm md:text-base pl-11" style={{ color: colors.textMuted }}>
                                {order.shippingAddress || "N/A"}
                              </Text>
                            </View>

                            {/* Payment Method */}
                            <View>
                              <View className="flex-row items-center mb-3">
                                <View 
                                  className="w-8 h-8 rounded-full items-center justify-center border shadow-sm mr-3"
                                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                >
                                  <Ionicons name="card" size={16} color={colors.primary} />
                                </View>
                                <Text className="font-bold text-sm md:text-base tracking-tight" style={{ color: colors.primary }}>
                                  Payment Method
                                </Text>
                              </View>
                              <Text className="font-medium text-sm md:text-base pl-11" style={{ color: colors.textMuted }}>
                                {order.paymentMethod || "N/A"}
                              </Text>
                            </View>
                          </View>

                          {/* Right Column: Tracking Information */}
                          <View className="flex-1">
                            <View className="flex-row items-center mb-5">
                              <View 
                                className="w-8 h-8 rounded-full items-center justify-center border shadow-sm mr-3"
                                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                              >
                                <Ionicons name="car" size={16} color={colors.primary} />
                              </View>
                              <Text className="font-bold text-sm md:text-base tracking-tight" style={{ color: colors.primary }}>
                                Tracking Information
                              </Text>
                            </View>

                            {/* Tracking Box */}
                            <View 
                              className="ml-0 md:ml-11 mb-6 p-4 md:p-5 rounded-xl border shadow-sm"
                              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                            >
                              <Text className="text-xs md:text-sm mb-2 font-medium" style={{ color: colors.textMuted }}>
                                Tracking Number:{" "}
                                <Text className="font-bold" style={{ color: colors.textMain }}>
                                  {order.tracking?.number || "Pending"}
                                </Text>
                              </Text>
                              <Text className="text-xs md:text-sm font-medium" style={{ color: colors.textMuted }}>
                                Carrier:{" "}
                                <Text className="font-bold" style={{ color: colors.textMain }}>
                                  {order.tracking?.carrier || "N/A"}
                                </Text>
                              </Text>
                            </View>

                            {/* Timeline */}
                            <View className="ml-2 md:ml-12 relative">
                              {order.tracking?.timeline?.map(
                                (event: any, index: number) => {
                                  const isLast = index === order.tracking!.timeline!.length - 1;
                                  // For UI sake, assuming events in history are completed
                                  const isCompleted = true; 

                                  return (
                                    <View key={index} className="flex-row mb-6 relative">
                                      {/* Vertical Connecting Line */}
                                      {!isLast && (
                                        <View 
                                          className="absolute left-[5px] md:left-[7px] top-[24px] bottom-[-24px] w-[2px] z-0" 
                                          style={{ backgroundColor: colors.border }}
                                        />
                                      )}

                                      {/* Timeline Dot */}
                                      <View
                                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full mt-1.5 z-10 border-2 ${
                                          isCompleted ? "shadow-sm shadow-pink-200" : ""
                                        }`}
                                        style={{ 
                                          backgroundColor: isCompleted ? colors.primary : colors.surface,
                                          borderColor: isCompleted ? colors.primary : colors.border
                                        }}
                                      />

                                      {/* Timeline Content */}
                                      <View className="ml-5 flex-1">
                                        <Text className="font-bold text-sm md:text-base tracking-tight" style={{ color: colors.primary }}>
                                          {event.status}
                                        </Text>
                                        <Text className="text-xs md:text-sm mt-1 font-medium" style={{ color: colors.textMuted }}>
                                          {event.location}
                                        </Text>
                                        <Text 
                                          className="text-[10px] md:text-xs mt-1.5 font-semibold tracking-wider uppercase"
                                          style={{ color: isDark ? '#64748b' : '#9ca3af' }} // Specific subtle color for timestamp
                                        >
                                          {formatDate(event.timestamp)}
                                        </Text>
                                      </View>
                                    </View>
                                  );
                                }
                              )}
                            </View>
                          </View>

                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}