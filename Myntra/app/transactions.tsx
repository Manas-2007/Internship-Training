import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "./constants/api";
import { useTheme } from "./context/ThemeContext";

// Transaction Interface
interface Transaction {
  _id: string;
  providerTransactionId: string;
  amount: number;
  paymentMode: string;
  status: string;
  createdAt: string;
}

export default function Transactions() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("All");

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

      if (pageNumber === 1) {
        setTransactions(data);
      } else {
        setTransactions((prev) => [...prev, ...data]);
      }
      
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.log("Fetch Transactions Error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Jab page load ho ya filter change ho
  useEffect(() => {
    setPage(1);
    fetchTransactions(1, statusFilter);
  }, [statusFilter]);

  // Jab user scroll karke neeche pahuche (Infinite Scroll)
  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, statusFilter);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return isDark ? '#34d399' : '#059669'; // Green
      case 'Failed': return isDark ? '#f87171' : '#dc2626'; // Red
      case 'Refunded': return isDark ? '#60a5fa' : '#2563eb'; // Blue
      default: return isDark ? '#fbbf24' : '#d97706'; // Yellow (Pending)
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View 
      className="p-4 md:p-5 mb-4 rounded-xl border shadow-sm"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-xs md:text-sm font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>
            TXN ID: {item.providerTransactionId.slice(-8).toUpperCase()}
          </Text>
          <Text className="text-lg md:text-xl font-bold tracking-tight mt-1" style={{ color: colors.textMain }}>
            ₹{item.amount}
          </Text>
        </View>
        <View 
          className="px-3 py-1 rounded-full border"
          style={{ borderColor: getStatusColor(item.status), backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}
        >
          <Text className="text-xs font-bold" style={{ color: getStatusColor(item.status) }}>
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-dashed" style={{ borderTopColor: colors.border }}>
        <View className="flex-row items-center">
          <Ionicons name="card-outline" size={16} color={colors.textMuted} />
          <Text className="text-sm font-medium ml-2" style={{ color: colors.textMuted }}>
            {item.paymentMode}
          </Text>
        </View>
        <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      {/* Download Receipt Button (Stage 5 mein kaam karega) */}
      {item.status === 'Success' && (
        <TouchableOpacity 
          className="mt-4 py-2.5 rounded-lg flex-row justify-center items-center"
          style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
        >
          <Ionicons name="download-outline" size={18} color={colors.primary} />
          <Text className="ml-2 font-bold text-sm tracking-widest uppercase" style={{ color: colors.primary }}>
            Download Receipt
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* HEADER */}
        <View className="px-4 py-4 md:py-5 border-b shadow-sm z-10 flex-row items-center" style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}>
          <View className="w-full max-w-4xl mx-auto flex-row items-center">
            <TouchableOpacity onPress={() => router.navigate("/profile")} activeOpacity={0.7} className="mr-3 p-1.5 -ml-1.5 rounded-full">
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: colors.textMain }}>
              My Transactions
            </Text>
          </View>
        </View>

        <View className="w-full max-w-4xl mx-auto flex-1 w-full">
          {/* FILTERS */}
          <View className="flex-row px-4 py-4 space-x-3">
            {['All', 'Success', 'Failed'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-full border ${statusFilter === filter ? 'shadow-sm' : ''}`}
                style={{
                  backgroundColor: statusFilter === filter ? colors.primary : colors.surface,
                  borderColor: statusFilter === filter ? colors.primary : colors.border
                }}
              >
                <Text className="font-bold text-sm" style={{ color: statusFilter === filter ? '#fff' : colors.textMuted }}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* LIST */}
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
              onEndReachedThreshold={0.5} // Jab user 50% bottom par ho tabhi next page load karo
              ListEmptyComponent={
                <View className="items-center justify-center py-20">
                  <Ionicons name="receipt-outline" size={60} color={colors.border} />
                  <Text className="mt-4 font-semibold text-lg" style={{ color: colors.textMuted }}>
                    No transactions found
                  </Text>
                </View>
              }
              ListFooterComponent={
                loadingMore ? <ActivityIndicator size="small" color={colors.primary} className="py-4" /> : null
              }
            />
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}