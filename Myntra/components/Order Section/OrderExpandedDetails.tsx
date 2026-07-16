import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";

interface OrderExpandedDetailsProps {
  order: any;
  isLargeScreen: boolean;
  formatDate: (dateString: string) => string;
}

export default function OrderExpandedDetails({
  order,
  isLargeScreen,
  formatDate,
}: OrderExpandedDetailsProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className={`border-t ${isLargeScreen ? "p-8" : "p-5"}`}
      style={{
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      }}
    >
      <View className={isLargeScreen ? "flex-row gap-12" : "flex-col"}>
        <View className={`flex-1 ${isLargeScreen ? "" : "mb-8"}`}>
          {/* Shipping Address */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center border shadow-sm mr-3"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="location" size={16} color={colors.primary} />
              </View>
              <Text
                className="font-bold text-sm md:text-base tracking-tight"
                style={{ color: colors.primary }}
              >
                Shipping Address
              </Text>
            </View>
            <Text
              className="leading-6 font-medium text-sm md:text-base pl-11"
              style={{ color: colors.textMuted }}
            >
              {order.shippingAddress || "N/A"}
            </Text>
          </View>

          {/* Payment Method */}
          <View>
            <View className="flex-row items-center mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center border shadow-sm mr-3"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="card" size={16} color={colors.primary} />
              </View>
              <Text
                className="font-bold text-sm md:text-base tracking-tight"
                style={{ color: colors.primary }}
              >
                Payment Method
              </Text>
            </View>
            <Text
              className="font-medium text-sm md:text-base pl-11"
              style={{ color: colors.textMuted }}
            >
              {order.paymentMethod || "N/A"}
            </Text>
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center mb-5">
            <View
              className="w-8 h-8 rounded-full items-center justify-center border shadow-sm mr-3"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="car" size={16} color={colors.primary} />
            </View>
            <Text
              className="font-bold text-sm md:text-base tracking-tight"
              style={{ color: colors.primary }}
            >
              Tracking Information
            </Text>
          </View>

          {/* Tracking Box */}
          <View
            className="ml-0 md:ml-11 mb-6 p-4 md:p-5 rounded-xl border shadow-sm"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-xs md:text-sm mb-2 font-medium"
              style={{ color: colors.textMuted }}
            >
              Tracking Number:{" "}
              <Text className="font-bold" style={{ color: colors.textMain }}>
                {order.tracking?.number || "Pending"}
              </Text>
            </Text>
            <Text
              className="text-xs md:text-sm font-medium"
              style={{ color: colors.textMuted }}
            >
              Carrier:{" "}
              <Text className="font-bold" style={{ color: colors.textMain }}>
                {order.tracking?.carrier || "N/A"}
              </Text>
            </Text>
          </View>

          {/* Timeline */}
          <View className="ml-2 md:ml-12 relative">
            {order.tracking?.timeline?.map((event: any, index: number) => {
              const isLast = index === order.tracking!.timeline!.length - 1;
              const isCompleted = true;

              return (
                <View key={index} className="flex-row mb-6 relative">
                  {!isLast && (
                    <View
                      className="absolute left-[5px] md:left-[7px] top-[24px] bottom-[-24px] w-[2px] z-0"
                      style={{ backgroundColor: colors.border }}
                    />
                  )}

                  <View
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full mt-1.5 z-10 border-2 ${
                      isCompleted ? "shadow-sm shadow-pink-200" : ""
                    }`}
                    style={{
                      backgroundColor: isCompleted
                        ? colors.primary
                        : colors.surface,
                      borderColor: isCompleted ? colors.primary : colors.border,
                    }}
                  />

                  <View className="ml-5 flex-1">
                    <Text
                      className="font-bold text-sm md:text-base tracking-tight"
                      style={{ color: colors.primary }}
                    >
                      {event.status}
                    </Text>
                    <Text
                      className="text-xs md:text-sm mt-1 font-medium"
                      style={{ color: colors.textMuted }}
                    >
                      {event.location}
                    </Text>
                    <Text
                      className="text-[10px] md:text-xs mt-1.5 font-semibold tracking-wider uppercase"
                      style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                    >
                      {formatDate(event.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
