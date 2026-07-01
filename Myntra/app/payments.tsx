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
      {/* 1400px Centering Wrapper for the Entire Screen */}
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Header Area */}
        <View className="px-5 py-4 md:py-5 bg-white border-b border-neutral-100 shadow-sm z-10">
          <View className="w-full max-w-3xl mx-auto flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              activeOpacity={0.7}
              className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Ionicons name="arrow-back" size={24} color="#ff3f6c" />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold text-[#ff3f6c] tracking-tight">
              Payment Methods
            </Text>
          </View>
        </View>

        {/* Main Content Area */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingTop: isLargeScreen ? 32 : 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Inner constraint (max-w-3xl) to match Addresses & Settings pages */}
          <View className="w-full max-w-3xl mx-auto px-4">
            
            {/* Add New Card Box */}
            <View className="bg-white p-5 md:p-6 rounded-2xl mb-8 shadow-sm border border-neutral-100">
              <View className="flex-row items-center mb-5">
                <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-50 items-center justify-center mr-3 md:mr-4">
                  <Ionicons name="card" size={20} color="#ff3f6c" />
                </View>
                <Text className="text-lg md:text-xl font-bold text-neutral-800 tracking-tight">
                  Add New Card
                </Text>
              </View>
              
              <TextInput
                className="bg-neutral-50 px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium text-neutral-700 border border-neutral-200 mb-5 focus:border-[#ff3f6c] outline-none tracking-[0.15em]"
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor="#a3a3a3"
                keyboardType="numeric"
                maxLength={16}
                value={newCard}
                onChangeText={setNewCard}
              />
              <TouchableOpacity 
                onPress={handleAddCard} 
                activeOpacity={0.9} 
                className="bg-[#ff3f6c] py-3.5 md:py-4 rounded-xl items-center hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
              >
                <Text className="text-white font-semibold text-sm md:text-base tracking-widest uppercase">
                  SAVE CARD
                </Text>
              </TouchableOpacity>
            </View>

            {/* Saved Cards List */}
            <Text className="font-bold text-neutral-500 mb-4 ml-1 uppercase tracking-widest text-xs">
              Saved Cards
            </Text>
            
            {cards.length === 0 ? (
              <View className="bg-white p-8 md:p-10 rounded-2xl border border-neutral-200 items-center justify-center border-dashed">
                <View className="w-16 h-16 bg-neutral-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="card-outline" size={28} color="#a3a3a3" />
                </View>
                <Text className="text-neutral-500 font-medium text-sm md:text-base text-center">
                  No cards saved yet.
                </Text>
              </View>
            ) : (
              cards.map((card, index) => {
                const isDefault = defaultCard === card;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSetDefault(card)}
                    activeOpacity={0.8}
                    className={`p-5 md:p-6 rounded-2xl mb-4 border flex-row items-center justify-between transition-all cursor-pointer group ${
                      isDefault 
                        ? "border-[#ff3f6c] shadow-sm bg-white" 
                        : "border-neutral-100 bg-white hover:border-neutral-300 hover:shadow-sm"
                    }`}
                  >
                    <View className="flex-1 flex-row items-center">
                      <View className={`w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center transition-colors ${
                        isDefault ? "bg-pink-50" : "bg-neutral-50 group-hover:bg-neutral-100"
                      }`}>
                        <Ionicons 
                          name={isDefault ? "card" : "card-outline"} 
                          size={20} 
                          color={isDefault ? "#ff3f6c" : "#737373"} 
                        />
                      </View>
                      <View className="ml-4 md:ml-5 flex-1">
                        {isDefault && (
                          <Text className="text-[10px] md:text-xs font-bold text-[#ff3f6c] uppercase tracking-wider mb-1.5">
                            Default
                          </Text>
                        )}
                        <Text className={`text-sm md:text-base tracking-[0.1em] ${
                            isDefault ? 'text-neutral-900 font-semibold' : 'text-neutral-600 font-medium'
                          }`}>
                          {card}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Radio Button UI */}
                    <View className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 items-center justify-center ml-4 transition-colors ${
                      isDefault ? 'border-[#ff3f6c]' : 'border-neutral-300 group-hover:border-neutral-400'
                    }`}>
                      {isDefault && <View className="w-2.5 h-2.5 md:w-3 md:h-3 bg-[#ff3f6c] rounded-full" />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}