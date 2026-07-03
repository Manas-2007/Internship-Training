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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalContext";
// 👉 Import ThemeContext
import { useTheme } from "../context/ThemeContext";

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
  const insets = useSafeAreaInsets();

  // 👉 Extract colors and isDark
  const { colors, isDark } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { width } = useWindowDimensions();
  // Using 768 as the breakpoint to perfectly match your TabLayout's Navbar logic
  const isLargeScreen = width >= 768; 
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const getCategoryCardWidth = () => {
    if (isDesktop) return "31%"; // 3 per row
    if (isTablet) return "48%";  // 2 per row
    return "100%";               // 1 per row
  };

  const getProductCardWidth = () => {
    if (isDesktop) return "23.5%"; // 4 per row
    if (isTablet) return "31%";    // 3 per row
    return "48%";                  // 2 per row
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="w-full max-w-[1400px] mx-auto flex-1">
        
        {/* Title Header: Hidden securely via JS when Top Navbar is present */}
        {!isLargeScreen && (
          <View 
            className="px-5 py-4 flex-row items-center border-b z-10"
            style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
          >
            <Ionicons name="grid" size={26} color={colors.primary} />
            <Text className="text-2xl font-bold tracking-tight ml-3" style={{ color: colors.textMain }}>
              Categories
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View 
          className={`px-4 lg:px-12 border-b ${isLargeScreen ? 'pt-4 pb-4' : 'py-3'}`}
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
        >
          <View 
            className="flex-row items-center px-4 py-3 rounded-xl border transition-colors"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#f5f5f5',
              borderColor: isDark ? '#334155' : 'transparent' 
            }}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              placeholder="Search for categories..."
              className="flex-1 ml-3 text-sm md:text-base outline-none"
              style={{ color: colors.textMain }}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSelectedCategory(null);
              }}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={true}
          className="flex-1"
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingBottom: isLargeScreen ? 60 : insets.bottom + 350 
          }}
        >
          {selectedCategory ? (
            /* --- CATEGORY DETAIL VIEW (Products) --- */
            <View className="pt-4 lg:pt-6">
              <TouchableOpacity
                className="flex-row items-center px-4 lg:px-12 mb-3 hover:opacity-70 transition-opacity cursor-pointer w-40"
                onPress={() => setSelectedCategory(null)}
              >
                <Ionicons name="arrow-back" size={18} color={colors.primary} />
                <Text className="font-semibold text-sm md:text-base ml-1.5" style={{ color: colors.primary }}>
                  Back
                </Text>
              </TouchableOpacity>

              {/* Reduced font weight from black to bold, responsive sizes */}
              <Text className="text-xl md:text-2xl font-bold px-4 lg:px-12 mb-3 mt-1 tracking-tight" style={{ color: colors.textMain }}>
                {selectedCategory.name}
              </Text>

              {/* Subcategories Scroll */}
              <View className="mb-8">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="px-4 lg:px-12"
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
                          className="px-4 py-2 rounded-full mr-2 border flex-row items-center justify-center transition-colors cursor-pointer shadow-sm"
                          style={{
                            backgroundColor: isActive ? colors.primary : colors.surface,
                            borderColor: isActive ? colors.primary : colors.border
                          }}
                        >
                          <Text
                            numberOfLines={1}
                            className="font-semibold text-sm md:text-base tracking-wide"
                            style={{ color: isActive ? '#ffffff' : colors.textMain }}
                          >
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                  <View className="w-12 lg:w-24" />
                </ScrollView>
              </View>

              {/* Products Grid */}
              <View className="flex-row flex-wrap justify-start gap-[2%] px-4 lg:px-12">
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
                        <View 
                          className="overflow-hidden rounded-2xl mb-3 border"
                          style={{ borderColor: colors.border }}
                        >
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-full h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ backgroundColor: colors.background }}
                          />
                        </View>
                        <Text
                          className="text-[10px] md:text-xs font-semibold tracking-widest uppercase mb-1"
                          style={{ color: colors.textMuted }}
                          numberOfLines={1}
                        >
                          {product.brand || "Brand"}
                        </Text>
                        <Text
                          className="text-sm md:text-base font-semibold mt-0.5 leading-5"
                          style={{ color: colors.textMain }}
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>
                        <View className="flex-row items-center mt-1.5">
                          <Text className="font-bold text-base md:text-lg" style={{ color: colors.textMain }}>
                            ₹{product.price}
                          </Text>
                          <Text className="text-xs md:text-sm font-semibold ml-2" style={{ color: colors.primary }}>
                            {product.discount || "50% OFF"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View className="w-full py-16 items-center justify-center">
                    <Ionicons name="shirt-outline" size={48} color={colors.textMuted} />
                    <Text className="font-medium mt-4 text-base md:text-lg" style={{ color: colors.textMuted }}>
                      More styles coming soon...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            /* --- MAIN CATEGORIES OVERVIEW --- */
            <View className="flex-row flex-wrap justify-start gap-[3%] px-4 lg:px-12 pt-4 lg:pt-5">
              {filteredCategories.map((category, index) => (
                <View 
                  key={index} 
                  style={{ width: getCategoryCardWidth(), marginBottom: isLargeScreen ? 36 : 1 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setSelectedCategory(category)}
                    className="group cursor-pointer"
                  >
                    <View 
                      className="overflow-hidden rounded-2xl shadow-sm border"
                      style={{ borderColor: colors.border }}
                    >
                      <Image
                        source={{ uri: category.image }}
                        className="w-full h-48 md:h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundColor: colors.background }}
                      />
                    </View>
                  </TouchableOpacity>

                  <Text className="text-lg md:text-xl font-bold mt-4 md:mt-5 px-1 tracking-tight" style={{ color: colors.textMain }}>
                    {category.name}
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-2.5 md:mt-3"
                  >
                    {category.subCategories.map(
                      (sub: string, subIndex: number) => (
                        <View
                          key={subIndex}
                          className="transition-colors border px-3 md:px-4 py-1.5 md:py-2 rounded-full mr-2 cursor-pointer"
                          style={{ 
                            backgroundColor: isDark ? '#1e293b' : '#f9fafb',
                            borderColor: colors.border
                          }}
                        >
                          <Text className="font-medium text-[10px] md:text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>
                            {sub}
                          </Text>
                        </View>
                      )
                    )}
                    <View className="w-6" />
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