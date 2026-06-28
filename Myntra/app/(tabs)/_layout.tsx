import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff3f6c", // Myntra Active Pink
        tabBarInactiveTintColor: "#282c3f", // Myntra Dark Charcoal Inactive
        tabBarStyle: {
          backgroundColor: "#ffffff", // Pure white like original Myntra
          borderTopWidth: 1,
          borderTopColor: "#eaeaec", // Lightweight grey border
          height: Platform.OS === "ios" ? 88 : 68, // Fixed alignment for both OS
          paddingBottom: Platform.OS === "ios" ? 28 : 12, // Protects text from cutting off on low-end & premium devices
          paddingTop: 10,
          position: "absolute", // Makes layout stay layout-level without breaking layouts
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
              elevation: 4, // Clean shadow lift
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800", // Extra bold like premium apps
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
              name={focused ? "home" : "home-outline"} // Focused par Filled icon, baaki par Outline
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
  );
}