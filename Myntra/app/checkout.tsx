import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_URL = "http://10.132.206.253:5000";

export default function Checkout() {
  const router = useRouter();
  
  // Bag se pass kiya hua total amount catch karo
  const { totalAmount } = useLocalSearchParams(); 
  const subTotal = totalAmount ? Number(totalAmount) : 0;
  const shipping = subTotal > 0 ? 99 : 0;
  const tax = Math.round(subTotal * 0.05); // Dummy 5% tax
  const finalTotal = subTotal + shipping + tax;

  // Form States
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const addr = await AsyncStorage.getItem("defaultAddress");
        const card = await AsyncStorage.getItem("defaultCard");
        
        if (addr) setAddress(addr);
        if (card) setCardNumber(card);
      } catch (error) {
        console.log("Error loading defaults:", error);
      }
    };
    loadDefaultData();
  }, []);

  // PLACE ORDER API LOGIC
  const handlePlaceOrder = async () => {
    if (!fullName || !address || !city || !postalCode || !cardNumber) {
      Alert.alert("Missing Fields", "Please fill all the required details.");
      return;
    }

    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Session Expired", "Please login again.");
        setIsProcessing(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;

      const fullShippingAddress = `${fullName}, ${address}, ${city}, Postal: ${postalCode}`;
      const paymentMethodInfo = `Card ending in ${cardNumber.slice(-4) || 'XXXX'}`;

      // Hit Backend API to create order
      await axios.post(`${API_URL}/api/orders/create/${userId}`, {
        shippingAddress: fullShippingAddress,
        paymentMethod: paymentMethodInfo,
      });

      // Success hone par Order tab ya Success page par bhej do
      Alert.alert("Success!", "Your order has been placed successfully.");
      router.replace("/orders"); 
      
    } catch (error) {
      console.log("Checkout Error:", error);
      Alert.alert("Error", "Something went wrong while placing your order.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-neutral-100 flex-row items-center z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="#282c3f" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-[#282c3f] tracking-tight">
          Checkout
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Shipping Address Box */}
          <View className="bg-white p-5 rounded-2xl mb-5 shadow-sm border border-neutral-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={22} color="#ff3f6c" />
              <Text className="text-lg font-bold text-neutral-800 ml-2">Shipping Address</Text>
            </View>

            <View className="gap-3">
              <TextInput
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 border border-neutral-200 focus:border-[#ff3f6c]"
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 border border-neutral-200"
                placeholder="Complete Address (House No, Street)"
                value={address}
                onChangeText={setAddress}
              />
              <View className="flex-row justify-between">
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 border border-neutral-200 w-[48%]"
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 border border-neutral-200 w-[48%]"
                  placeholder="Postal Code"
                  keyboardType="numeric"
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
              </View>
            </View>
          </View>

          {/* Payment Method Box */}
          <View className="bg-white p-5 rounded-2xl mb-5 shadow-sm border border-neutral-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="card" size={22} color="#ff3f6c" />
              <Text className="text-lg font-bold text-neutral-800 ml-2">Payment Details</Text>
            </View>

            <View className="gap-3">
              <TextInput
                className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 border border-neutral-200"
                placeholder="Card Number"
                keyboardType="numeric"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
              />
              <View className="flex-row justify-between">
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 border border-neutral-200 w-[48%]"
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <TextInput
                  className="bg-neutral-50 px-4 py-3.5 rounded-xl text-base text-neutral-800 border border-neutral-200 w-[48%]"
                  placeholder="CVV"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Order Summary Box */}
          <View className="bg-white p-5 rounded-2xl mb-8 shadow-sm border border-neutral-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="receipt" size={22} color="#ff3f6c" />
              <Text className="text-lg font-bold text-neutral-800 ml-2">Price Details</Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-neutral-500 font-medium">Total MRP</Text>
                <Text className="text-base text-neutral-800 font-semibold">₹{subTotal}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-neutral-500 font-medium">Platform Fee & Tax</Text>
                <Text className="text-base text-neutral-800 font-semibold">₹{tax}</Text>
              </View>
              <View className="flex-row justify-between items-center pb-3 border-b border-neutral-100">
                <Text className="text-base text-neutral-500 font-medium">Shipping Charges</Text>
                <Text className="text-base text-[#ff3f6c] font-semibold">
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </Text>
              </View>
              <View className="flex-row justify-between items-center pt-2">
                <Text className="text-lg font-bold text-neutral-800">Total Amount</Text>
                <Text className="text-xl font-black text-[#282c3f]">₹{finalTotal}</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Footer - Safe area adjustment included */}
      <View className="px-5 py-4 bg-white border-t border-neutral-100 shadow-lg mb-[15px]">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isProcessing}
          className={`py-4 rounded-xl items-center shadow-md flex-row justify-center ${isProcessing ? 'bg-pink-300' : 'bg-[#ff3f6c]'}`}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white text-base font-black tracking-widest mr-2">PAY ₹{finalTotal}</Text>
              <Ionicons name="lock-closed" size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}