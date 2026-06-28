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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect } from "expo-router";

const API_URL = "http://10.132.206.253:5000";

// Android ke liye LayoutAnimation enable karna zaroori hai
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Jis order ki ID yahan hogi, sirf wahi expand hoga
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
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

      // Latest order sabse upar dikhane ke liye reverse kar rahe hain
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
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  // Smooth Expand/Collapse Logic
  const toggleExpand = (orderId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Date Formatting Helper (e.g., "15 Mar 2024")
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Status Pill Color Helper
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "delivered")
      return { bg: "bg-green-100", text: "text-green-600", icon: "cube" };
    if (s === "processing" || s === "shipped")
      return { bg: "bg-blue-100", text: "text-blue-600", icon: "time" };
    if (s === "cancelled")
      return { bg: "bg-red-100", text: "text-red-600", icon: "close-circle" };
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
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-neutral-100 shadow-sm z-10">
        <Text className="text-3xl font-black text-[#282c3f] tracking-tight">
          My Orders
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3f6c"
          />
        }
      >
        {orders.length === 0 ? (
          <View className="items-center justify-center mt-32">
            <Ionicons name="cube-outline" size={60} color="#d4d4d8" />
            <Text className="text-neutral-500 text-base mt-4">
              You have no orders yet.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const statusStyle = getStatusColor(order.status);

            return (
              <View
                key={order._id}
                className="bg-white rounded-2xl mb-4 shadow-sm border border-neutral-100 overflow-hidden"
              >
                {/* --- ALWAYS VISIBLE HEADER --- */}
                <View className="p-4 border-b border-neutral-50">
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="text-neutral-900 font-bold text-base">
                        Order #ORD{order._id?.slice(-6).toUpperCase()}
                      </Text>
                      <Text className="text-neutral-500 text-sm mt-1">
                        {formatDate(order.date)}
                      </Text>
                    </View>
                    <View
                      className={`flex-row items-center px-2.5 py-1 rounded-md ${statusStyle.bg}`}
                    >
                      <Ionicons
                        name={statusStyle.icon as any}
                        size={14}
                        color={statusStyle.text.split("-")[1]}
                      />
                      <Text
                        className={`ml-1 font-bold text-xs ${statusStyle.text}`}
                      >
                        {order.status || "Pending"}
                      </Text>
                    </View>
                  </View>

                  {/* Products List (Compact View) */}
                  {order.items?.map((item: any, index: number) => {
                    const product = item.productId || {};
                    const imageUrl =
                      product.images?.[0] ||
                      product.image ||
                      "https://via.placeholder.com/100";
                    return (
                      <View key={index} className="flex-row mb-4">
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-[70px] h-[90px] rounded-md bg-neutral-100"
                        />
                        <View className="ml-3 justify-center flex-1">
                          <Text className="text-neutral-500 text-sm font-medium">
                            {product.brand}
                          </Text>
                          <Text
                            className="text-neutral-800 font-semibold text-base"
                            numberOfLines={1}
                          >
                            {product.name}
                          </Text>
                          <Text className="text-neutral-500 text-sm my-0.5">
                            Size: {item.size || "M"}
                          </Text>
                          <Text className="text-neutral-900 font-black text-base">
                            ₹{item.price}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                  <View className="flex-row justify-between items-center mt-2 border-t border-dashed border-neutral-200 pt-4">
                    <Text className="text-neutral-500 font-bold text-base">
                      Order Total
                    </Text>
                    <Text className="text-neutral-900 font-black text-xl">
                      ₹{order.total}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleExpand(order._id)}
                    className="mt-4 flex-row justify-center items-center py-2"
                  >
                    <Text className="text-[#ff3f6c] font-bold text-base mr-1">
                      {isExpanded ? "Hide Details" : "View Details"}
                    </Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-forward"}
                      size={18}
                      color="#ff3f6c"
                    />
                  </TouchableOpacity>
                </View>

                {/* --- EXPANDABLE DETAILS SECTION --- */}
                {isExpanded && (
                  <View className="p-4 bg-neutral-50 border-t border-neutral-100">
                    {/* Shipping Address */}
                    <View className="mb-5">
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name="location-outline"
                          size={18}
                          color="#282c3f"
                        />
                        <Text className="font-bold text-neutral-900 text-base ml-2">
                          Shipping Address
                        </Text>
                      </View>
                      <Text className="text-neutral-600 ml-6 leading-5">
                        {order.shippingAddress || "N/A"}
                      </Text>
                    </View>

                    {/* Payment Method */}
                    <View className="mb-5">
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name="card-outline"
                          size={18}
                          color="#282c3f"
                        />
                        <Text className="font-bold text-neutral-900 text-base ml-2">
                          Payment Method
                        </Text>
                      </View>
                      <Text className="text-neutral-600 ml-6">
                        {order.paymentMethod || "N/A"}
                      </Text>
                    </View>

                    {/* Tracking Information */}
                    <View>
                      <View className="flex-row items-center mb-3">
                        <Ionicons
                          name="car-outline"
                          size={18}
                          color="#282c3f"
                        />
                        <Text className="font-bold text-neutral-900 text-base ml-2">
                          Tracking Information
                        </Text>
                      </View>

                      <View className="ml-6 mb-4">
                        <Text className="text-neutral-600">
                          Tracking Number:{" "}
                          <Text className="font-bold text-neutral-800">
                            {order.tracking?.number || "Pending"}
                          </Text>
                        </Text>
                        <Text className="text-neutral-600">
                          Carrier:{" "}
                          <Text className="font-bold text-neutral-800">
                            {order.tracking?.carrier || "N/A"}
                          </Text>
                        </Text>
                      </View>

                      {/* Vertical Timeline */}
                      <View className="ml-6 mt-2 relative">
                        {order.tracking?.timeline?.map(
                          (event: any, index: number) => {
                            const isLast =
                              index === order.tracking.timeline.length - 1;
                            const isCompleted = true; // Backend timeline items are usually completed past events

                            return (
                              <View
                                key={index}
                                className="flex-row mb-6 relative"
                              >
                                {/* Vertical Line */}
                                {!isLast && (
                                  <View className="absolute left-[5px] top-[14px] bottom-[-24px] w-[2px] bg-neutral-200" />
                                )}

                                {/* Dot */}
                                <View
                                  className={`w-3 h-3 rounded-full mt-1.5 z-10 ${isCompleted ? "bg-[#ff3f6c]" : "bg-neutral-300"}`}
                                />

                                {/* Text Info */}
                                <View className="ml-4 flex-1">
                                  <Text className="font-bold text-neutral-900 text-base">
                                    {event.status}
                                  </Text>
                                  <Text className="text-neutral-500 text-sm mt-0.5">
                                    {event.location}
                                  </Text>
                                  <Text className="text-neutral-400 text-xs mt-0.5">
                                    {formatDate(event.timestamp)}
                                  </Text>
                                </View>
                              </View>
                            );
                          },
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
