import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/context/ThemeContext";

interface Product {
  _id: string;
  brand?: string;
  name?: string;
  price?: number;
  images?: string[];
  image?: string;
}

interface BagItem {
  _id: string;
  productId: Product;
  size?: string;
  localQuantity: number;
}

interface ActiveBagSectionProps {
  activeItems: BagItem[];
  isDesktop: boolean;
  router: any;
  removeBagItem: (itemId: string) => void;
  updateQuantity: (itemId: string, type: "inc" | "dec") => void;
  toggleItemStatus: (itemId: string) => void;
}

export default function ActiveBagSection({
  activeItems,
  isDesktop,
  router,
  removeBagItem,
  updateQuantity,
  toggleItemStatus,
}: ActiveBagSectionProps) {
  const { colors, isDark } = useTheme();

  if (activeItems.length === 0) return null;

  return (
    <View>
      <Text className="font-bold text-base uppercase tracking-widest mb-4 mt-2" style={{ color: colors.textMain }}>
        Active Bag ({activeItems.length})
      </Text>

      {activeItems.map((item) => {
        const product = item.productId || ({} as Product);
        const imageUrl = product.images?.[0] || product.image || "https://via.placeholder.com/150";

        return (
          <View
            key={item._id}
            className={`flex-row p-4 md:p-5 rounded-2xl border mb-4 md:mb-5 shadow-sm transition-all ${
              isDesktop ? "hover:shadow-md" : ""
            }`}
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <View className="relative">
              <TouchableOpacity
                onPress={() => router.push(`/product/${product._id}`)}
                className="cursor-pointer"
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: imageUrl }}
                  className="w-[100px] h-[130px] md:w-[120px] md:h-[160px] rounded-xl object-cover border"
                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeBagItem(item._id)}
                className="absolute -top-2.5 -right-2.5 p-1.5 rounded-full shadow-sm border z-10 transition-colors"
                style={{
                  backgroundColor: isDark ? 'rgba(38,38,38,0.95)' : 'rgba(255,255,255,0.95)',
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="close" size={16} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <View className="flex-1 ml-5 md:ml-6 justify-between py-1">
              <View>
                <Text className="text-[10px] md:text-xs font-bold mb-1.5 tracking-widest uppercase" numberOfLines={1} style={{ color: colors.textMuted }}>
                  {product.brand || "Brand"}
                </Text>
                <Text
                  className="text-sm md:text-base font-semibold mb-2 leading-5"
                  numberOfLines={2}
                  style={{ color: colors.textMain }}
                >
                  {product.name || "Product Name"}
                </Text>
                <Text className="text-xs md:text-sm font-medium mb-2.5" style={{ color: colors.textMuted }}>
                  Size: <Text className="font-bold" style={{ color: colors.textMain }}>{item.size || "M"}</Text>
                </Text>
                <Text className="font-bold text-lg md:text-xl tracking-tight" style={{ color: colors.textMain }}>
                  ₹{product.price || 0}
                </Text>
              </View>

              <View className="flex-row items-center justify-between mt-3">
                <View
                  className="flex-row items-center rounded-lg border overflow-hidden"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <TouchableOpacity
                    onPress={() => updateQuantity(item._id, "dec")}
                    className="w-8 h-8 md:w-10 md:h-10 items-center justify-center transition-colors"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}
                  >
                    <Ionicons name="remove" size={16} color={colors.textMain} />
                  </TouchableOpacity>

                  <Text className="font-bold text-sm md:text-base w-8 md:w-10 text-center" style={{ color: colors.textMain }}>
                    {item.localQuantity}
                  </Text>

                  <TouchableOpacity
                    onPress={() => updateQuantity(item._id, "inc")}
                    className="w-8 h-8 md:w-10 md:h-10 items-center justify-center transition-colors"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}
                  >
                    <Ionicons name="add" size={16} color={colors.textMain} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => toggleItemStatus(item._id)}
                  className="px-3 py-1.5 rounded-lg border border-dashed"
                  style={{ borderColor: colors.border }}
                >
                  <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.textMuted }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}