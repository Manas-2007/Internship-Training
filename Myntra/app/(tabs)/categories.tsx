import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

// 🚀 REAL Database products use karne ke liye context import kiya
import { useGlobalContext } from "../context/GlobalContext"; 

// PREMIUM PEXELS CATEGORIES (Exactly matching your UI flow)
const categoriesData = [
  { name: "Men", image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg", subCategories: ["T-Shirts", "Shirts", "Jeans", "Trousers"] },
  { name: "Women", image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg", subCategories: ["Dresses", "Tops", "Ethnic Wear", "Western"] },
  { name: "Footwear", image: "https://images.pexels.com/photos/19090/pexels-photo.jpg", subCategories: ["Sneakers", "Formal", "Sandals", "Heels"] },
  { name: "Accessories", image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg", subCategories: ["Watches", "Belts", "Jewellery", "Bags"] },
  { name: "Beauty", image: "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg", subCategories: ["Makeup", "Skin Care", "Fragrance", "Hair"] },
  { name: "Kids", image: "https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg", subCategories: ["Sets", "Shoes", "T-Shirts", "Toys"] },
];

export default function Categories() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  const { products } = useGlobalContext();
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // 🔥 MASTER LOCK: Isse infinite loop kabhi nahi banega
  const isInitialized = useRef(false);

  useEffect(() => {
    // Sirf tabhi run karo jab params ho aur pehle run NA hua ho
    if (params.categoryName && !isInitialized.current) {
      const found = categoriesData.find((c) => c.name === params.categoryName);
      if (found) {
        setSelectedCategory(found);
        setSelectedSubCategory(found.subCategories[0]); 
        isInitialized.current = true; // Lock lag gaya
      }
    }
  }, [params.categoryName]);

  const getDisplayProducts = () => {
    if (!products || products.length === 0) return [];

    const isFirstSubcategory = selectedSubCategory === selectedCategory?.subCategories[0];
    
    // Agar user ne subcategory change kardi hai, toh kuch mat dikhao
    if (!isFirstSubcategory) return [];

    // Sirf 1 product nikalna database se
    const matched = products.filter((p: any) => {
      const catName = selectedCategory?.name?.toLowerCase();
      return p.name?.toLowerCase().includes(catName) || 
             p.brand?.toLowerCase().includes(catName) || 
             p.description?.toLowerCase().includes(catName) ||
             p.category?.toLowerCase() === catName;
    });

    const baseList = matched.length > 0 ? matched : products;
    return baseList.slice(0, 1);
  };

  const visibleProducts = selectedCategory ? getDisplayProducts() : [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      
      {/* GLOBAL HEADER */}
      <View className="px-4 py-3 bg-white">
        <Text className="text-3xl font-black text-neutral-900 tracking-tight">Categories</Text>
      </View>

      {/* SEARCH BAR */}
      <View className="px-4 pb-4 bg-white border-b border-neutral-100">
        <View className="flex-row items-center bg-[#f5f5f5] px-4 py-3 rounded-xl">
          <Ionicons name="search" size={20} color="#a3a3a3" />
          <TextInput 
            placeholder="Search for products, brands and..." 
            className="flex-1 ml-2 text-neutral-800 text-base"
            placeholderTextColor="#a3a3a3"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white">
        {selectedCategory ? (
          
          <View className="pb-24">
            
            {/* Back to Categories */}
            <TouchableOpacity
              className="flex-row items-center px-4 mt-4 mb-2"
              onPress={() => {
                setSelectedCategory(null);
                setSelectedSubCategory(null);
              }}
            >
              <Ionicons name="arrow-back" size={18} color="#ce4067" />
              <Text className="text-[#ce4067] font-bold text-base ml-1">Back to Categories</Text>
            </TouchableOpacity>

            {/* Category Name */}
            <Text className="text-4xl font-black text-neutral-900 px-4 mb-4 mt-1">
              {selectedCategory.name}
            </Text>

            {/* Subcategory Pills */}
            <View className="mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                {selectedCategory.subCategories.map((sub: string, index: number) => {
                  const isActive = sub === selectedSubCategory;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedSubCategory(sub)}
                      className={`px-5 py-2.5 rounded-full mr-3 ${
                        isActive ? "bg-white border border-neutral-200 shadow-sm" : "bg-[#f5f5f5]"
                      }`}
                    >
                      <Text className={`font-bold text-sm ${isActive ? "text-neutral-900" : "text-neutral-600"}`}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <View className="w-4" /> 
              </ScrollView>
            </View>

            {/* EXACT 1 PRODUCT SHOWCASE */}
            <View className="flex-row flex-wrap justify-between px-4">
              {visibleProducts.map((product: any) => {
                const imageUrl = product.images?.[0] || product.image || "https://via.placeholder.com/150";

                return (
                  <TouchableOpacity
                    key={product._id}
                    className="w-[48%] mb-6"
                    onPress={() => router.push(`/product/${product._id}`)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: imageUrl }} className="w-full h-56 rounded-xl bg-neutral-100 mb-3 object-cover" />
                    <Text className="text-neutral-500 text-sm font-semibold">{product.brand || "Brand Name"}</Text>
                    <Text className="text-neutral-900 text-base font-medium mt-0.5 leading-5">{product.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-neutral-900 font-bold text-base">₹{product.price}</Text>
                      <Text className="text-[#ce4067] text-sm font-bold ml-2">{product.discount || "40% OFF"}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

          </View>
          
        ) : (
          
          <View className="pb-24 pt-4">
            {categoriesData.map((category, index) => (
              <View key={index} className="mb-8">
                <TouchableOpacity 
                  className="px-4"
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedCategory(category);
                    setSelectedSubCategory(category.subCategories[0]);
                  }}
                >
                  <Image source={{ uri: category.image }} className="w-full h-44 rounded-xl object-cover bg-neutral-100" />
                </TouchableOpacity>

                <Text className="text-3xl font-black text-neutral-900 px-4 mt-4">
                  {category.name}
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-3">
                  {category.subCategories.map((sub: string, subIndex: number) => (
                    <TouchableOpacity
                      key={subIndex}
                      onPress={() => {
                        setSelectedCategory(category);
                        setSelectedSubCategory(sub);
                      }}
                      className="bg-[#f5f5f5] px-5 py-2.5 rounded-full mr-3"
                    >
                      <Text className="font-semibold text-neutral-700 text-sm">{sub}</Text>
                    </TouchableOpacity>
                  ))}
                  <View className="w-4" /> 
                </ScrollView>
              </View>
            ))}
          </View>
          
        )}
      </ScrollView>
    </SafeAreaView>
  );
}