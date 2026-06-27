import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Screen ki height nikali taaki image perfectly half screen cover kare
const { height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      className="flex-1 bg-white"
    >
      <StatusBar style="light" />
      
      {/* Poori screen ScrollView mein wrap kar di */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        {/* Top Banner Image (Ab iski height fixed 45% of screen hai) */}
        <View style={{ height: height * 0.45, width: '100%' }}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop" }} 
            className="w-full h-full object-cover"
          />
        </View>

        {/* Bottom White Overlay Card */}
        <View className="flex-1 bg-white rounded-t-[40px] -mt-12 px-6 pt-10 pb-8">
          
          <Text className="text-4xl font-black text-neutral-800 mb-2 tracking-tight">
            Welcome to Myntra
          </Text>
          <Text className="text-base text-neutral-500 mb-8 font-medium">
            Login to continue shopping
          </Text>

          {/* Email Input */}
          <TextInput 
            placeholder="Email"
            className="bg-neutral-50 px-5 py-4 rounded-2xl mb-4 text-base border border-neutral-100"
            placeholderTextColor="#a3a3a3"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput 
            placeholder="Password"
            className="bg-neutral-50 px-5 py-4 rounded-2xl mb-8 text-base border border-neutral-100"
            placeholderTextColor="#a3a3a3"
            secureTextEntry
          />

          {/* Login Button */}
          <TouchableOpacity 
            className="bg-[#ff3f6c] py-4 rounded-2xl items-center shadow-sm mb-6 mt-4"
            onPress={() => router.replace('/(tabs)')} 
          >
            <Text className="text-white font-bold text-lg tracking-widest">
              LOGIN
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity className="items-center mt-auto mb-4">
            <Text className="text-base text-neutral-500 font-medium">
              Don't have an account? <Text className="text-[#ff3f6c] font-bold">Sign Up</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}