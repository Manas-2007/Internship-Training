import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Payments() {
  const router = useRouter();
  const [cards, setCards] = useState<string[]>([]);
  const [defaultCard, setDefaultCard] = useState<string>("");
  const [newCard, setNewCard] = useState<string>("");
  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 768;

  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async (): Promise<void> => {
    try {
      const savedCards = await AsyncStorage.getItem("userCards");
      const savedDefault = await AsyncStorage.getItem("defaultCard");
      if (savedCards) setCards(JSON.parse(savedCards));
      if (savedDefault) setDefaultCard(savedDefault);
    } catch (error) {
      console.log("Error loading cards:", error);
    }
  };

  const handleAddCard = async (): Promise<void> => {
    if (newCard.length < 12) {
      showMessage("Invalid", "Please enter a valid card number.");
      return;
    }
    const cardMasked = `**** **** **** ${newCard.slice(-4)}`;
    const updatedCards = [...cards, cardMasked];
    setCards(updatedCards);
    setNewCard("");

    if (updatedCards.length === 1) handleSetDefault(cardMasked);
    await AsyncStorage.setItem("userCards", JSON.stringify(updatedCards));
  };

  const handleSetDefault = async (card: string): Promise<void> => {
    setDefaultCard(card);
    await AsyncStorage.setItem("defaultCard", card);
    showMessage("Success", "Default payment method updated!");
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <View className="px-5 py-4 bg-white border-b border-neutral-100 flex-row items-center">
        <View className="w-full max-w-2xl mx-auto flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-neutral-900 tracking-tight">Payment Methods</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }}
      >
        <View className={`w-full ${isLargeScreen ? "max-w-xl" : "max-w-md"} px-4`}>
          
          <View className="bg-white p-5 rounded-2xl mb-8 shadow-sm border border-neutral-100">
            <Text className="font-bold text-neutral-800 mb-4 text-base">Add New Card</Text>
            <TextInput
              className="bg-neutral-50 px-4 py-3 rounded-xl text-base border border-neutral-200 mb-4 tracking-widest outline-none"
              placeholder="XXXX XXXX XXXX XXXX"
              placeholderTextColor="#a3a3a3"
              keyboardType="numeric"
              maxLength={16}
              value={newCard}
              onChangeText={setNewCard}
            />
            <TouchableOpacity 
              onPress={handleAddCard} 
              className="bg-[#ff3f6c] py-3.5 rounded-xl items-center hover:opacity-90 transition-opacity"
            >
              <Text className="text-white font-bold text-sm tracking-widest">SAVE CARD</Text>
            </TouchableOpacity>
          </View>

          <Text className="font-bold text-neutral-400 mb-3 ml-1 uppercase text-xs tracking-wider">
            Saved Cards
          </Text>
          
          {cards.length === 0 ? (
            <Text className="text-neutral-400 italic text-center mt-6">No cards saved yet.</Text>
          ) : (
            cards.map((card, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSetDefault(card)}
                className={`p-5 rounded-2xl mb-3 border bg-white flex-row items-center justify-between transition-colors ${
                  defaultCard === card ? "border-[#ff3f6c] shadow-sm" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <View className="flex-1 flex-row items-center">
                  <Ionicons 
                    name="card-outline" 
                    size={22} 
                    color={defaultCard === card ? "#ff3f6c" : "#737373"} 
                  />
                  <Text className="text-base font-semibold text-neutral-800 ml-3 tracking-wide">{card}</Text>
                </View>
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${defaultCard === card ? 'border-[#ff3f6c]' : 'border-neutral-300'}`}>
                  {defaultCard === card && <View className="w-2.5 h-2.5 bg-[#ff3f6c] rounded-full" />}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}