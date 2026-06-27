import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Checkout() {
  const router = useRouter();

  const handlePlaceOrder = () => {
    router.replace("/orders");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#3e3e3e" />
        </TouchableOpacity>
        <Text className="text-3xl font-black text-neutral-800 tracking-tight">
          Checkout
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 py-4">
          
          {/* Shipping Address Box */}
          <View className="bg-white p-5 rounded-2xl mb-5 border border-neutral-100 shadow-sm shadow-neutral-200">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location-outline" size={22} color="#ff3f6c" />
              <Text className="text-xl font-bold text-neutral-800 ml-2">
                Shipping Address
              </Text>
            </View>

            <View className="gap-3">
              <TextInput
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800"
                placeholder="Full Name"
                defaultValue="John Doe"
              />
              <TextInput
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800"
                placeholder="Address Line 1"
                defaultValue="123 Main Street"
              />
              <TextInput
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800"
                placeholder="Address Line 2"
                defaultValue="Apt 4B"
              />
              <View className="flex-row justify-between">
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 w-[48%]"
                  placeholder="City"
                  defaultValue="New York"
                />
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 w-[48%]"
                  placeholder="State"
                  defaultValue="NY"
                />
              </View>
              <View className="flex-row justify-between">
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 w-[48%]"
                  placeholder="Postal Code"
                  defaultValue="10001"
                />
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 w-[48%]"
                  placeholder="Country"
                  defaultValue="United States"
                />
              </View>
            </View>
          </View>

          {/* Payment Method Box */}
          <View className="bg-white p-5 rounded-2xl mb-5 border border-neutral-100 shadow-sm shadow-neutral-200">
            <View className="flex-row items-center mb-4">
              <Ionicons name="card-outline" size={22} color="#ff3f6c" />
              <Text className="text-xl font-bold text-neutral-800 ml-2">
                Payment Method
              </Text>
            </View>

            <View className="gap-3">
              <TextInput
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800"
                placeholder="Card Number"
                defaultValue="**** **** **** 4242"
              />
              <View className="flex-row justify-between">
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 w-[48%]"
                  placeholder="Expiry Date"
                  defaultValue="12/25"
                />
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 w-[48%]"
                  placeholder="CVV"
                  defaultValue="***"
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Order Summary Box */}
          <View className="bg-white p-5 rounded-2xl mb-8 border border-neutral-100 shadow-sm shadow-neutral-200">
            <View className="flex-row items-center mb-4">
              <Ionicons name="cube-outline" size={22} color="#ff3f6c" />
              <Text className="text-xl font-bold text-neutral-800 ml-2">
                Order Summary
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-neutral-500 font-medium">Subtotal</Text>
                <Text className="text-base text-neutral-800 font-semibold">₹3,798</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-neutral-500 font-medium">Shipping</Text>
                <Text className="text-base text-neutral-800 font-semibold">₹99</Text>
              </View>
              <View className="flex-row justify-between items-center pb-3 border-b border-neutral-100">
                <Text className="text-base text-neutral-500 font-medium">Tax</Text>
                <Text className="text-base text-neutral-800 font-semibold">₹190</Text>
              </View>
              <View className="flex-row justify-between items-center pt-2">
                <Text className="text-lg font-bold text-neutral-800">Total</Text>
                <Text className="text-xl font-black text-[#ff3f6c]">₹4,087</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Footer */}
      <View 
        className="px-4 py-3 bg-white border-t border-neutral-100"
        style={{ paddingBottom: Platform.OS === 'ios' ? 30 : 15 }}
      >
        <TouchableOpacity
          onPress={handlePlaceOrder}
          className="bg-[#ff3f6c] py-4 rounded-xl items-center shadow-sm"
        >
          <Text className="text-white text-lg font-bold tracking-wide">
            PLACE ORDER
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}