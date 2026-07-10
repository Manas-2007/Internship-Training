import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        console.log("Error loading theme:", error);
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
      console.log("Error saving theme:", error);
    }
  };

  const colors = {
    background: isDark ? "#171717" : "#ffffff",
    surface: isDark ? "#262626" : "#f8fafc",    
    textMain: isDark ? "#f5f5f5" : "#171717",  
    textMuted: isDark ? "#a3a3a3" : "#737373",  
    primary: "#ff3f6c",                         
    border: isDark ? "#404040" : "#f1f1f4",    
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, changeTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);