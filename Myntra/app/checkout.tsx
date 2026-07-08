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
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "./constants/api";
// 👉 Import ThemeContext
import { useTheme } from "./context/ThemeContext";

export default function Checkout() {
  
  // 👉 Extract colors and isDark
  const { colors, isDark } = useTheme();

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

      if (Platform.OS === "web") {
        window.alert("Success!\n\nYour order has been placed successfully.");
        router.replace("/orders"); // ✅ Seedha orders par
      } else {
        Alert.alert(
          "Success!", 
          "Your order has been placed successfully.", 
          [
            { 
              text: "OK", 
              onPress: () => {
                // 'replace' Checkout ko history se hata dega aur Orders dikhayega
                router.replace("/orders"); 
              }
            }
          ]
        );
      }
      
    } catch (error) {
      console.log("Checkout Error:", error);
      showMessage("Error", "Something went wrong while placing your order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const OrderSummaryCard = () => (
    <View 
      className="p-5 md:p-6 rounded-2xl shadow-sm border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-center mb-5 md:mb-6">
        <Ionicons name="receipt" size={20} color={colors.primary} />
        <Text className="text-lg md:text-xl font-bold ml-2.5 tracking-tight" style={{ color: colors.textMain }}>Price Details</Text>
      </View>

      <View className="gap-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm md:text-base font-medium" style={{ color: colors.textMuted }}>Total MRP</Text>
          <Text className="text-sm md:text-base font-semibold" style={{ color: colors.textMain }}>₹{subTotal}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm md:text-base font-medium" style={{ color: colors.textMuted }}>Platform Fee & Tax</Text>
          <Text className="text-sm md:text-base font-semibold" style={{ color: colors.textMain }}>₹{tax}</Text>
        </View>
        <View 
          className="flex-row justify-between items-center pb-5 border-b border-dashed"
          style={{ borderBottomColor: colors.border }}
        >
          <Text className="text-sm md:text-base font-medium" style={{ color: colors.textMuted }}>Shipping Charges</Text>
          <Text className="text-sm md:text-base font-semibold" style={{ color: isDark ? '#34d399' : '#059669' }}>
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </Text>
        </View>
        <View className="flex-row justify-between items-center pt-1 mb-2">
          <Text className="text-base md:text-lg font-bold" style={{ color: colors.textMain }}>Total Amount</Text>
          <Text className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: colors.textMain }}>₹{finalTotal}</Text>
        </View>
      </View>

      {isDesktopOrTablet && (
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isProcessing}
          activeOpacity={0.9}
          className={`mt-8 py-4 rounded-xl items-center shadow-sm flex-row justify-center transition-opacity cursor-pointer ${
            isProcessing ? 'opacity-70' : 'hover:opacity-90'
          }`}
          style={{ backgroundColor: colors.primary }}
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      {/* 1400px Centering Wrapper */}
      <View className="w-full max-w-[1400px] mx-auto flex-1 relative">
        
        {/* Header Area */}
        <View 
          className="px-5 py-4 md:py-5 border-b flex-row items-center z-10 shadow-sm"
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
        >
          <View className="w-full max-w-5xl mx-auto flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              activeOpacity={0.7}
              className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full cursor-pointer"
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: colors.textMain }}>
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
                <View 
                  className="p-4 md:p-6 rounded-2xl mb-6 md:mb-8 shadow-sm border"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <View className="flex-row items-center mb-5 md:mb-6">
                    <View 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center mr-3 md:mr-4"
                      style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
                    >
                      <Ionicons name="location" size={20} color={colors.primary} />
                    </View>
                    <Text className="text-lg md:text-xl font-bold tracking-tight" style={{ color: colors.textMain }}>Shipping Address</Text>
                  </View>

                  <View className="gap-4 md:gap-5">
                    <TextInput
                      className="px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium border outline-none"
                      style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                      placeholder="Full Name"
                      placeholderTextColor={colors.textMuted}
                      value={fullName}
                      onChangeText={setFullName}
                    />
                    <TextInput
                      className="px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium border outline-none"
                      style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                      placeholder="Complete Address (House No, Street)"
                      placeholderTextColor={colors.textMuted}
                      value={address}
                      onChangeText={setAddress}
                    />
                    <View className="flex-row justify-between gap-3">
                      <TextInput
                        className="flex-1 px-3 py-3 rounded-lg text-xs md:text-sm border outline-none"
                        style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                        placeholder="City"
                        placeholderTextColor={colors.textMuted}
                        value={city}
                        onChangeText={setCity}
                      />
                      <TextInput
                        className="flex-1 px-3 py-3 rounded-lg text-xs md:text-sm border outline-none"
                        style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                        placeholder="Postal Code"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                        value={postalCode}
                        onChangeText={setPostalCode}
                      />
                    </View>
                  </View>
                </View>

                {/* Payment Method Box */}
                <View 
                  className="p-5 md:p-6 rounded-2xl mb-6 shadow-sm border"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <View className="flex-row items-center mb-5 md:mb-6">
                    <View 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center mr-3 md:mr-4"
                      style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
                    >
                      <Ionicons name="card" size={20} color={colors.primary} />
                    </View>
                    <Text className="text-lg md:text-xl font-bold tracking-tight" style={{ color: colors.textMain }}>Payment Details</Text>
                  </View>

                  <View className="gap-4 md:gap-5">
                    <TextInput
                      className="px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium border outline-none tracking-[0.15em]"
                      style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                      placeholder="XXXX XXXX XXXX XXXX"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      maxLength={16}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                    />
                    <View className="flex-row justify-between gap-3">
                      <TextInput
                        className="flex-1 px-3 py-3 rounded-lg text-xs md:text-sm border outline-none"
                        style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                        placeholder="MM/YY"
                        placeholderTextColor={colors.textMuted}
                        maxLength={5}
                      />
                      <TextInput
                        className="flex-1 px-3 py-3 rounded-lg text-xs md:text-sm border outline-none"
                        style={{ backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }}
                        placeholder="CVV"
                        placeholderTextColor={colors.textMuted}
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
          <View 
            className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)]"
            style={{ backgroundColor: colors.surface, borderTopColor: colors.border }}
          >
            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={isProcessing}
              activeOpacity={0.9}
              className={`py-4 rounded-xl items-center shadow-sm flex-row justify-center ${
                isProcessing ? 'opacity-70' : ''
              }`}
              style={{ backgroundColor: colors.primary }}
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