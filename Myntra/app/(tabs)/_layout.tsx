import React from "react";
import { 
  Platform, 
  View, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions 
} from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../context/ThemeContext';
import { useGlobalContext } from '../context/GlobalContext';

const TopNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, changeTheme, colors } = useTheme();
  const { hasUnreadNotifications } = useGlobalContext();
  
  const navItems = [
    { name: "index", label: "Home", icon: "home", route: "/" },
    { name: "categories", label: "Categories", icon: "apps", route: "/categories" },
    { name: "wishlist", label: "Wishlist", icon: "heart", route: "/wishlist" },
    { name: "bag", label: "Bag", icon: "bag", route: "/bag" },
    { name: "profile", label: "Profile", icon: "person", route: "/profile" },
  ];

  return (
    <View 
      className="border-b z-50 shadow-sm w-full" 
      style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
    >
      <View className="w-full max-w-[1400px] mx-auto px-6 py-4 flex-row justify-between items-center">
        
        {/* Brand Logo */}
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

          {/* Notification Button */}
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            className="items-center justify-center cursor-pointer group"
            activeOpacity={0.7}
          >
            <View className="relative">
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.textMain}
                className="group-hover:opacity-80 transition-opacity"
              />
              {hasUnreadNotifications && (
                <View 
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ff3f6c] rounded-full border-[1.5px]"
                  style={{ borderColor: colors.surface }} 
                />
              )}
            </View>
            <Text
              className="text-[11px] font-bold mt-1 tracking-widest uppercase group-hover:opacity-80 transition-opacity"
              style={{ color: colors.textMain }}
            >
              Alerts
            </Text>
          </TouchableOpacity>
          
          {/* Theme Toggle Button */}
          <TouchableOpacity
            onPress={() => changeTheme(isDark ? "Light" : "Dark")}
            className="items-center justify-center cursor-pointer group"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? "moon" : "moon-outline"}
              size={24}
              color={isDark ? colors.primary : colors.textMain}
              className="group-hover:opacity-80 transition-opacity"
            />
            <Text
              className="text-[11px] font-bold mt-1 tracking-widest uppercase group-hover:opacity-80 transition-opacity"
              style={{ color: isDark ? colors.primary : colors.textMain }}
            >
              Theme
            </Text>
          </TouchableOpacity>

          {/* Dynamic Navigation Items */}
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
                  name={isActive ? (item.icon as any) : (`${item.icon}-outline` as any)}
                  size={24}
                  color={isActive ? colors.primary : colors.textMain}
                  className="group-hover:opacity-80 transition-opacity"
                />
                <Text
                  className="text-[11px] font-bold mt-1 tracking-widest uppercase group-hover:opacity-80 transition-opacity"
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
  const isLargeScreen = width >= 768;
  const { colors } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View 
        className="flex-1 w-full max-w-[1400px] mx-auto relative shadow-2xl shadow-black/5" 
        style={{ backgroundColor: colors.background }}
      >
        {isLargeScreen && <TopNavbar />}

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted, 
            tabBarStyle: isLargeScreen
              ? { display: "none" }
              : {
                  backgroundColor: colors.surface,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
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
              marginTop: 2, 
              letterSpacing: 0.3,
            },
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