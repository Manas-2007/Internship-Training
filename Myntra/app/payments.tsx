import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Payments() {
  const router = useRouter();
  const [cards, setCards] = useState<string[]>([]);
  const [defaultCard, setDefaultCard] = useState<string>("");
  const [newCard, setNewCard] = useState("");

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const savedCards = await AsyncStorage.getItem("userCards");
      const savedDefault = await AsyncStorage.getItem("defaultCard");
      if (savedCards) setCards(JSON.parse(savedCards));
      if (savedDefault) setDefaultCard(savedDefault);
    } catch (error) {}
  };

  const handleAddCard = async () => {
    if (newCard.length < 12) {
      Alert.alert("Invalid", "Please enter a valid card number.");
      return;
    }
    const cardMasked = `**** **** **** ${newCard.slice(-4)}`;
    const updatedCards = [...cards, cardMasked];
    setCards(updatedCards);
    setNewCard("");
    
    if (updatedCards.length === 1) handleSetDefault(cardMasked);
    await AsyncStorage.setItem("userCards", JSON.stringify(updatedCards));
  };

  const handleSetDefault = async (card: string) => {
    setDefaultCard(card);
    await AsyncStorage.setItem("defaultCard", card);
    Alert.alert("Success", "Default payment method updated!");
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 py-4 bg-white border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#282c3f" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-[#282c3f]">Payment Methods</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Add New Card */}
        <View className="bg-white p-4 rounded-xl mb-6 shadow-sm border border-neutral-100">
          <Text className="font-bold text-neutral-800 mb-2">Add New Card</Text>
          <TextInput
            className="bg-neutral-50 px-4 py-3 rounded-lg text-base border border-neutral-200 mb-3 tracking-widest"
            placeholder="XXXX XXXX XXXX XXXX"
            keyboardType="numeric"
            maxLength={16}
            value={newCard}
            onChangeText={setNewCard}
          />
          <TouchableOpacity onPress={handleAddCard} className="bg-[#ff3f6c] py-3 rounded-lg items-center">
            <Text className="text-white font-bold text-base">SAVE CARD</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Cards List */}
        <Text className="font-bold text-neutral-500 mb-3 ml-1 uppercase text-xs">Saved Cards</Text>
        {cards.length === 0 ? (
          <Text className="text-neutral-500 italic text-center mt-4">No cards saved yet.</Text>
        ) : (
          cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSetDefault(card)}
              className={`p-4 rounded-xl mb-3 border bg-white flex-row items-center justify-between ${
                defaultCard === card ? "border-[#ff3f6c] shadow-sm" : "border-neutral-200"
              }`}
            >
              <View className="flex-1 flex-row items-center">
                <Ionicons name="card-outline" size={24} color={defaultCard === card ? "#ff3f6c" : "#737373"} />
                <Text className="text-base font-bold text-neutral-800 ml-3">{card}</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${defaultCard === card ? 'border-[#ff3f6c]' : 'border-neutral-300'}`}>
                {defaultCard === card && <View className="w-3 h-3 bg-[#ff3f6c] rounded-full" />}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}