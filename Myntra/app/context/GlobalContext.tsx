import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = "http://10.132.206.253:5000";
const GlobalContext = createContext<any>(null);

export const GlobalProvider = ({ children }: any) => {
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]); // <--- Global State
  const [loading, setLoading] = useState(true);

  // Home Data Fetch
  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/home`);
      setCategories(response.data.categories);
      setDeals(response.data.deals);
      setProducts(response.data.products);
    } catch (error) {
      console.log("Global fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Wishlist IDs Fetch (Global)
  const fetchWishlistIds = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/api/wishlist/ids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistIds(response.data); // Pure app ke liye IDs sync ho gayi
    } catch (error) {
      console.log("Error fetching wishlist IDs:", error);
    }
  };

  useEffect(() => {
    fetchHomeData();
    fetchWishlistIds();
  }, []);

  return (
    <GlobalContext.Provider value={{ 
      categories, deals, products, loading, fetchHomeData, 
      wishlistIds, setWishlistIds, fetchWishlistIds // <--- Sab expose kar diya
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
export default GlobalProvider;