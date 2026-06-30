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
import { useFocusEffect } from "expo-router";

import { API_URL } from "./constants/api";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 768;

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

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "delivered")
      return { bg: "bg-emerald-50", text: "text-emerald-600", icon: "checkmark-circle" };
    if (s === "processing" || s === "shipped")
      return { bg: "bg-blue-50", text: "text-blue-600", icon: "time" };
    if (s === "cancelled")
      return { bg: "bg-red-50", text: "text-red-600", icon: "close-circle" };
    return { bg: "bg-neutral-100", text: "text-neutral-600", icon: "ellipse" };
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 py-5 bg-white border-b border-neutral-100 shadow-sm z-10">
        <View className="w-full max-w-4xl mx-auto">
          <Text className="text-3xl font-bold text-neutral-900 tracking-tight">
            My Orders
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3f6c"
          />
        }
      >
        <View className="w-full max-w-4xl mx-auto flex-1">
          {orders.length === 0 ? (
            <View className="flex-1 items-center justify-center pt-20">
              <View className="w-24 h-24 bg-neutral-100 rounded-full items-center justify-center mb-5">
                <Ionicons name="cube-outline" size={40} color="#a3a3a3" />
              </View>
              <Text className="text-neutral-800 text-2xl font-bold mb-2">
                No orders yet
              </Text>
              <Text className="text-neutral-500 text-base text-center">
                Looks like you haven't placed an order yet.
              </Text>
            </View>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const statusStyle = getStatusColor(order.status);

              return (
                <View
                  key={order._id}
                  className="bg-white rounded-2xl mb-6 shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <View className={`border-b border-neutral-100 ${isLargeScreen ? "p-6" : "p-4"}`}>
                    <View className="flex-row justify-between items-start mb-5">
                      <View>
                        <Text className="text-neutral-900 font-bold text-lg tracking-tight">
                          Order #ORD{order._id?.slice(-6).toUpperCase()}
                        </Text>
                        <Text className="text-neutral-500 text-sm mt-1 font-medium">
                          {formatDate(order.date)}
                        </Text>
                      </View>
                      <View
                        className={`flex-row items-center px-3 py-1.5 rounded-full border border-transparent ${statusStyle.bg}`}
                      >
                        <Ionicons
                          name={statusStyle.icon as any}
                          size={14}
                          color={statusStyle.text.split("-")[1]}
                        />
                        <Text
                          className={`ml-1.5 font-bold text-xs tracking-wide uppercase ${statusStyle.text}`}
                        >
                          {order.status || "Pending"}
                        </Text>
                      </View>
                    </View>

                    {order.items?.map((item: OrderItem, index: number) => {
                      const product = item.productId || {} as Product;
                      const imageUrl =
                        product.images?.[0] ||
                        product.image ||
                        "https://via.placeholder.com/100";
                      return (
                        <View key={index} className="flex-row mb-5 items-center">
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-[80px] h-[100px] rounded-lg bg-neutral-100 object-cover"
                          />
                          <View className="ml-4 justify-center flex-1">
                            <Text className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-1">
                              {product.brand}
                            </Text>
                            <Text
                              className="text-neutral-900 font-semibold text-base leading-5 mb-1.5"
                              numberOfLines={2}
                            >
                              {product.name}
                            </Text>
                            <Text className="text-neutral-500 text-sm font-medium mb-1">
                              Size: {item.size || "M"}
                            </Text>
                            <Text className="text-neutral-900 font-bold text-lg">
                              ₹{item.price}
                            </Text>
                          </View>
                        </View>
                      );
                    })}

                    <View className="flex-row justify-between items-center mt-3 border-t border-dashed border-neutral-200 pt-5">
                      <Text className="text-neutral-600 font-semibold text-base">
                        Order Total
                      </Text>
                      <Text className="text-neutral-900 font-bold text-2xl tracking-tight">
                        ₹{order.total}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleExpand(order._id)}
                      className="mt-6 flex-row justify-center items-center py-2.5 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <Text className="text-[#ff3f6c] font-bold text-sm tracking-wide mr-1.5">
                        {isExpanded ? "HIDE DETAILS" : "VIEW DETAILS"}
                      </Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#ff3f6c"
                      />
                    </TouchableOpacity>
                  </View>

                  {isExpanded && (
                    <View className={`bg-neutral-50 border-t border-neutral-100 ${isLargeScreen ? "p-6" : "p-4"}`}>
                      
                      <View className={`flex-col ${isLargeScreen ? "flex-row gap-8" : ""}`}>
                        <View className="flex-1 mb-6">
                          <View className="flex-row items-center mb-2.5">
                            <Ionicons
                              name="location"
                              size={20}
                              color="#404040"
                            />
                            <Text className="font-bold text-neutral-900 text-base ml-2 tracking-tight">
                              Shipping Address
                            </Text>
                          </View>
                          <Text className="text-neutral-600 ml-7 leading-6 font-medium text-sm">
                            {order.shippingAddress || "N/A"}
                          </Text>
                        </View>

                        <View className="flex-1 mb-6">
                          <View className="flex-row items-center mb-2.5">
                            <Ionicons
                              name="card"
                              size={20}
                              color="#404040"
                            />
                            <Text className="font-bold text-neutral-900 text-base ml-2 tracking-tight">
                              Payment Method
                            </Text>
                          </View>
                          <Text className="text-neutral-600 ml-7 font-medium text-sm">
                            {order.paymentMethod || "N/A"}
                          </Text>
                        </View>
                      </View>

                      <View>
                        <View className="flex-row items-center mb-4">
                          <Ionicons
                            name="car"
                            size={20}
                            color="#404040"
                          />
                          <Text className="font-bold text-neutral-900 text-base ml-2 tracking-tight">
                            Tracking Information
                          </Text>
                        </View>

                        <View className="ml-7 mb-5 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                          <Text className="text-neutral-500 text-sm mb-1.5 font-medium">
                            Tracking Number:{" "}
                            <Text className="font-bold text-neutral-900">
                              {order.tracking?.number || "Pending"}
                            </Text>
                          </Text>
                          <Text className="text-neutral-500 text-sm font-medium">
                            Carrier:{" "}
                            <Text className="font-bold text-neutral-900">
                              {order.tracking?.carrier || "N/A"}
                            </Text>
                          </Text>
                        </View>

                        <View className="ml-7 mt-2 relative">
                          {order.tracking?.timeline?.map(
                            (event: any, index: number) => {
                              const isLast =
                                index === order.tracking!.timeline!.length - 1;
                              const isCompleted = true;

                              return (
                                <View
                                  key={index}
                                  className="flex-row mb-6 relative"
                                >
                                  {!isLast && (
                                    <View className="absolute left-[5px] top-[20px] bottom-[-30px] w-[2px] bg-neutral-200" />
                                  )}

                                  <View
                                    className={`w-3 h-3 rounded-full mt-1.5 z-10 ${
                                      isCompleted ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-neutral-300"
                                    }`}
                                  />

                                  <View className="ml-5 flex-1">
                                    <Text className="font-bold text-neutral-900 text-base tracking-tight">
                                      {event.status}
                                    </Text>
                                    <Text className="text-neutral-500 text-sm mt-1 font-medium">
                                      {event.location}
                                    </Text>
                                    <Text className="text-neutral-400 text-xs mt-1 font-medium tracking-wide">
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
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}