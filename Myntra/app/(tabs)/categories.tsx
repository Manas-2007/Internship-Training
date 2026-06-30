import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import { useGlobalContext } from "../context/GlobalContext";

interface Category {
  name: string;
  image: string;
  subCategories: string[];
}

const categoriesData: Category[] = [
  {
    name: "Men",
    image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
    subCategories: ["T-Shirts", "Shirts", "Jeans", "Trousers"],
  },
  {
    name: "Women",
    image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
    subCategories: ["Dresses", "Tops", "Ethnic Wear", "Western"],
  },
  {
    name: "Footwear",
    image: "https://images.pexels.com/photos/19090/pexels-photo.jpg",
    subCategories: ["Sneakers", "Formal", "Sandals", "Heels"],
  },
  {
    name: "Accessories",
    image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg",
    subCategories: ["Watches", "Belts", "Jewellery", "Bags"],
  },
  {
    name: "Beauty",
    image: "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg",
    subCategories: ["Makeup", "Skin Care", "Fragrance", "Hair"],
  },
  {
    name: "Kids",
    image: "https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg",
    subCategories: ["Sets", "Shoes", "T-Shirts", "Toys"],
  },
];

export default function Categories() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products } = useGlobalContext();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const getCategoryCardWidth = () => {
    if (isDesktop) return "31%";
    if (isTablet) return "48%";
    return "100%";
  };

  const getProductCardWidth = () => {
    if (isDesktop) return "23.5%";
    if (isTablet) return "31%";
    return "48%";
  };

  useEffect(() => {
    if (params.categoryName) {
      const found = categoriesData.find(
        (c: Category) => c.name === params.categoryName
      );
      if (found) {
        setSelectedCategory(found);
      }
    }
  }, [params.categoryName]);

  const getDisplayProducts = () => {
    if (!products || products.length === 0 || !selectedCategory) return [];

    const catName = selectedCategory.name.toLowerCase();

    const matches = products.filter((p: any) => {
      const searchData = `${p.name} ${p.brand} ${p.description}`.toLowerCase();

      if (catName === "footwear") {
        return (
          searchData.includes("footwear") ||
          searchData.includes("shoe") ||
          searchData.includes("sneaker") ||
          searchData.includes("adidas")
        );
      }

      return searchData.includes(catName);
    });

    if (matches.length === 0) return [];

    if (catName === "footwear") {
      return matches.length >= 5 ? [matches[4]] : [matches[0]];
    }

    return [matches[0]];
  };

  const visibleProducts = getDisplayProducts();

  const filteredCategories = categoriesData.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="w-full max-w-6xl mx-auto flex-1">
        
        <View className="px-4 py-4 bg-white">
          <Text className="text-3xl font-bold text-neutral-900 tracking-tight">
            Categories
          </Text>
        </View>

        <View className="px-4 pb-4 bg-white border-b border-neutral-100">
          <View className="flex-row items-center bg-[#f5f5f5] px-4 py-3 rounded-xl border border-transparent hover:border-neutral-200 transition-colors">
            <Ionicons name="search" size={20} color="#a3a3a3" />
            <TextInput
              placeholder="Search for categories..."
              className="flex-1 ml-2 text-neutral-800 text-base outline-none"
              placeholderTextColor="#a3a3a3"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSelectedCategory(null);
              }}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {selectedCategory ? (
            <View className="pt-4">
              <TouchableOpacity
                className="flex-row items-center px-4 mb-4 hover:opacity-70 transition-opacity cursor-pointer w-48"
                onPress={() => setSelectedCategory(null)}
              >
                <Ionicons name="arrow-back" size={18} color="#ce4067" />
                <Text className="text-[#ce4067] font-bold text-base ml-1">
                  Back to Categories
                </Text>
              </TouchableOpacity>

              <Text className="text-4xl font-bold text-neutral-900 px-4 mb-6">
                {selectedCategory.name}
              </Text>

              <View className="mb-8">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="px-4"
                >
                  {selectedCategory.subCategories.map(
                    (sub: string, index: number) => {
                      const isActive = index === 0;

                      return (
                        <TouchableOpacity
                          key={index}
                          activeOpacity={isActive ? 1 : 0.6}
                          onPress={() => {
                            if (!isActive) {
                              alert(`${sub} products are coming soon!`);
                            }
                          }}
                          className={`px-6 py-2.5 rounded-full mr-3 border flex-row items-center justify-center transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[#ff3f6c] border-[#ff3f6c] shadow-sm"
                              : "bg-white border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          <Text
                            numberOfLines={1}
                            className={`font-bold text-[14px] tracking-wide ${
                              isActive ? "text-white" : "text-neutral-700"
                            }`}
                          >
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                  <View className="w-8" />
                </ScrollView>
              </View>

              <View className="flex-row flex-wrap justify-between px-4">
                {visibleProducts.length > 0 ? (
                  visibleProducts.map((product: any) => {
                    const imageUrl =
                      product.images?.[0] ||
                      product.image ||
                      selectedCategory.image;

                    return (
                      <TouchableOpacity
                        key={product._id}
                        style={{ width: getProductCardWidth(), marginBottom: 32 }}
                        onPress={() => router.push(`/product/${product._id}`)}
                        activeOpacity={0.9}
                        className="hover:-translate-y-1 transition-transform cursor-pointer group"
                      >
                        <View className="overflow-hidden rounded-xl mb-3">
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-full h-64 bg-neutral-100 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </View>
                        <Text
                          className="text-neutral-500 text-sm font-semibold"
                          numberOfLines={1}
                        >
                          {product.brand || "Brand"}
                        </Text>
                        <Text
                          className="text-neutral-900 text-base font-medium mt-0.5 leading-5"
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-neutral-900 font-bold text-base">
                            ₹{product.price}
                          </Text>
                          <Text className="text-[#ce4067] text-sm font-bold ml-2">
                            {product.discount || "50% OFF"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View className="w-full py-16 items-center justify-center">
                    <Ionicons name="shirt-outline" size={48} color="#e5e5e5" />
                    <Text className="text-neutral-400 font-medium mt-4 text-lg">
                      More styles coming soon...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between px-4 pt-6">
              {filteredCategories.map((category, index) => (
                <View 
                  key={index} 
                  style={{ width: getCategoryCardWidth(), marginBottom: 40 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setSelectedCategory(category)}
                    className="group cursor-pointer"
                  >
                    <View className="overflow-hidden rounded-2xl">
                      <Image
                        source={{ uri: category.image }}
                        className="w-full h-56 object-cover bg-neutral-100 group-hover:scale-105 transition-transform duration-300"
                      />
                    </View>
                  </TouchableOpacity>

                  <Text className="text-2xl font-bold text-neutral-900 mt-4 px-1">
                    {category.name}
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                  >
                    {category.subCategories.map(
                      (sub: string, subIndex: number) => (
                        <View
                          key={subIndex}
                          className="bg-neutral-50 border border-neutral-100 px-4 py-2 rounded-full mr-2"
                        >
                          <Text className="font-semibold text-neutral-600 text-sm">
                            {sub}
                          </Text>
                        </View>
                      )
                    )}
                    <View className="w-2" />
                  </ScrollView>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}