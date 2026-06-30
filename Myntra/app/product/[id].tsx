import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "../context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "../constants/api";

interface Product {
  _id: string;
  brand: string;
  name: string;
  price: number | string;
  description: string;
  images?: string[];
  image?: string;
  discount?: string;
}

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { products, wishlistIds, setWishlistIds } = useGlobalContext();
  const { width } = useWindowDimensions();
  const isLargeScreen: boolean = width >= 768;
  const scrollRef = useRef<ScrollView>(null);

  const maxContentWidth: number = 1152;
  const availableWidth: number = Math.min(width, maxContentWidth);
  const desktopImageWidth: number = (availableWidth - 80) / 2;
  const currentImageWidth: number = isLargeScreen ? desktopImageWidth : width;
  const currentImageHeight: number = isLargeScreen ? 650 : 450;

  const product: Product = products?.find((p: Product) => p._id === id) || {
    _id: id as string,
    brand: "Loading...",
    name: "Fetching product details",
    price: "0",
    description: "",
    images: ["https://via.placeholder.com/600"],
  };

  const productImages: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ["https://via.placeholder.com/600"];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const sizes: string[] = ["S", "M", "L", "XL", "XXL"];
  const [isAddingToBag, setIsAddingToBag] = useState<boolean>(false);

  const isWishlisted: boolean = wishlistIds?.includes(product._id);

  const showMessage = (title: string, message: string): void => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleScroll = (event: any): void => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const scrollToNext = (): void => {
    if (activeImageIndex < productImages.length - 1) {
      const nextIndex = activeImageIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * currentImageWidth,
        animated: true,
      });
      setActiveImageIndex(nextIndex);
    }
  };

  const scrollToPrev = (): void => {
    if (activeImageIndex > 0) {
      const prevIndex = activeImageIndex - 1;
      scrollRef.current?.scrollTo({
        x: prevIndex * currentImageWidth,
        animated: true,
      });
      setActiveImageIndex(prevIndex);
    }
  };

  const handleWishlistToggle = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showMessage("Login Required", "Please login to manage your wishlist.");
        return;
      }

      if (isWishlisted) {
        setWishlistIds((prev: string[]) =>
          prev.filter((wishId) => wishId !== product._id)
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
          }
        );
      }
    } catch (error) {
      showMessage("Error", "Could not update wishlist.");
    }
  };

  const addToBag = async (): Promise<void> => {
    try {
      setIsAddingToBag(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showMessage("Login Required", "Please login to add items to your bag.");
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

      showMessage("Success", "Added to your bag!");
    } catch (error) {
      showMessage("Error", "Could not add item to bag.");
    } finally {
      setIsAddingToBag(false);
    }
  };

  const ActionButtons = () => (
    <View
      className={
        isLargeScreen
          ? "flex-row justify-between items-center mt-10"
          : "absolute bottom-0 w-full bg-white border-t border-neutral-100 p-4 flex-row justify-between items-center pb-8 shadow-2xl z-50"
      }
    >
      <TouchableOpacity
        onPress={handleWishlistToggle}
        className={`w-[15%] items-center justify-center border-[1.5px] h-14 rounded-xl cursor-pointer transition-colors ${
          isWishlisted
            ? "border-[#f43365] bg-pink-50"
            : "border-neutral-200 hover:bg-neutral-50"
        }`}
      >
        <Ionicons
          name={isWishlisted ? "heart" : "heart-outline"}
          size={26}
          color={isWishlisted ? "#f43365" : "#404040"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="w-[80%] bg-[#f43365] h-14 rounded-xl flex-row items-center justify-center shadow-md shadow-pink-200 hover:opacity-90 transition-opacity cursor-pointer"
        onPress={addToBag}
        disabled={isAddingToBag}
      >
        {isAddingToBag ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="bag-handle-outline" size={22} color="#fff" />
            <Text className="text-white font-bold text-base ml-2 tracking-widest">
              ADD TO BAG
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View
        className={`absolute z-20 ${
          isLargeScreen ? "top-8 left-8" : "top-12 left-4"
        }`}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2.5 bg-white/90 rounded-full shadow-sm backdrop-blur-md cursor-pointer hover:bg-white transition-colors border border-neutral-100"
        >
          <Ionicons name="arrow-back" size={22} color="#171717" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={!isLargeScreen ? { paddingBottom: 100 } : {}}
        bounces={false}
      >
        <View
          className={`w-full max-w-6xl mx-auto ${
            isLargeScreen ? "flex-row p-6 gap-10 pt-24" : "flex-col"
          }`}
        >
          <View style={{ width: isLargeScreen ? "50%" : "100%" }}>
            <View
              style={{ height: currentImageHeight }}
              className={`relative w-full bg-neutral-50 overflow-hidden ${
                isLargeScreen ? "rounded-2xl shadow-sm border border-neutral-100" : ""
              }`}
            >
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={{ flex: 1 }}
              >
                {productImages.map((img: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={{
                      width: currentImageWidth,
                      height: currentImageHeight,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {activeImageIndex > 0 && (
                <TouchableOpacity
                  onPress={scrollToPrev}
                  className="absolute left-4 top-1/2 -mt-6 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-md cursor-pointer hover:bg-white transition-colors"
                >
                  <Ionicons name="chevron-back" size={24} color="#171717" />
                </TouchableOpacity>
              )}

              {activeImageIndex < productImages.length - 1 && (
                <TouchableOpacity
                  onPress={scrollToNext}
                  className="absolute right-4 top-1/2 -mt-6 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-md cursor-pointer hover:bg-white transition-colors"
                >
                  <Ionicons name="chevron-forward" size={24} color="#171717" />
                </TouchableOpacity>
              )}

              <View className="absolute bottom-6 w-full flex-row justify-center gap-2.5">
                {productImages.map((_: any, i: number) => (
                  <View
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                      activeImageIndex === i
                        ? "w-6 bg-[#ff3f6c]"
                        : "w-2 bg-white/80"
                    }`}
                  />
                ))}
              </View>
            </View>
          </View>

          <View
            style={{ width: isLargeScreen ? "50%" : "100%" }}
            className={isLargeScreen ? "px-2" : "p-5"}
          >
            <Text
              className={`${
                isLargeScreen ? "text-4xl" : "text-2xl"
              } font-bold text-neutral-900 tracking-tight`}
            >
              {product.brand}
            </Text>
            <Text className="text-lg text-neutral-500 mt-1.5 font-medium">
              {product.name}
            </Text>

            <View className="flex-row items-center mt-5">
              <Text className="text-3xl font-bold text-neutral-900">
                ₹{product.price}
              </Text>
              {product.discount && (
                <Text className="text-[#f43365] font-bold ml-4 bg-pink-50 px-2.5 py-1 rounded-md text-sm">
                  {product.discount}
                </Text>
              )}
            </View>
            <Text className="text-sm text-neutral-400 mt-1.5 font-medium">
              inclusive of all taxes
            </Text>

            <View className="mt-8 border-t border-neutral-100 pt-7">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg font-bold text-neutral-800">
                  Select Size
                </Text>
                <TouchableOpacity className="cursor-pointer">
                  <Text className="text-[#f43365] font-bold text-sm tracking-wide hover:underline">
                    SIZE CHART
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-3.5">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-full items-center justify-center border-[1.5px] cursor-pointer transition-colors ${
                        isSelected
                          ? "border-[#f43365] bg-[#f43365]"
                          : "border-neutral-200 bg-white hover:border-neutral-400"
                      }`}
                    >
                      <Text
                        className={`font-bold text-base ${
                          isSelected ? "text-white" : "text-neutral-700"
                        }`}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mt-8 border-t border-neutral-100 pt-7">
              <Text className="text-lg font-bold text-neutral-800 mb-3">
                Product Details
              </Text>
              <Text className="text-neutral-600 leading-relaxed text-base font-medium">
                {product.description}
              </Text>
            </View>

            {isLargeScreen && <ActionButtons />}
          </View>
        </View>
      </ScrollView>

      {!isLargeScreen && <ActionButtons />}
    </View>
  );
}