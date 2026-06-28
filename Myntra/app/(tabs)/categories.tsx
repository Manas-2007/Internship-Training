import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

// Components (Make sure paths match your folder structure)
import SearchBar from "../../components/Category Tab/SearchBar";
import CategoryCard from "../../components/Category Tab/CategoryCard";
import SubcategoryPills from "../../components/Category Tab/SubcategoryPills";
import ProductCard from "../../components/Category Tab/ProductCard";

// 🚀 PREMIUM PEXELS DATA
const categoriesData = [
  {
    _id: "cat_1",
    name: "Men",
    image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
    subCategories: ["T-Shirts", "Shirts", "Jeans"],
  },
  {
    _id: "cat_2",
    name: "Women",
    image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
    subCategories: ["Dresses", "Tops", "Ethnic"],
  },
  {
    _id: "cat_3",
    name: "Footwear",
    image: "https://images.pexels.com/photos/19090/pexels-photo.jpg",
    subCategories: ["Sneakers", "Formal", "Sandals"],
  },
  {
    _id: "cat_4",
    name: "Accessories",
    image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg",
    subCategories: ["Watches", "Belts", "Jewellery"],
  },
  {
    _id: "cat_5",
    name: "Beauty",
    image: "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg",
    subCategories: ["Makeup", "Skin Care", "Fragrance"],
  },
  {
    _id: "cat_6",
    name: "Kids",
    image: "https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg",
    subCategories: ["Sets", "Shoes", "T-Shirts"],
  },
];

const productsData = [
  { _id: "prod_1", categoryId: "cat_1", name: "Premium T-Shirt", brand: "Roadster", price: "599", discount: "40% OFF", image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" },
  { _id: "prod_2", categoryId: "cat_2", name: "Floral Summer Dress", brand: "H&M", price: "1299", discount: "20% OFF", image: "https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg" },
  { _id: "prod_3", categoryId: "cat_3", name: "Classic Sneakers", brand: "Nike", price: "2999", discount: "15% OFF", image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg" },
  { _id: "prod_4", categoryId: "cat_4", name: "Luxury Watch", brand: "Titan", price: "1499", discount: "50% OFF", image: "https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg" },
  { _id: "prod_5", categoryId: "cat_5", name: "Matte Lipstick", brand: "Lakme", price: "450", discount: "10% OFF", image: "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg" },
  { _id: "prod_6", categoryId: "cat_6", name: "Cartoon T-Shirt", brand: "Allen Solly", price: "399", discount: "30% OFF", image: "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg" },
];

export default function Categories() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Jab Home screen se kisi category par click hokar aaye
  useEffect(() => {
    if (params.categoryName) {
      const found = categoriesData.find((c) => c.name === params.categoryName);
      if (found) {
        setSelectedCategory(found);
        setSelectedSubCategory(found.subCategories[0]); 
      }
    }
  }, [params.categoryName]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-4 py-3 bg-white">
        <Text className="text-2xl font-black text-neutral-800">Categories</Text>
      </View>

      <SearchBar />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {selectedCategory ? (
          
          /* --- DETAIL VIEW (Subcategories & Products List) --- */
          <View className="pb-20">
            <TouchableOpacity
              className="flex-row items-center mb-4 px-4"
              onPress={() => {
                setSelectedCategory(null);
                setSelectedSubCategory(null);
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#ff3f6c" />
              <Text className="text-[#ff3f6c] font-bold text-base ml-1">
                Back to Categories
              </Text>
            </TouchableOpacity>

            <Text className="text-3xl font-black text-neutral-800 mb-4 px-4">
              {selectedCategory.name}
            </Text>

            <SubcategoryPills
              subCategories={selectedCategory.subCategories}
              selectedSubCategory={selectedSubCategory}
              onSelect={(sub: string) => setSelectedSubCategory(sub)}
            />

            <View className="flex-row flex-wrap justify-between px-4">
              {productsData
                .filter((p) => p.categoryId === selectedCategory._id)
                .map((product) => (
                  <TouchableOpacity
                    key={product._id}
                    onPress={() => router.push(`/product/${product._id}`)}
                    activeOpacity={0.8}
                  >
                    <ProductCard product={product} />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
          
        ) : (
          
          /* --- MAIN LIST VIEW (All Categories) --- */
          <View className="pb-20">
            {categoriesData.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onSelectCategory={(cat: any) => {
                  setSelectedCategory(cat);
                  setSelectedSubCategory(cat.subCategories[0]); // Auto-selects the first subcategory
                }}
              />
            ))}
          </View>
          
        )}
      </ScrollView>
    </SafeAreaView>
  );
}