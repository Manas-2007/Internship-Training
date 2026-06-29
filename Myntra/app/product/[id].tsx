import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "../context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "../constants/api";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { products, wishlistIds, setWishlistIds } = useGlobalContext();

  const product = products?.find((p: any) => p._id === id) || {
    _id: id,
    brand: "Loading...",
    name: "Fetching product details",
    price: "0",
    description: "",
    images: ["https://via.placeholder.com/400"],
  };

  const productImages =
    product.images || (product.image ? [product.image] : []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const sizes = ["S", "M", "L", "XL", "XXL"];
  const [isAddingToBag, setIsAddingToBag] = useState(false);

  const isWishlisted = wishlistIds?.includes(product._id);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const handleWishlistToggle = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Login Required", "Please login to manage your wishlist.");
        return;
      }

      if (isWishlisted) {
        setWishlistIds((prev: string[]) =>
          prev.filter((wishId) => wishId !== product._id),
        );

        await axios.delete(`${API_URL}/api/wishlist/product/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        setWishlistIds((prev: string[]) => [...prev, product._id]);

        await axios.post(
          `${API_URL}/api/wishlist`,
          { productId: product._id },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (error) {
      console.log("Wishlist Toggle Error:", error);
      Alert.alert("Error", "Could not update wishlist.");
    }
  };

  const addToBag = async () => {
    try {
      setIsAddingToBag(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Login Required", "Please login to add items to your bag.");
        setIsAddingToBag(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken?.id || decodedToken?._id;

      await axios.post(`${API_URL}/api/bag`, {
        userId: userId,
        productId: product._id,
        size: selectedSize,
        quantity: 1,
      });

      Alert.alert("Success", "Added to your bag!");
    } catch (error) {
      console.log("Add to Bag error:", error);
      Alert.alert("Error", "Could not add item to bag.");
    } finally {
      setIsAddingToBag(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View className="absolute top-12 left-4 z-20">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2.5 bg-white/90 rounded-full shadow-md backdrop-blur-md"
        >
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        bounces={false}
      >
        <View className="relative w-full h-[400px] bg-neutral-100">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {productImages.map((img: string, index: number) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width, height: 400 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View className="absolute bottom-4 w-full flex-row justify-center gap-2">
            {productImages.map((_: any, i: number) => (
              <View
                key={i}
                className={`h-2 rounded-full ${activeImageIndex === i ? "w-5 bg-[#ff3f6c]" : "w-2 bg-white/70"}`}
              />
            ))}
          </View>
        </View>

        <View className="p-5">
          <Text className="text-2xl font-black text-neutral-900 tracking-tight">
            {product.brand}
          </Text>
          <Text className="text-base text-neutral-500 mt-1 font-medium">
            {product.name}
          </Text>

          <View className="flex-row items-center mt-4">
            <Text className="text-2xl font-bold text-neutral-900">
              ₹{product.price}
            </Text>
            {product.discount && (
              <Text className="text-[#f43365] font-bold ml-3 bg-pink-50 px-2 py-1 rounded text-sm">
                {product.discount}
              </Text>
            )}
          </View>
          <Text className="text-xs text-neutral-400 mt-1 font-medium">
            inclusive of all taxes
          </Text>

          <View className="mt-6 border-t border-neutral-100 pt-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-bold text-neutral-800">
                Select Size
              </Text>
              <Text className="text-[#f43365] font-bold text-sm tracking-wide">
                SIZE CHART
              </Text>
            </View>
            <View className="flex-row gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full items-center justify-center border-[1.5px] ${isSelected ? "border-[#f43365] bg-[#f43365]" : "border-neutral-200 bg-white"}`}
                  >
                    <Text
                      className={`font-bold text-base ${isSelected ? "text-white" : "text-neutral-700"}`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mt-8 mb-24 border-t border-neutral-100 pt-5">
            <Text className="text-base font-bold text-neutral-800 mb-2">
              Product Details
            </Text>
            <Text className="text-neutral-600 leading-6 text-sm font-medium">
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white border-t border-neutral-100 p-4 flex-row justify-between items-center pb-8 shadow-2xl">
        <TouchableOpacity
          onPress={handleWishlistToggle}
          className={`w-[15%] items-center justify-center border-[1.5px] h-14 rounded-xl ${isWishlisted ? "border-[#f43365] bg-pink-50" : "border-neutral-200"}`}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={26}
            color={isWishlisted ? "#f43365" : "#404040"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-[80%] bg-[#f43365] h-14 rounded-xl flex-row items-center justify-center shadow-md shadow-pink-200"
          onPress={addToBag}
          disabled={isAddingToBag}
        >
          {isAddingToBag ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="bag-handle-outline" size={22} color="#fff" />
              <Text className="text-white font-black text-base ml-2 tracking-widest">
                ADD TO BAG
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
