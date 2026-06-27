import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Tumhare naye 4 components
import SearchBar from "../../components/Category Tab/SearchBar";
import CategoryCard from "../../components/Category Tab/CategoryCard";
import SubcategoryPills from "../../components/Category Tab/SubcategoryPills";
import ProductCard from "../../components/Category Tab/ProductCard";

// --- MOCK DATA ---
const categoriesData = [
  {
    id: 1,
    name: "Men",
    bannerImage: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop",
    subCategories: ["T-Shirts", "Shirts", "Jeans", "Trousers"],
  },
  {
    id: 2,
    name: "Women",
    bannerImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop",
    subCategories: ["Dresses", "Tops", "Ethnic Wear", "Western Wear"],
  },
  {
    id: 3,
    name: "Kids",
    bannerImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop",
    subCategories: ["Sets", "Shoes", "T-Shirts", "Dresses"],
  },
  {
    id: 4,
    name: "Beauty",
    bannerImage: "https://images.unsplash.com/photo-1522335789103-8017255a7070?w=800&auto=format&fit=crop",
    subCategories: ["Makeup", "Skin Care", "Fragrance", "Hair Care"],
  },
  {
    id: 5,
    name: "Footwear",
    bannerImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop",
    subCategories: ["Sneakers", "Formal", "Sandals", "Boots"],
  },
  {
    id: 6,
    name: "Accessories",
    bannerImage: "https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?w=800&auto=format&fit=crop",
    subCategories: ["Watches", "Belts", "Jewellery", "Bags"],
  },
  {
    id: 7,
    name: "Home",
    bannerImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop",
    subCategories: ["Bedding", "Decor", "Kitchen", "Furniture"],
  },
];

const productsData = [
  {
    id: 1,
    categoryId: 1, // Belongs to Men
    name: "Casual White T-Shirt",
    brand: "Roadster",
    price: "₹499",
    discount: "60% OFF",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    categoryId: 1, // Belongs to Men
    name: "Denim Jacket",
    brand: "Levis",
    price: "₹2499",
    discount: "40% OFF",
    image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
  },
];
// -----------------

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-4 py-3 bg-white">
        <Text className="text-2xl font-black text-neutral-800">Categories</Text>
      </View>

      <SearchBar />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {selectedCategory ? (
          
          /* --- STATE 2: DETAIL VIEW --- */
          <View className="pb-20">
            {/* Back Button */}
            <TouchableOpacity
              className="flex-row items-center mb-4 px-4"
              onPress={() => {
                setSelectedCategory(null);
                setSelectedSubCategory(null);
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#ff3f6c" />
              <Text className="text-[#ff3f6c] font-bold text-base ml-1">Back to Categories</Text>
            </TouchableOpacity>

            <Text className="text-3xl font-black text-neutral-800 mb-4 px-4">
              {selectedCategory.name}
            </Text>

            {/* Smart Component for Pills */}
            <SubcategoryPills
              subCategories={selectedCategory.subCategories}
              selectedSubCategory={selectedSubCategory}
              onSelect={(sub) => setSelectedSubCategory(sub)}
            />

            {/* Grid calling ProductCard Component */}
            <View className="flex-row flex-wrap justify-between px-4">
              {productsData
                .filter((p) => p.categoryId === selectedCategory.id)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </View>
          </View>

        ) : (
          
          /* --- STATE 1: MAIN LIST VIEW --- */
          <View className="pb-20">
            {categoriesData.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
              />
            ))}
          </View>

        )}
      </ScrollView>
    </SafeAreaView>
  );
}