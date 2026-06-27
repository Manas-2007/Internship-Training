import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-between p-8">
        
        {/* Top Section - Illustration & Title */}
        <View className="items-center mt-10">
          <View className="w-32 h-32 bg-blue-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="cart-outline" size={60} color="#104cf3" />
          </View>
          
          <Text className="text-4xl font-extrabold text-neutral-900 text-center mb-2">
            Welcome to Myntra
          </Text>
          <Text className="text-neutral-500 text-lg text-center px-4">
            Discover the latest trends in fashion and shop your favorites.
          </Text>
        </View>

        {/* Bottom Section - Buttons & Footer */}
        <View className="w-full">
          {/* Primary Login Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-full bg-[#104cf3] p-5 rounded-2xl items-center shadow-lg shadow-blue-500/50 mb-4"
            onPress={handleContinue}
          >
            <Text className="text-white font-bold text-lg">Login / Sign Up</Text>
          </TouchableOpacity>

          {/* Guest Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-full bg-neutral-100 p-5 rounded-2xl items-center border border-neutral-200"
            onPress={handleContinue}
          >
            <Text className="text-neutral-700 font-bold text-lg">Continue as Guest</Text>
          </TouchableOpacity>

          {/* Footer Terms */}
          <Text className="text-neutral-400 text-xs text-center mt-8 px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}