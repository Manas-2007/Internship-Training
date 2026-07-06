import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { useTheme } from '../context/ThemeContext';

// --- PREMIUM CUSTOM TOP NAVBAR FOR DESKTOP/WEB ---
const TopNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  // 👉 Context se isDark, changeTheme, aur colors nikaal liye
  const { isDark, changeTheme, colors } = useTheme();
  
  const navItems = [
    { name: "index", label: "Home", icon: "home", route: "/" },
    { name: "categories", label: "Categories", icon: "apps", route: "/categories" },
    { name: "wishlist", label: "Wishlist", icon: "heart", route: "/wishlist" },
    { name: "bag", label: "Bag", icon: "bag", route: "/bag" },
    { name: "profile", label: "Profile", icon: "person", route: "/profile" },
  ];

  return (
    // 👉 Dynamic Background & Border applied here
    <View 
      className="border-b z-50 shadow-sm w-full" 
      style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
    >
      {/* 1400px Centering for Top Navbar */}
      <View className="w-full max-w-[1400px] mx-auto px-6 py-4 flex-row justify-between items-center">
        
        {/* Premium Brand Logo */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="cursor-pointer flex-row items-end group"
          activeOpacity={0.8}
        >
         <Text className="text-[22px] font-black tracking-widest" style={{ color: colors.primary }}>
            MYNTRA
          </Text>
        </TouchableOpacity>

        {/* Navigation Links */}
        <View className="flex-row items-center gap-10">

          {/* NOTIFICATION BUTTON */}
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            className="items-center justify-center cursor-pointer group"
            activeOpacity={0.7}
          >
            <View className="relative">
              <Ionicons
                name="notifications-outline"
                size={24}
                // 👉 Dynamic Icon Color
                color={colors.textMain}
                className="group-hover:opacity-80 transition-opacity"
              />
              {/* Red Dot Indicator (Active) */}
              <View 
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ff3f6c] rounded-full border-[1.5px]"
                style={{ borderColor: colors.surface }} 
              />
            </View>
            <Text
              className="text-[11px] font-bold mt-1 tracking-widest uppercase group-hover:opacity-80 transition-opacity"
              // 👉 Dynamic Text Color
              style={{ color: colors.textMain }}
            >
              Alerts
            </Text>
          </TouchableOpacity>
          
          {/* THEME TOGGLE BUTTON */}
          <TouchableOpacity
            onPress={() => changeTheme(isDark ? "Light" : "Dark")}
            className="items-center justify-center cursor-pointer group"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? "moon" : "moon-outline"}
              size={24}
              // 👉 Dynamic Icon Color
              color={isDark ? colors.primary : colors.textMain}
              className="group-hover:opacity-80 transition-opacity"
            />
            <Text
              className="text-[11px] font-bold mt-1 tracking-widest uppercase group-hover:opacity-80 transition-opacity"
              // 👉 Dynamic Text Color
              style={{ color: isDark ? colors.primary : colors.textMain }}
            >
              Theme
            </Text>
          </TouchableOpacity>

          {navItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => router.push(item.route as any)}
                className="items-center justify-center cursor-pointer group"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    isActive
                      ? (item.icon as any)
                      : (`${item.icon}-outline` as any)
                  }
                  size={24}
                  // 👉 Dynamic Icon Color for Nav Items
                  color={isActive ? colors.primary : colors.textMain}
                  className="group-hover:opacity-80 transition-opacity"
                />
                <Text
                  className="text-[11px] font-bold mt-1 tracking-widest uppercase group-hover:opacity-80 transition-opacity"
                  // 👉 Dynamic Text Color for Nav Items
                  style={{ color: isActive ? colors.primary : colors.textMain }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default function TabLayout() {
  const { width } = useWindowDimensions();
  // Using 768px for Tablet/Desktop breakpoint
  const isLargeScreen = width >= 768;
  
  // 👉 Extract colors for Bottom Tabs and App Background
  const { colors } = useTheme();

  return (
    // 👉 Dynamic App Background
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* 1400px Global Wrapper for the entire layout */}
      <View 
        className="flex-1 w-full max-w-[1400px] mx-auto relative shadow-2xl shadow-black/5" 
        style={{ backgroundColor: colors.background }}
      >
        
        {/* Render Top Navbar on large screens */}
        {isLargeScreen && <TopNavbar />}

        <Tabs
          screenOptions={{
            headerShown: false,
            // 1. Explicitly show labels to fix the hidden text issue
            tabBarShowLabel: true,
            // 👉 Dynamic Tab Tint Colors
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted, 
            tabBarStyle: isLargeScreen
              ? { display: "none" }
              : {
                  // 👉 Dynamic Bottom Tab Background & Border
                  backgroundColor: colors.surface,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  // 2. Fixed height and padding combination to accommodate labels perfectly
                  height: Platform.OS === "ios" ? 90 : 75,
                  paddingBottom: Platform.OS === "ios" ? 25 : 12,
                  paddingTop: 8,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  ...Platform.select({
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: -4 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 8,
                    },
                  }),
                },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: "700",
              marginTop: 2, // Fine-tuned margin so text doesn't touch the icon
              letterSpacing: 0.3,
            },
            // Removes the click highlight ripple on Android for a cleaner feel
            tabBarItemStyle: {
              padding: 0,
            }
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="categories"
            options={{
              title: "Categories",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "apps" : "apps-outline"} size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="wishlist"
            options={{
              title: "Wishlist",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="bag"
            options={{
              title: "Bag",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "bag" : "bag-outline"} size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}