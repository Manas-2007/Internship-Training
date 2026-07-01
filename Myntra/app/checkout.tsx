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
  const isDesktopOrTablet = isLargeScreen || isTablet;

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
    <View className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-neutral-100">
      <View className="flex-row items-center mb-5 md:mb-6">
        <Ionicons name="receipt" size={20} color="#ff3f6c" />
        <Text className="text-lg md:text-xl font-bold text-neutral-800 ml-2.5 tracking-tight">Price Details</Text>
      </View>

      <View className="gap-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm md:text-base text-neutral-600 font-medium">Total MRP</Text>
          <Text className="text-sm md:text-base text-neutral-900 font-semibold">₹{subTotal}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm md:text-base text-neutral-600 font-medium">Platform Fee & Tax</Text>
          <Text className="text-sm md:text-base text-neutral-900 font-semibold">₹{tax}</Text>
        </View>
        <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-neutral-200">
          <Text className="text-sm md:text-base text-neutral-600 font-medium">Shipping Charges</Text>
          <Text className="text-sm md:text-base text-emerald-600 font-semibold">
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </Text>
        </View>
        <View className="flex-row justify-between items-center pt-1 mb-2">
          <Text className="text-base md:text-lg font-bold text-neutral-800">Total Amount</Text>
          <Text className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">₹{finalTotal}</Text>
        </View>
      </View>

      {isDesktopOrTablet && (
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isProcessing}
          activeOpacity={0.9}
          className={`mt-8 py-4 rounded-xl items-center shadow-sm shadow-pink-200 flex-row justify-center transition-opacity cursor-pointer ${
            isProcessing ? 'bg-pink-300' : 'bg-[#ff3f6c] hover:opacity-90'
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white text-sm md:text-base font-bold tracking-widest mr-2 uppercase">
                PAY ₹{finalTotal}
              </Text>
              <Ionicons name="lock-closed" size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* 1400px Centering Wrapper */}
      <View className="w-full max-w-[1400px] mx-auto flex-1 relative">
        
        {/* Header Area */}
        <View className="px-5 py-4 md:py-5 bg-white border-b border-neutral-100 flex-row items-center z-10 shadow-sm">
          <View className="w-full max-w-5xl mx-auto flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              activeOpacity={0.7}
              className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Ionicons name="arrow-back" size={24} color="#282c3f" />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
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
            contentContainerStyle={{ flexGrow: 1, paddingBottom: isDesktopOrTablet ? 40 : 100 }}
          >
            <View className={`w-full max-w-5xl mx-auto flex-1 px-4 py-3 md:py-8 ${isDesktopOrTablet ? "flex-row gap-8" : "flex-col"}`}>
              
              {/* Forms Column (Left on Desktop, Top on Mobile) */}
              <View className="flex-1">
                
                {/* Shipping Address Box */}
                <View className="bg-white p-4 md:p-6 rounded-2xl mb-6 md:mb-8 shadow-sm border border-neutral-100">
                  <View className="flex-row items-center mb-5 md:mb-6">
                    <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-50 items-center justify-center mr-3 md:mr-4">
                      <Ionicons name="location" size={20} color="#ff3f6c" />
                    </View>
                    <Text className="text-lg md:text-xl font-bold text-neutral-800 tracking-tight">Shipping Address</Text>
                  </View>

                  <View className="gap-4 md:gap-5">
                    <TextInput
                      className="bg-neutral-50 px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium text-neutral-700 border border-neutral-200 focus:border-[#ff3f6c] outline-none"
                      placeholder="Full Name"
                      placeholderTextColor="#a3a3a3"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                    <TextInput
                      className="bg-neutral-50 px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium text-neutral-700 border border-neutral-200 focus:border-[#ff3f6c] outline-none"
                      placeholder="Complete Address (House No, Street)"
                      placeholderTextColor="#a3a3a3"
                      value={address}
                      onChangeText={setAddress}
                    />
                   <View className="flex-row justify-between gap-3">
  <TextInput
    className="flex-1 bg-neutral-50 px-3 py-3 rounded-lg text-xs md:text-sm text-neutral-800 border border-neutral-200 focus:border-[#ff3f6c] outline-none"
    placeholder="City"
    placeholderTextColor="#a3a3a3"
    value={city}
    onChangeText={setCity}
  />
  <TextInput
    className="flex-1 bg-neutral-50 px-3 py-3 rounded-lg text-xs md:text-sm text-neutral-800 border border-neutral-200 focus:border-[#ff3f6c] outline-none"
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
                <View className="bg-white p-5 md:p-6 rounded-2xl mb-6 shadow-sm border border-neutral-100">
                  <View className="flex-row items-center mb-5 md:mb-6">
                    <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-50 items-center justify-center mr-3 md:mr-4">
                      <Ionicons name="card" size={20} color="#ff3f6c" />
                    </View>
                    <Text className="text-lg md:text-xl font-bold text-neutral-800 tracking-tight">Payment Details</Text>
                  </View>

                  <View className="gap-4 md:gap-5">
                    <TextInput
                      className="bg-neutral-50 px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium text-neutral-700 border border-neutral-200 focus:border-[#ff3f6c] outline-none tracking-[0.15em]"
                      placeholder="XXXX XXXX XXXX XXXX"
                      placeholderTextColor="#a3a3a3"
                      keyboardType="numeric"
                      maxLength={16}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                    />
                   <View className="flex-row justify-between gap-3">
  <TextInput
    className="flex-1 bg-neutral-50 px-3 py-3 rounded-lg text-xs md:text-sm text-neutral-800 border border-neutral-200 focus:border-[#ff3f6c] outline-none"
    placeholder="MM/YY"
    placeholderTextColor="#a3a3a3"
    maxLength={5}
  />
  <TextInput
    className="flex-1 bg-neutral-50 px-3 py-3 rounded-lg text-xs md:text-sm text-neutral-800 border border-neutral-200 focus:border-[#ff3f6c] outline-none"
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
              <View className={isDesktopOrTablet ? "w-[380px]" : "w-full"}>
                <OrderSummaryCard />
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Sticky Bottom Bar for Mobile Only */}
        {!isDesktopOrTablet && (
          <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-neutral-100 shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)]">
            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={isProcessing}
              activeOpacity={0.9}
              className={`py-4 rounded-xl items-center shadow-sm flex-row justify-center ${
                isProcessing ? 'bg-pink-300' : 'bg-[#ff3f6c]'
              }`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white text-base font-bold tracking-widest mr-2 uppercase">
                    PAY ₹{finalTotal}
                  </Text>
                  <Ionicons name="lock-closed" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}