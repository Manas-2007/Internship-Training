import React, { useState, useEffect } from "react";
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
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "./constants/api";

export default function Checkout() {
  const router = useRouter();
  
  const { totalAmount } = useLocalSearchParams(); 
  const subTotal = totalAmount ? Number(totalAmount) : 0;
  const shipping = subTotal > 0 ? 99 : 0;
  const tax = Math.round(subTotal * 0.05); 
  const finalTotal = subTotal + shipping + tax;

  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 1024;
  const isTablet: boolean = width >= 768 && width < 1024;

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

  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!fullName || !address || !city || !postalCode || !cardNumber) {
      showMessage("Missing Fields", "Please fill all the required details.");
      return;
    }

    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showMessage("Session Expired", "Please login again.");
        setIsProcessing(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;

      const fullShippingAddress = `${fullName}, ${address}, ${city}, Postal: ${postalCode}`;
      const paymentMethodInfo = `Card ending in ${cardNumber.slice(-4) || 'XXXX'}`;

      await axios.post(`${API_URL}/api/orders/create/${userId}`, {
        shippingAddress: fullShippingAddress,
        paymentMethod: paymentMethodInfo,
      });

      showMessage("Success!", "Your order has been placed successfully.");
      router.replace("/orders"); 
      
    } catch (error) {
      console.log("Checkout Error:", error);
      showMessage("Error", "Something went wrong while placing your order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const OrderSummaryCard = () => (
    <View className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
      <View className="flex-row items-center mb-5">
        <Ionicons name="receipt" size={20} color="#ff3f6c" />
        <Text className="text-lg font-bold text-neutral-800 ml-2 tracking-tight">Price Details</Text>
      </View>

      <View className="gap-3.5">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-neutral-500 font-medium">Total MRP</Text>
          <Text className="text-sm text-neutral-800 font-semibold">₹{subTotal}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-neutral-500 font-medium">Platform Fee & Tax</Text>
          <Text className="text-sm text-neutral-800 font-semibold">₹{tax}</Text>
        </View>
        <View className="flex-row justify-between items-center pb-4 border-b border-neutral-100">
          <Text className="text-sm text-neutral-500 font-medium">Shipping Charges</Text>
          <Text className="text-sm text-emerald-600 font-semibold">
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </Text>
        </View>
        <View className="flex-row justify-between items-center pt-2 mb-2">
          <Text className="text-base font-bold text-neutral-800">Total Amount</Text>
          <Text className="text-xl font-bold text-neutral-900 tracking-tight">₹{finalTotal}</Text>
        </View>
      </View>

      {(isLargeScreen || isTablet) && (
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isProcessing}
          className={`mt-6 py-3.5 rounded-xl items-center shadow-sm flex-row justify-center transition-colors cursor-pointer ${
            isProcessing ? 'bg-pink-300' : 'bg-[#ff3f6c] hover:bg-[#e0355f]'
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white text-sm font-bold tracking-wider mr-2">PAY ₹{finalTotal}</Text>
              <Ionicons name="lock-closed" size={14} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 py-4 bg-white border-b border-neutral-100 flex-row items-center z-10">
        <View className="w-full max-w-5xl mx-auto flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 cursor-pointer hover:opacity-70 transition-opacity">
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-neutral-900 tracking-tight">
            Checkout
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className={`w-full max-w-5xl mx-auto flex-1 px-4 py-6 ${isLargeScreen || isTablet ? "flex-row gap-8" : "flex-col"}`}>
            
            {/* Forms Column (Left on Desktop, Top on Mobile) */}
            <View className="flex-1">
              
              {/* Shipping Address Box */}
              <View className="bg-white p-5 rounded-xl mb-6 shadow-sm border border-neutral-100">
                <View className="flex-row items-center mb-5">
                  <Ionicons name="location" size={20} color="#ff3f6c" />
                  <Text className="text-lg font-bold text-neutral-800 ml-2 tracking-tight">Shipping Address</Text>
                </View>

                <View className="gap-3.5">
                  <TextInput
                    className="bg-neutral-50 px-4 py-3 rounded-lg text-sm text-neutral-800 border border-neutral-200 focus:border-neutral-400 focus:bg-white transition-colors outline-none"
                    placeholder="Full Name"
                    placeholderTextColor="#a3a3a3"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                  <TextInput
                    className="bg-neutral-50 px-4 py-3 rounded-lg text-sm text-neutral-800 border border-neutral-200 focus:border-neutral-400 focus:bg-white transition-colors outline-none"
                    placeholder="Complete Address (House No, Street)"
                    placeholderTextColor="#a3a3a3"
                    value={address}
                    onChangeText={setAddress}
                  />
                  <View className="flex-row justify-between gap-3.5">
                    <TextInput
                      className="flex-1 bg-neutral-50 px-4 py-3 rounded-lg text-sm text-neutral-800 border border-neutral-200 focus:border-neutral-400 focus:bg-white transition-colors outline-none"
                      placeholder="City"
                      placeholderTextColor="#a3a3a3"
                      value={city}
                      onChangeText={setCity}
                    />
                    <TextInput
                      className="flex-1 bg-neutral-50 px-4 py-3 rounded-lg text-sm text-neutral-800 border border-neutral-200 focus:border-neutral-400 focus:bg-white transition-colors outline-none"
                      placeholder="Postal Code"
                      placeholderTextColor="#a3a3a3"
                      keyboardType="numeric"
                      value={postalCode}
                      onChangeText={setPostalCode}
                    />
                  </View>
                </View>
              </View>

              {/* Payment Method Box */}
              <View className="bg-white p-5 rounded-xl mb-6 shadow-sm border border-neutral-100">
                <View className="flex-row items-center mb-5">
                  <Ionicons name="card" size={20} color="#ff3f6c" />
                  <Text className="text-lg font-bold text-neutral-800 ml-2 tracking-tight">Payment Details</Text>
                </View>

                <View className="gap-3.5">
                  <TextInput
                    className="bg-neutral-50 px-4 py-3 rounded-lg text-sm text-neutral-800 border border-neutral-200 focus:border-neutral-400 focus:bg-white transition-colors outline-none"
                    placeholder="Card Number"
                    placeholderTextColor="#a3a3a3"
                    keyboardType="numeric"
                    maxLength={16}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                  />
                  <View className="flex-row justify-between gap-3.5">
                    <TextInput
                      className="flex-1 bg-neutral-50 px-4 py-3 rounded-lg text-sm text-neutral-800 border border-neutral-200 focus:border-neutral-400 focus:bg-white transition-colors outline-none"
                      placeholder="MM/YY"
                      placeholderTextColor="#a3a3a3"
                      maxLength={5}
                    />
                    <TextInput
                      className="flex-1 bg-neutral-50 px-4 py-3 rounded-lg text-sm text-neutral-800 border border-neutral-200 focus:border-neutral-400 focus:bg-white transition-colors outline-none"
                      placeholder="CVV"
                      placeholderTextColor="#a3a3a3"
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Order Summary Column (Right on Desktop, Bottom on Mobile) */}
            <View className={isLargeScreen || isTablet ? "w-[340px]" : "w-full pb-20"}>
              <OrderSummaryCard />
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Bar for Mobile Only */}
      {(!isLargeScreen && !isTablet) && (
        <View className="absolute bottom-0 w-full px-4 py-4 bg-white border-t border-neutral-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isProcessing}
            className={`py-3.5 rounded-xl items-center shadow-sm flex-row justify-center ${
              isProcessing ? 'bg-pink-300' : 'bg-[#ff3f6c]'
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white text-sm font-bold tracking-wider mr-2">PAY ₹{finalTotal}</Text>
                <Ionicons name="lock-closed" size={14} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}