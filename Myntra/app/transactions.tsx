import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, Modal, TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Linking from 'expo-linking';
import { API_URL } from "./constants/api";
import { useTheme } from "./context/ThemeContext";

interface Transaction {
  _id: string;
  providerTransactionId: string;
  amount: number;
  paymentMode: string;
  status: string;
  createdAt: string;
  orderId?: {
    items?: {
      productId?: {
        name?: string;
        image?: string;
        images?: string[];
      }
    }[]
  };
}

export default function Transactions() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filterOptions = ['All', 'Success', 'Pending', 'Failed'];

  const fetchTransactions = async (pageNumber = 1, status = statusFilter) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await axios.get(
        `${API_URL}/api/transactions?page=${pageNumber}&limit=10&status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data, pagination } = response.data;
      if (pageNumber === 1) setTransactions(data);
      else setTransactions((prev) => [...prev, ...data]);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTransactions(1, statusFilter);
  }, [statusFilter]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, statusFilter);
    }
  };

  // Global CSV Export Logic
  const handleExportCSV = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      Linking.openURL(`${API_URL}/api/transactions/export/csv?token=${token}`);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  // PDF Receipt Logic
  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      Linking.openURL(`${API_URL}/api/transactions/export/pdf/${transactionId}?token=${token}`);
    } catch (error) {
      console.error("Error opening receipt:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return isDark ? '#34d399' : '#059669'; 
      case 'Failed': return isDark ? '#f87171' : '#dc2626'; 
      case 'Refunded': return isDark ? '#60a5fa' : '#2563eb'; 
      default: return isDark ? '#fbbf24' : '#d97706'; 
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const productData = item.orderId?.items?.[0]?.productId;
    const productName = productData?.name || "Payment Transaction";
    const productImg = productData?.images?.[0] || productData?.image || null;

    return (
      <View className="p-4 mb-4 rounded-2xl border shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <View className="flex-row items-center mb-4">
          <View className="w-14 h-14 rounded-xl overflow-hidden border mr-3 items-center justify-center" style={{ borderColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
            {productImg ? (
              <Image source={{ uri: productImg }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Ionicons name="receipt" size={24} color={colors.textMuted} />
            )}
          </View>
          <View className="flex-1 justify-center pr-2">
            <Text className="text-base font-bold tracking-tight mb-1" numberOfLines={1} style={{ color: colors.textMain }}>
              {productName}
            </Text>
            <Text className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              TXN: {item.providerTransactionId.slice(-8)}
            </Text>
          </View>
          <View className="items-end justify-center">
            <Text className="text-lg font-extrabold tracking-tight" style={{ color: colors.textMain }}>₹{item.amount}</Text>
            <View className="px-2.5 py-1 rounded-md border mt-1.5" style={{ borderColor: getStatusColor(item.status), backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
              <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getStatusColor(item.status) }}>{item.status}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-dashed" style={{ borderTopColor: colors.border }}>
          <View className="flex-row items-center">
            <Ionicons name="card" size={16} color={colors.textMuted} />
            <Text className="text-sm font-semibold ml-2" style={{ color: colors.textMuted }}>{item.paymentMode}</Text>
          </View>
          <Text className="text-xs font-semibold" style={{ color: colors.textMuted }}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.status === 'Success' && (
          <TouchableOpacity onPress={() => handleDownloadReceipt(item._id)} activeOpacity={0.8} className="mt-4 py-3 rounded-xl flex-row justify-center items-center" style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}>
            <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
            <Text className="ml-2 font-bold text-sm tracking-widest uppercase" style={{ color: colors.primary }}>Download Receipt</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Header */}
        <View className="px-4 py-4 md:py-5 border-b shadow-sm z-10 flex-row items-center justify-between" style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.push("/profile")} activeOpacity={0.7} className="mr-3 p-1.5 -ml-1.5 rounded-full">
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: colors.textMain }}>My Transactions</Text>
          </View>
        </View>

        <View className="w-full max-w-4xl mx-auto flex-1">
          
          {/* Action Row :  Dropdown + Export Button */}
          <View className="flex-row justify-between items-center px-4 py-4 z-20">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setIsDropdownOpen(true)}
              className="flex-row items-center px-4 py-2.5 rounded-xl border shadow-sm"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <Ionicons name="filter" size={16} color={colors.primary} />
              <Text className="font-bold text-sm mx-2" style={{ color: colors.textMain }}>
                Status: {statusFilter}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Global CSV Download Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleExportCSV}
              className="flex-row items-center px-4 py-2.5 rounded-xl shadow-sm"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="document-text" size={16} color="#fff" />
              <Text className="font-bold text-sm ml-2 text-white">Export All</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                <View className="items-center justify-center py-20 px-6">
                  <Ionicons name="receipt-outline" size={60} color={colors.border} />
                  <Text className="mt-4 font-semibold text-lg text-center" style={{ color: colors.textMuted }}>
                    No transactions found
                  </Text>
                </View>
              }
              ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary} className="py-4" /> : null}
            />
          )}
        </View>

        <Modal visible={isDropdownOpen} transparent={true} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <TouchableWithoutFeedback>
                <View className="w-64 rounded-2xl p-2 shadow-lg" style={{ backgroundColor: colors.surface }}>
                  <Text className="font-bold text-sm p-3 mb-1 border-b" style={{ color: colors.textMuted, borderBottomColor: colors.border }}>
                    Filter by Status
                  </Text>
                  {filterOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.7}
                      onPress={() => {
                        setStatusFilter(option);
                        setIsDropdownOpen(false);
                      }}
                      className="px-4 py-3 rounded-xl mb-1 flex-row items-center justify-between"
                      style={{ backgroundColor: statusFilter === option ? (isDark ? '#334155' : '#f1f5f9') : 'transparent' }}
                    >
                      <Text className="font-semibold text-base" style={{ color: statusFilter === option ? colors.primary : colors.textMain }}>
                        {option}
                      </Text>
                      {statusFilter === option && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </View>
    </SafeAreaView>
  );
}