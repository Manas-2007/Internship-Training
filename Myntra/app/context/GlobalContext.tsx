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
    
    // API response mein ab tumhare DB ke saare products hain
    setCategories(response.data.categories);
    setProducts(response.data.products); 

    // Deals Mapping (Yahan tumhare DB ke real _id's use honge)
    // Ye map tumhare deals ko product se link kar dega
    const dealProductMap: any = {
      "FLAT 60% OFF": "6a40e542efeaeaa042b5d603", // DB mein jo Sneaker ka ID hai wo dalo
      "BUY 1 GET 1": "6a41fc6587c055c8a09c323d",  // DB mein jo Kids item ka ID hai
      "UPTO 70% OFF": "6a41faa287c055c8a09c323b", // DB mein jo Handbag ka ID hai
      "STARTING ₹499": "6a41f21987c055c8a09c3230", // DB mein jo Watch ka ID hai
    };

    const mappedDeals = response.data.deals.map((deal: any) => ({
      ...deal,
      productId: dealProductMap[deal.title] || null
    }));
    
    setDeals(mappedDeals);
    
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