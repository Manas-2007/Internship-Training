import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Context Create kar rahe hain
const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // react-native ka in-built hook jo phone ki default theme check karta hai ('light' ya 'dark')
  const systemColorScheme = useColorScheme(); 
  
  // State for Dropdown (System, Light, Dark)
  const [themeMode, setThemeMode] = useState("System"); 
  // State for actual UI (True = Dark, False = Light)
  const [isDark, setIsDark] = useState(false);

  // 2. App start hote hi AsyncStorage se purani theme load karna
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@app_theme");
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  // 3. Logic: Decide karna ki "isDark" True hoga ya False
  useEffect(() => {
    if (themeMode === "System") {
      setIsDark(systemColorScheme === "dark");
    } else if (themeMode === "Dark") {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [themeMode, systemColorScheme]);

  // 4. User jab Theme change karega toh use Save karna
  const changeTheme = async (mode: string) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem("@app_theme", mode);
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  // 5. Centralized Color Palette (Scalable Architecture ke liye)
  // Kal ko agar naye colors add karne ho, toh bas yahan change karna padega!
  const colors = {
    background: isDark ? "#171717" : "#ffffff", // App ka main background
    surface: isDark ? "#262626" : "#f8fafc",    // Cards/Navbars ka background
    textMain: isDark ? "#f5f5f5" : "#171717",   // Main Heading text
    textMuted: isDark ? "#a3a3a3" : "#737373",  // Subheading/Descriptions
    primary: "#ff3f6c",                         // Myntra Pink (Dono theme me same rahega)
    border: isDark ? "#404040" : "#f1f1f4",     // Line separators
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, changeTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook jisko hum baaki files mein use karenge
export const useTheme = () => useContext(ThemeContext);