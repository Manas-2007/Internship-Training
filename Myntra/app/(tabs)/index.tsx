import React from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const categories = [
  {
    id: 1,
    name: "Men",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Women",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Kids",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Beauty",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Footwear",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=500&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Home",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop",
  },
];

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% OFF",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

const products = [
  {
    id: 1,
    name: "Running Shoes",
    brand: "Adidas",
    price: "₹3999",
    discount: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Floral Printed Kurta",
    brand: "W for Woman",
    price: "₹1499",
    discount: "30% OFF",
    image:
      "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2xvdGhpbmd8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 3,
    name: "Leather Belt",
    brand: "Allen Solly",
    price: "₹899",
    discount: "45% OFF",
    image:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Oversized Hoodie",
    brand: "H&M",
    price: "₹1999",
    discount: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Sports Shorts",
    brand: "Puma",
    price: "₹1199",
    discount: "35% OFF",
    image:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Slim Fit Shirt",
    brand: "Raymond",
    price: "₹2199",
    discount: "25% OFF",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Aviator Sunglasses",
    brand: "Fastrack",
    price: "₹1299",
    discount: "50% OFF",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Handheld Tote Bag",
    brand: "Lavie",
    price: "₹2499",
    discount: "40% OFF",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "Track Pants",
    brand: "HRX",
    price: "₹1599",
    discount: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "Woolen Sweater",
    brand: "UCB",
    price: "₹2899",
    discount: "30% OFF",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router=useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 1. Header Section */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-black text-neutral-800 tracking-widest">
          MYNTRA
        </Text>
        <TouchableOpacity className="p-2"
        onPress={() => router.push("/categories")}
        >
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 2. Hero Banner */}
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop",
          }}
          className="w-full h-52 object-cover"
        />

        {/* 3. Shop By Category */}
        <View className="mt-6 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-extrabold text-neutral-800 tracking-wider">
              SHOP BY CATEGORY
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-[#ff3f6c] font-bold mr-1" onPress={()=>router.push("/categories")}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#ff3f6c" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} className="items-center mr-6">
                <Image
                  source={{ uri: cat.image }}
                  className="w-20 h-20 rounded-full border border-neutral-200"
                />
                <Text className="mt-2 text-sm font-semibold text-neutral-700">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. Deals of the Day */}
        <View className="mt-8 px-4">
          <Text className="text-lg font-extrabold text-neutral-800 tracking-wider mb-4">
            DEALS OF THE DAY
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {deals.map((deal) => (
              <TouchableOpacity
                key={deal.id}
                className="mr-4 w-64 h-36 rounded-lg overflow-hidden relative"
                onPress={() => router.push("/categories")}
              >
                <Image
                  source={{ uri: deal.image }}
                  className="w-full h-full object-cover"
                />
                {/* Dark Overlay for Text Readability */}
                <View className="absolute inset-0 bg-black/30 justify-end p-4">
                  <Text className="text-white text-xl font-bold">
                    {deal.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. Trending Now (Product Grid) */}
        <View className="mt-8 px-4 mb-24">
          <Text className="text-lg font-extrabold text-neutral-800 tracking-wider mb-4">
            TRENDING NOW
          </Text>

          {/* Grid Container */}
          <View className="flex-row flex-wrap justify-between">
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => router.push(`/product/${product.id}` as any)}
                className="w-[48%] mb-4 bg-white rounded-lg overflow-hidden shadow-sm shadow-neutral-300 border border-neutral-100"
              >
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-48 object-cover"
                />
                <View className="p-3">
                  <Text className="text-neutral-500 text-xs font-bold mb-1">
                    {product.brand}
                  </Text>
                  <Text
                    className="text-neutral-800 text-sm font-medium mb-1"
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-neutral-900 font-bold mr-2">
                      {product.price}
                    </Text>
                    <Text className="text-[#ff3f6c] text-xs font-bold">
                      {product.discount}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
