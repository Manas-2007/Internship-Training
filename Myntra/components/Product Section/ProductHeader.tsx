import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../app/context/ThemeContext";

interface Product {
  brand: string;
  name: string;
  price: number | string;
  discount?: string;
}

interface ProductHeaderProps {
  product: Product;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <View>
      <Text
        className="text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase mb-1.5 md:mb-2"
        style={{ color: colors.textMuted }}
      >
        {product.brand}
      </Text>

      <Text
        className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight leading-snug"
        style={{ color: colors.textMain }}
      >
        {product.name}
      </Text>

      <View className="flex-row items-center mt-4 md:mt-5">
        <Text
          className="text-2xl md:text-3xl font-bold tracking-tight"
          style={{ color: colors.textMain }}
        >
          ₹{product.price}
        </Text>

        {product.discount && (
          <Text
            className="font-bold ml-3 md:ml-4 px-2.5 py-1 rounded-md text-xs md:text-sm tracking-wide"
            style={{
              color: colors.primary,
              backgroundColor: isDark ? "#3f1d2b" : "#fdf2f8",
            }}
          >
            {product.discount}
          </Text>
        )}
      </View>

      <Text
        className="text-[10px] md:text-xs mt-1.5 font-bold uppercase tracking-widest"
        style={{ color: isDark ? "#34d399" : "#059669" }}
      >
        Inclusive of all taxes
      </Text>
    </View>
  );
}
