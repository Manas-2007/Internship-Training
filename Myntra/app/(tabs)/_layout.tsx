import React from "react";
import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

// --- CUSTOM TOP NAVBAR FOR DESKTOP/WEB ---
const TopNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "index", label: "Home", icon: "home", route: "/" },
    { name: "categories", label: "Categories", icon: "apps", route: "/categories" },
    { name: "wishlist", label: "Wishlist", icon: "heart", route: "/wishlist" },
    { name: "bag", label: "Bag", icon: "bag", route: "/bag" },
    { name: "profile", label: "Profile", icon: "person", route: "/profile" },
  ];

  return (
    <View className="bg-white border-b border-neutral-100 z-50 shadow-sm">
      <View className="w-full max-w-6xl lg:max-w-full mx-auto px-6 py-4 flex-row justify-between items-center">
        {/* Logo */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Text className="text-3xl font-black text-[#ff3f6c] tracking-tighter uppercase">
            Myntra
          </Text>
        </TouchableOpacity>

        {/* Navigation Links */}
        <View className="flex-row items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => router.push(item.route as any)}
                className="items-center justify-center cursor-pointer group"
              >
                <Ionicons
                  name={
                    isActive
                      ? (item.icon as any)
                      : (`${item.icon}-outline` as any)
                  }
                  size={24}
                  color={isActive ? "#ff3f6c" : "#282c3f"}
                  className="group-hover:opacity-70 transition-opacity"
                />
                <Text
                  className={`text-[11px] font-bold mt-1 tracking-widest uppercase ${
                    isActive ? "text-[#ff3f6c]" : "text-[#282c3f]"
                  } group-hover:opacity-70 transition-opacity`}
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
  // If the screen is 768px or wider (Tablet/Desktop Web), we classify it as a large screen.
  const isLargeScreen = width >= 768;

  return (
    <View className="flex-1 bg-white">
      {/* Conditionally render the Top Navbar only on large screens */}
      {isLargeScreen && <TopNavbar />}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#ff3f6c",
          tabBarInactiveTintColor: "#282c3f",
          // Conditionally hide the bottom tab bar entirely on large screens
          tabBarStyle: isLargeScreen
            ? { display: "none" }
            : {
                backgroundColor: "#ffffff",
                borderTopWidth: 1,
                borderTopColor: "#eaeaec",
                height: Platform.OS === "ios" ? 88 : 68,
                paddingBottom: Platform.OS === "ios" ? 28 : 12,
                paddingTop: 10,
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "800",
            marginTop: 4,
            letterSpacing: 0.2,
          },
        }}
      >
        {/* 1. Home Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />

        {/* 2. Categories Tab */}
        <Tabs.Screen
          name="categories"
          options={{
            title: "Categories",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "apps" : "apps-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />

        {/* 3. Wishlist Tab */}
        <Tabs.Screen
          name="wishlist"
          options={{
            title: "Wishlist",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />

        {/* 4. Bag Tab */}
        <Tabs.Screen
          name="bag"
          options={{
            title: "Bag",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "bag" : "bag-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />

        {/* 5. Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}