import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, LayoutAnimation, Platform, UIManager, useWindowDimensions, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "./constants/api";
import { useTheme } from "./context/ThemeContext";
import OrderEmptyState from "../components/Order Section/OrderEmptyState";
import OrderCard from "../components/Order Section/OrderCard";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Orders() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const isLargeScreen = width >= 768;

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) { setLoading(false); return; }
      
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;
      if (!userId) return;

      const response = await axios.get(`${API_URL}/api/orders/user/${userId}`);
      setOrders(Array.isArray(response.data) ? response.data.reverse() : []);
    } catch (error) {
      console.log("Fetch Orders Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate("/profile"); 
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const toggleExpand = (orderId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        <View className="px-2 py-4 md:py-5 border-b shadow-sm z-10 flex-row items-center" style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}>
          <View className="w-full max-w-4xl mx-auto flex-row items-center">
            <TouchableOpacity onPress={() => router.navigate("/profile")} activeOpacity={0.7} className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full">
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Ionicons name="cube" size={24} color={colors.primary} />
            <Text className="text-xl md:text-2xl font-bold tracking-tight ml-2.5" style={{ color: colors.textMain }}>My Orders</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-2 pt-2 md:pt-3"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <View className="w-full max-w-4xl mx-auto flex-1">
            {orders.length === 0 ? (
              <OrderEmptyState />
            ) : (
              orders.map((order: any) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  isExpanded={expandedOrderId === order._id} 
                  toggleExpand={toggleExpand} 
                  isLargeScreen={isLargeScreen} 
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}