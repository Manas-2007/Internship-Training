import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";
import OrderExpandedDetails from "./OrderExpandedDetails";

interface OrderCardProps {
  order: any;
  isExpanded: boolean;
  toggleExpand: (id: string) => void;
  isLargeScreen: boolean;
}

export default function OrderCard({ order, isExpanded, toggleExpand, isLargeScreen }: OrderCardProps) {
  const { colors, isDark } = useTheme();

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const getStatusStyle = (status: string, isDarkMode: boolean) => {
    const s = status?.toLowerCase();
    if (s === "delivered") return { bg: isDarkMode ? "#022c22" : "#ecfdf5", text: isDarkMode ? "#34d399" : "#059669", icon: "checkmark-circle", border: isDarkMode ? "#064e3b" : "#d1fae5" };
    if (s === "processing" || s === "shipped") return { bg: isDarkMode ? "#172554" : "#eff6ff", text: isDarkMode ? "#60a5fa" : "#2563eb", icon: "time", border: isDarkMode ? "#1e3a8a" : "#dbeafe" };
    if (s === "cancelled") return { bg: isDarkMode ? "#450a0a" : "#fef2f2", text: isDarkMode ? "#f87171" : "#dc2626", icon: "close-circle", border: isDarkMode ? "#7f1d1d" : "#fee2e2" };
    return { bg: isDarkMode ? "#1e293b" : "#f8fafc", text: isDarkMode ? "#94a3b8" : "#475569", icon: "ellipse", border: isDarkMode ? "#334155" : "#e2e8f0" };
  };

  const statusStyle = getStatusStyle(order.status, isDark);

  return (
    <View
      className={`rounded-2xl mb-6 shadow-sm border overflow-hidden ${isLargeScreen ? "hover:shadow-md transition-shadow duration-300" : ""}`}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
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
          
          <View
            className="flex-row items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full border"
            style={{ backgroundColor: statusStyle.bg, borderColor: statusStyle.border }}
          >
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
            <Text className="ml-1.5 font-bold text-[10px] md:text-xs tracking-widest uppercase" style={{ color: statusStyle.text }}>
              {order.status || "Pending"}
            </Text>
          </View>
        </View>

        {order.items?.map((item: any, index: number) => {
          const product = item.productId || {};
          const imageUrl = product.images?.[0] || product.image || "https://via.placeholder.com/150";
          
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
                <Text className="font-semibold text-sm md:text-base leading-5 mb-1.5" numberOfLines={2} style={{ color: colors.textMain }}>
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

        <View className="flex-row justify-between items-center mt-3 border-t border-dashed pt-5" style={{ borderTopColor: colors.border }}>
          <Text className="font-semibold text-sm md:text-base" style={{ color: colors.textMuted }}>Order Total</Text>
          <Text className="font-bold text-xl md:text-2xl tracking-tight" style={{ color: colors.textMain }}>₹{order.total}</Text>
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
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <OrderExpandedDetails order={order} isLargeScreen={isLargeScreen} formatDate={formatDate} />
      )}
    </View>
  );
}