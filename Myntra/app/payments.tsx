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
// 👉 Import ThemeContext
import { useTheme } from "./context/ThemeContext";

export default function Payments() {
  const router = useRouter();
  
  // 👉 Extract colors and isDark
  const { colors, isDark } = useTheme();

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
    // 👉 Dynamic Main Background
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      {/* 1400px Centering Wrapper for the Entire Screen */}
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Header Area */}
        <View 
          className="px-5 py-4 md:py-5 border-b shadow-sm z-10"
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
        >
          <View className="w-full max-w-3xl mx-auto flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              activeOpacity={0.7}
              className="mr-3 md:mr-4 p-1.5 -ml-1.5 rounded-full cursor-pointer"
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>
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
            <View 
              className="p-5 md:p-6 rounded-2xl mb-8 shadow-sm border"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <View className="flex-row items-center mb-5">
                <View 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center mr-3 md:mr-4"
                  style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
                >
                  <Ionicons name="card" size={20} color={colors.primary} />
                </View>
                <Text className="text-lg md:text-xl font-bold tracking-tight" style={{ color: colors.textMain }}>
                  Add New Card
                </Text>
              </View>
              
              {/* 👉 Dynamic Input Field */}
              <TextInput
                className="px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium mb-5 outline-none tracking-[0.15em] border"
                style={{ 
                  backgroundColor: colors.background, 
                  color: colors.textMain, 
                  borderColor: colors.border 
                }}
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={16}
                value={newCard}
                onChangeText={setNewCard}
              />
              
              <TouchableOpacity 
                onPress={handleAddCard} 
                activeOpacity={0.9} 
                className="py-3.5 md:py-4 rounded-xl items-center hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-sm md:text-base tracking-widest uppercase">
                  SAVE CARD
                </Text>
              </TouchableOpacity>
            </View>

            {/* Saved Cards List */}
            <Text className="font-bold mb-4 ml-1 uppercase tracking-widest text-xs" style={{ color: colors.textMuted }}>
              Saved Cards
            </Text>
            
            {cards.length === 0 ? (
              // 👉 Dynamic Empty State
              <View 
                className="p-8 md:p-10 rounded-2xl border items-center justify-center border-dashed"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: colors.background }}
                >
                  <Ionicons name="card-outline" size={28} color={colors.textMuted} />
                </View>
                <Text className="font-medium text-sm md:text-base text-center" style={{ color: colors.textMuted }}>
                  No cards saved yet.
                </Text>
              </View>
            ) : (
              cards.map((card, index) => {
                const isDefault = defaultCard === card;

                return (
                  // 👉 Dynamic Card Item Layout
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSetDefault(card)}
                    activeOpacity={0.8}
                    className="p-5 md:p-6 rounded-2xl mb-4 border flex-row items-center justify-between transition-all cursor-pointer shadow-sm"
                    style={{ 
                      backgroundColor: colors.surface,
                      borderColor: isDefault ? colors.primary : colors.border
                    }}
                  >
                    <View className="flex-1 flex-row items-center">
                      <View 
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center transition-colors"
                        style={{ 
                          backgroundColor: isDefault 
                            ? (isDark ? '#3f1d2b' : '#fdf2f8') 
                            : colors.background 
                        }}
                      >
                        <Ionicons 
                          name={isDefault ? "card" : "card-outline"} 
                          size={20} 
                          color={isDefault ? colors.primary : colors.textMuted} 
                        />
                      </View>
                      <View className="ml-4 md:ml-5 flex-1">
                        {isDefault && (
                          <Text className="text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.primary }}>
                            Default
                          </Text>
                        )}
                        <Text 
                          className={`text-sm md:text-base tracking-[0.1em] ${isDefault ? 'font-semibold' : 'font-medium'}`}
                          style={{ color: isDefault ? colors.textMain : colors.textMuted }}
                        >
                          {card}
                        </Text>
                      </View>
                    </View>
                    
                    {/* 👉 Dynamic Radio Button UI */}
                    <View 
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 items-center justify-center ml-4 transition-colors"
                      style={{ borderColor: isDefault ? colors.primary : colors.border }}
                    >
                      {isDefault && <View className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: colors.primary }} />}
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