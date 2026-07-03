import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React,{ useState } from "react";

// --- PREMIUM CUSTOM TOP NAVBAR FOR DESKTOP/WEB ---
const TopNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = React.useState(false);
  
  const navItems = [
    { name: "index", label: "Home", icon: "home", route: "/" },
    { name: "categories", label: "Categories", icon: "apps", route: "/categories" },
    { name: "wishlist", label: "Wishlist", icon: "heart", route: "/wishlist" },
    { name: "bag", label: "Bag", icon: "bag", route: "/bag" },
    { name: "profile", label: "Profile", icon: "person", route: "/profile" },
  ];

  return (
    <View className="bg-white border-b border-neutral-50 z-50 shadow-sm w-full">
      {/* 1400px Centering for Top Navbar */}
      <View className="w-full max-w-[1400px] mx-auto px-6 py-4 flex-row justify-between items-center">
        
        {/* Premium Brand Logo */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="cursor-pointer flex-row items-end group"
          activeOpacity={0.8}
        >
         <Text className="text-[22px] font-black text-[#ff3f6c] tracking-widest">
                    MYNTRA
          </Text>
          {/* Signature Pink Dot */}
        </TouchableOpacity>

        {/* Navigation Links */}
        <View className="flex-row items-center gap-10">
          <TouchableOpacity
            onPress={() => setIsDark(!isDark)}
            className="items-center justify-center cursor-pointer group"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? "moon" : "moon-outline"}
              size={24}
              color="#ff3f6c"
              className="group-hover:opacity-80 transition-opacity"
            />
            <Text
              className="text-[11px] font-bold mt-1 tracking-widest uppercase text-[#282c3f] group-hover:opacity-80 transition-opacity"
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
                  color={isActive ? "#ff3f6c" : "#282c3f"}
                  className="group-hover:opacity-80 transition-opacity"
                />
                <Text
                  className={`text-[11px] font-bold mt-1 tracking-widest uppercase ${
                    isActive ? "text-[#ff3f6c]" : "text-[#282c3f]"
                  } group-hover:opacity-80 transition-opacity`}
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

  return (
    // Background color outside 1400px will be subtle neutral
    <View className="flex-1 bg-neutral-50">
      
      {/* 1400px Global Wrapper for the entire layout */}
      <View className="flex-1 w-full max-w-[1400px] mx-auto bg-white relative shadow-2xl shadow-black/5">
        
        {/* Render Top Navbar on large screens */}
        {isLargeScreen && <TopNavbar />}

        <Tabs
          screenOptions={{
            headerShown: false,
            // 1. Explicitly show labels to fix the hidden text issue
            tabBarShowLabel: true,
            tabBarActiveTintColor: "#ff3f6c",
            tabBarInactiveTintColor: "#535766", // Myntra's softer grey for inactive state
            tabBarStyle: isLargeScreen
              ? { display: "none" }
              : {
                  backgroundColor: "#ffffff",
                  borderTopWidth: 1,
                  borderTopColor: "#f1f1f4",
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
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="categories"
            options={{
              title: "Categories",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "apps" : "apps-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="wishlist"
            options={{
              title: "Wishlist",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "heart" : "heart-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="bag"
            options={{
              title: "Bag",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "bag" : "bag-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}