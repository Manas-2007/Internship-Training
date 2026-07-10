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
}

interface SavedLaterSectionProps {
  savedItems: BagItem[];
  isDesktop: boolean;
  router: any;
  removeBagItem: (itemId: string) => void;
  toggleItemStatus: (itemId: string) => void;
}

export default function SavedLaterSection({
  savedItems,
  isDesktop,
  router,
  removeBagItem,
  toggleItemStatus,
}: SavedLaterSectionProps) {
  const { colors, isDark } = useTheme();

  if (savedItems.length === 0) return null;

  return (
    <View className="mt-4 pt-6 border-t border-dashed" style={{ borderTopColor: colors.border }}>
      <Text className="font-bold text-base uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>
        Saved For Later ({savedItems.length})
      </Text>

      {savedItems.map((item) => {
        const product = item.productId || ({} as Product);
        const imageUrl = product.images?.[0] || product.image || "https://via.placeholder.com/150";

        return (
          <View
            key={item._id}
            className={`flex-row p-4 md:p-5 rounded-2xl border mb-4 md:mb-5 shadow-sm transition-all ${
              isDesktop ? "hover:shadow-md" : ""
            }`}
            style={{ backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.85 }}
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

              <View className="flex-row items-center justify-end mt-3">
                <TouchableOpacity
                  onPress={() => toggleItemStatus(item._id)}
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    borderColor: colors.primary,
                    backgroundColor: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.05)',
                  }}
                >
                  <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.primary }}>
                    Move to Bag
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