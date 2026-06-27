import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface Props {
  product: any;
}

export default function ProductCard({ product }: Props) {
  return (
    <TouchableOpacity className="w-[48%] mb-4 bg-white rounded-lg overflow-hidden border border-neutral-100">
      <Image source={{ uri: product.image }} className="w-full h-48 object-cover" />
      <View className="p-3">
        <Text className="text-neutral-500 text-xs font-bold mb-1">{product.brand}</Text>
        <Text className="text-neutral-800 text-sm font-medium mb-1" numberOfLines={1}>
          {product.name}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-neutral-900 font-bold mr-2">{product.price}</Text>
          <Text className="text-[#ff3f6c] text-xs font-bold">{product.discount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}