import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./context/ThemeContext";

export default function Addresses() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const [addresses, setAddresses] = useState<string[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<string>("");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem("userAddresses");
      const savedDefault = await AsyncStorage.getItem("defaultAddress");
      if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
      if (savedDefault) setDefaultAddress(savedDefault);
    } catch (error) {
      console.error("Error loading addresses", error);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      showMessage("Invalid", "Please enter a valid address.");
      return;
    }
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    setNewAddress("");
    
    if (updatedAddresses.length === 1) {
      handleSetDefault(newAddress, false); 
    }
    await AsyncStorage.setItem("userAddresses", JSON.stringify(updatedAddresses));
  };

  const handleSetDefault = async (addr: string, showAlert: boolean = true) => {
    setDefaultAddress(addr);
    await AsyncStorage.setItem("defaultAddress", addr);
    if (showAlert) {
      showMessage("Success", "Default address updated!");
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Header */}
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
              Addresses
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingTop: isLargeScreen ? 32 : 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-3xl mx-auto px-4">
            <View 
              className="p-5 md:p-6 rounded-2xl mb-8 shadow-sm border"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <View className="flex-row items-center mb-5">
                <View 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center mr-3 md:mr-4"
                  style={{ backgroundColor: isDark ? '#3f1d2b' : '#fdf2f8' }}
                >
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <Text className="text-lg md:text-xl font-bold tracking-tight" style={{ color: colors.textMain }}>
                  Add New Address
                </Text>
              </View>
              
              <TextInput
                className="px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-medium mb-5 outline-none border"
                style={{ 
                  backgroundColor: colors.background, 
                  color: colors.textMain, 
                  borderColor: colors.border 
                }}
                placeholder="e.g. 123 Main St, City, Zip"
                placeholderTextColor={colors.textMuted}
                value={newAddress}
                onChangeText={setNewAddress}
              />
              <TouchableOpacity 
                onPress={handleAddAddress}
                activeOpacity={0.9} 
                className="py-3.5 md:py-4 rounded-xl items-center hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-pink-200"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-sm md:text-base tracking-widest uppercase">
                  SAVE ADDRESS
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="font-bold mb-4 ml-1 uppercase tracking-widest text-xs" style={{ color: colors.textMuted }}>
              Saved Addresses
            </Text>
            
            {addresses.length === 0 ? (
              <View 
                className="p-8 md:p-10 rounded-2xl border items-center justify-center border-dashed"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: colors.background }}
                >
                  <Ionicons name="map-outline" size={28} color={colors.textMuted} />
                </View>
                <Text className="font-medium text-sm md:text-base text-center" style={{ color: colors.textMuted }}>
                  No addresses saved yet.
                </Text>
              </View>
            ) : (
              addresses.map((addr, index) => {
                const isDefault = defaultAddress === addr;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSetDefault(addr)}
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
                          name={isDefault ? "home" : "location-outline"} 
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
                          className={`text-sm md:text-base leading-5 md:leading-6 ${isDefault ? 'font-semibold' : 'font-medium'}`} 
                          style={{ color: isDefault ? colors.textMain : colors.textMuted }}
                          numberOfLines={3}
                        >
                          {addr}
                        </Text>
                      </View>
                    </View>
                    
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