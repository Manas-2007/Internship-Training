import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Addresses() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<string>("");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem("userAddresses");
      const savedDefault = await AsyncStorage.getItem("defaultAddress");
      if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
      if (savedDefault) setDefaultAddress(savedDefault);
    } catch (error) {
      console.log("Error loading addresses", error);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      Alert.alert("Invalid", "Please enter a valid address.");
      return;
    }
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    setNewAddress("");
    
    // Automatically set as default if it's the first one
    if (updatedAddresses.length === 1) {
      handleSetDefault(newAddress);
    }
    await AsyncStorage.setItem("userAddresses", JSON.stringify(updatedAddresses));
  };

  const handleSetDefault = async (addr: string) => {
    setDefaultAddress(addr);
    await AsyncStorage.setItem("defaultAddress", addr);
    Alert.alert("Success", "Default address updated!");
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 py-4 bg-white border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#282c3f" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-[#282c3f]">Addresses</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Add New Address */}
        <View className="bg-white p-4 rounded-xl mb-6 shadow-sm border border-neutral-100">
          <Text className="font-bold text-neutral-800 mb-2">Add New Address</Text>
          <TextInput
            className="bg-neutral-50 px-4 py-3 rounded-lg text-base border border-neutral-200 mb-3"
            placeholder="123 Main St, City, Zip"
            value={newAddress}
            onChangeText={setNewAddress}
          />
          <TouchableOpacity onPress={handleAddAddress} className="bg-[#ff3f6c] py-3 rounded-lg items-center">
            <Text className="text-white font-bold text-base">SAVE ADDRESS</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Addresses List */}
        <Text className="font-bold text-neutral-500 mb-3 ml-1 uppercase text-xs">Saved Addresses</Text>
        {addresses.length === 0 ? (
          <Text className="text-neutral-500 italic text-center mt-4">No addresses saved yet.</Text>
        ) : (
          addresses.map((addr, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSetDefault(addr)}
              className={`p-4 rounded-xl mb-3 border bg-white flex-row items-center justify-between ${
                defaultAddress === addr ? "border-[#ff3f6c] shadow-sm" : "border-neutral-200"
              }`}
            >
              <View className="flex-1 flex-row items-center">
                <Ionicons name="location-outline" size={24} color={defaultAddress === addr ? "#ff3f6c" : "#737373"} />
                <Text className="text-base text-neutral-800 ml-3 flex-1" numberOfLines={2}>{addr}</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${defaultAddress === addr ? 'border-[#ff3f6c]' : 'border-neutral-300'}`}>
                {defaultAddress === addr && <View className="w-3 h-3 bg-[#ff3f6c] rounded-full" />}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}