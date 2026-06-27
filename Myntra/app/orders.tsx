import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Mock Data updated with Timeline info
const orders = [
  {
    id: "ORD123456",
    date: "15 Mar 2024",
    status: "Delivered",
    total: 4087,
    shippingAddress: "123 Main Street, Apt 4B, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    items: [
      {
        name: "White Cotton T-Shirt",
        brand: "H&M",
        size: "L",
        price: 799,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
      },
      {
        name: "Blue Denim Jacket",
        brand: "Levis",
        size: "M",
        price: 2999,
        image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
      },
    ],
    tracking: {
      number: "TRK789012345",
      carrier: "FedEx",
      timeline: [
        { status: "Delivered", location: "New York, NY", time: "15 Mar 2024, 14:30" },
        { status: "Out for Delivery", location: "New York City Hub", time: "15 Mar 2024, 09:15" },
        { status: "Arrived at Delivery Facility", location: "New York Distribution Center", time: "14 Mar 2024, 23:45" },
        { status: "Order Shipped", location: "New Jersey Warehouse", time: "13 Mar 2024, 16:20" },
      ],
    },
  },
  {
    id: "ORD123457",
    date: "10 Mar 2024",
    status: "Delivered",
    total: 1299,
    shippingAddress: "123 Main Street, Apt 4B, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    items: [
      {
        name: "Summer Dress",
        brand: "ONLY",
        size: "S",
        price: 1299,
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
      },
    ],
    tracking: {
      number: "TRK789012346",
      carrier: "UPS",
      timeline: [
        { status: "Delivered", location: "New York, NY", time: "10 Mar 2024, 15:45" },
        { status: "Order Shipped", location: "New Jersey Warehouse", time: "08 Mar 2024, 11:30" },
      ],
    },
  },
];

export default function Orders() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </TouchableOpacity>
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">
          My Orders
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <View key={order.id} className="border-b border-neutral-100 p-5">
            
            {/* 1. Header (ID + Status) */}
            <View className="flex-row justify-between items-start mb-5">
              <View>
                <Text className="text-lg font-extrabold text-neutral-800">
                  Order #{order.id}
                </Text>
                <Text className="text-neutral-500 text-sm mt-0.5 font-medium">
                  {order.date}
                </Text>
              </View>

              {/* Precise Green Pill matching the screenshot */}
              <View className="bg-[#e6f4ea] px-2 py-1 rounded flex-row items-center">
                <Ionicons name="cube" size={12} color="#00b852" />
                <Text className="text-[#00b852] text-xs font-bold ml-1.5">
                  {order.status}
                </Text>
              </View>
            </View>

            {/* 2. Items List */}
            {order.items.map((item, idx) => (
              <View key={idx} className="flex-row mb-5">
                <Image
                  source={{ uri: item.image }}
                  className="w-[72px] h-[90px] rounded bg-neutral-100"
                />
                <View className="ml-4 flex-1 justify-center">
                  <Text className="text-sm font-bold text-neutral-500 mb-0.5">
                    {item.brand}
                  </Text>
                  <Text className="text-base font-bold text-neutral-800 mb-0.5">
                    {item.name}
                  </Text>
                  <Text className="text-sm font-medium text-neutral-600 mb-1">
                    Size: {item.size}
                  </Text>
                  <Text className="text-base font-black text-neutral-900">
                    ₹{item.price}
                  </Text>
                </View>
              </View>
            ))}

            {/* 3. Expanded Details Section (Icon + Text & Timeline) */}
            {expandedId === order.id && (
              <View className="mt-2 mb-4 pt-4 border-t border-neutral-100">
                
                {/* Shipping Address */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="location-outline" size={18} color="#3e3e3e" />
                    <Text className="text-[15px] font-extrabold text-neutral-800 ml-2">Shipping Address</Text>
                  </View>
                  <Text className="text-[15px] text-neutral-600 ml-6">{order.shippingAddress}</Text>
                </View>

                {/* Payment Method */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="card-outline" size={18} color="#3e3e3e" />
                    <Text className="text-[15px] font-extrabold text-neutral-800 ml-2">Payment Method</Text>
                  </View>
                  <Text className="text-[15px] text-neutral-600 ml-6">{order.paymentMethod}</Text>
                </View>

                {/* Tracking Information */}
                <View className="mb-2">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="car-outline" size={18} color="#3e3e3e" />
                    <Text className="text-[15px] font-extrabold text-neutral-800 ml-2">Tracking Information</Text>
                  </View>
                  <Text className="text-[15px] text-neutral-600 ml-6 mb-1">Tracking Number: {order.tracking?.number}</Text>
                  <Text className="text-[15px] text-neutral-600 ml-6 mb-4">Carrier: {order.tracking?.carrier}</Text>
                  
                  {/* Vertical Timeline */}
                  <View className="ml-6 mt-2">
                    {order.tracking?.timeline.map((event, index) => (
                      <View key={index} className="flex-row mb-5 relative">
                        {/* Dot and Line */}
                        <View className="items-center mr-4">
                          <View className="w-3 h-3 rounded-full bg-[#ff3f6c] z-10" />
                          {index !== order.tracking.timeline.length - 1 && (
                            <View className="w-[1px] bg-neutral-200 absolute top-3 bottom-[-24px]" />
                          )}
                        </View>
                        {/* Event Content */}
                        <View className="-mt-1">
                          <Text className="text-[15px] font-extrabold text-neutral-900">{event.status}</Text>
                          <Text className="text-sm text-neutral-600 mt-0.5">{event.location}</Text>
                          <Text className="text-xs text-neutral-400 mt-0.5">{event.time}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

              </View>
            )}

            {/* 4. Footer (Order Total & Action Button) */}
            <View className="border-t border-neutral-100 border-dashed pt-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-[17px] font-medium text-neutral-600">
                  Order Total
                </Text>
                <Text className="text-xl font-black text-neutral-900">
                  ₹{order.total}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => toggleDetails(order.id)}
                className="items-center mt-5 mb-1"
              >
                <View className="flex-row items-center">
                  <Text className="text-[#ff3f6c] font-bold text-[15px] mr-1">
                    {expandedId === order.id ? "Hide Details" : "View Details"}
                  </Text>
                  <Ionicons name={expandedId === order.id ? "chevron-up" : "chevron-forward"} size={16} color="#ff3f6c" />
                </View>
              </TouchableOpacity>
            </View>

          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}     