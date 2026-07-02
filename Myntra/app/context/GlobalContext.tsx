import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../constants/api"; 

const GlobalContext = createContext<any>(null);

export const GlobalProvider = ({ children }: any) => {
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]); 
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/home`);
      
      setCategories(response.data.categories);
      setProducts(response.data.products); 

      const dealProductMap: any = {
        "FLAT 60% OFF": "6a40e542efeaeaa042b5d603", 
        "BUY 1 GET 1": "6a41fc6587c055c8a09c323d",  
        "UPTO 70% OFF": "6a41faa287c055c8a09c323b",
        "STARTING ₹499": "6a41f21987c055c8a09c3230",
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

  const fetchWishlistIds = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/api/wishlist/ids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistIds(response.data); 
    } catch (error) {
      console.log("Wishlist fetch error:", error);
    }
  };

  const loadLocalRecentlyViewed = async () => {
    try {
      const localData = await AsyncStorage.getItem("@recently_viewed");
      if (localData) {
        setRecentlyViewed(JSON.parse(localData));
      }
    } catch (error) {
      console.log("Error loading local recently viewed:", error);
    }
  };

  const syncRecentlyViewed = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const localData = await AsyncStorage.getItem("@recently_viewed");
      const localItems = localData ? JSON.parse(localData) : [];

      const response = await axios.post(
        `${API_URL}/api/recently-viewed/sync`,
        { localItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const syncedItems = response.data;
      await AsyncStorage.setItem("@recently_viewed", JSON.stringify(syncedItems));
      setRecentlyViewed(syncedItems);
    } catch (error) {
      console.log("Error syncing recently viewed:", error);
    }
  };

  const recordProductView = async (product: any) => {
    try {
      if (!product || !product._id) return;

      const localData = await AsyncStorage.getItem("@recently_viewed");
      let items = localData ? JSON.parse(localData) : [];

      items = items.filter((item: any) => item._id !== product._id);

      const newItem = { ...product, viewedAt: Date.now() };
      items.unshift(newItem);

      items = items.slice(0, 20);

      await AsyncStorage.setItem("@recently_viewed", JSON.stringify(items));
      setRecentlyViewed(items);

      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        axios.post(
          `${API_URL}/api/recently-viewed/sync`,
          { localItems: items },
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(async (res) => {
          const syncedItems = res.data;
          await AsyncStorage.setItem("@recently_viewed", JSON.stringify(syncedItems));
          setRecentlyViewed(syncedItems);
        }).catch(err => console.log("Background sync failed:", err));
      }
    } catch (error) {
      console.log("Error recording product view:", error);
    }
  };

  useEffect(() => {
    loadLocalRecentlyViewed().then(() => {
      syncRecentlyViewed();
    });
    fetchHomeData();
    fetchWishlistIds();
  }, []);

  return (
    <GlobalContext.Provider value={{ 
      categories, deals, products, loading, fetchHomeData, 
      wishlistIds, setWishlistIds, fetchWishlistIds,
      recentlyViewed, recordProductView, syncRecentlyViewed
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
export default GlobalProvider;