import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightTheme = {
  background: "#ffffff",
  surface: "#f8fafc",
  textMain: "#171717",
  textMuted: "#737373",
  primary: "#ff3f6c",
  border: "#f1f1f4",
};

const darkTheme = {
  background: "#171717",
  surface: "#262626",
  textMain: "#f5f5f5",
  textMuted: "#a3a3a3",
  primary: "#ff3f6c",
  border: "#404040",
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("System");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@app_theme");
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (themeMode === "System") {
      setIsDark(systemColorScheme === "dark");
    } else if (themeMode === "Dark") {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [themeMode, systemColorScheme]);

  const changeTheme = async (mode: string) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem("@app_theme", mode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, changeTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
