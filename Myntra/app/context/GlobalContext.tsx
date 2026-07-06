import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../constants/api"; 

// 1. Professional TypeScript interface for the Context
interface GlobalContextType {
    categories: any[];
    deals: any[];
    products: any[];
    loading: boolean;
    fetchHomeData: () => Promise<void>;
    wishlistIds: string[];
    setWishlistIds: React.Dispatch<React.SetStateAction<string[]>>;
    fetchWishlistIds: () => Promise<void>;
    recentlyViewed: any[];
    recordProductView: (product: any) => Promise<void>;
    syncRecentlyViewed: () => Promise<void>;
    clearUserData: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [wishlistIds, setWishlistIds] = useState<string[]>([]); 
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch master data for Home Screen
    const fetchHomeData = async () => {
        try {
            // 👉 FIX: Updated from /api/home to /api/products/home
            const response = await axios.get(`${API_URL}/api/products/home`);
            
            setCategories(response.data.categories || []);
            setProducts(response.data.products || []); 

            const dealProductMap: Record<string, string> = {
                "FLAT 60% OFF": "6a40e542efeaeaa042b5d603", 
                "BUY 1 GET 1": "6a41fc6587c055c8a09c323d",  
                "UPTO 70% OFF": "6a41faa287c055c8a09c323b",
                "STARTING ₹499": "6a41f21987c055c8a09c3230",
            };

            const mappedDeals = (response.data.deals || []).map((deal: any) => ({
                ...deal,
                productId: dealProductMap[deal.title] || null
            }));
            
            setDeals(mappedDeals);
        } catch (error) {
            console.error("Failed to fetch home data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Wishlist Management
    const fetchWishlistIds = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;
            
            const response = await axios.get(`${API_URL}/api/wishlist/ids`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistIds(response.data || []); 
        } catch (error) {
            console.error("Failed to fetch wishlist IDs:", error);
        }
    };

    // Recently Viewed Management
    const loadLocalRecentlyViewed = async () => {
        try {
            const localData = await AsyncStorage.getItem("@recently_viewed");
            if (localData) {
                setRecentlyViewed(JSON.parse(localData));
            }
        } catch (error) {
            console.error("Failed to load local recently viewed:", error);
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
            console.error("Failed to sync recently viewed items:", error);
        }
    };

    const recordProductView = async (product: any) => {
        try {
            if (!product?._id) return;

            const localData = await AsyncStorage.getItem("@recently_viewed");
            let items = localData ? JSON.parse(localData) : [];

            // Remove duplicates and add new item to the top
            items = items.filter((item: any) => item._id !== product._id);
            items.unshift({ ...product, viewedAt: Date.now() });
            
            // Keep only the last 20 items to save memory
            items = items.slice(0, 20);

            await AsyncStorage.setItem("@recently_viewed", JSON.stringify(items));
            setRecentlyViewed(items);

            // Sync with backend asynchronously
            const token = await AsyncStorage.getItem("userToken");
            if (token) {
                axios.post(
                    `${API_URL}/api/recently-viewed/sync`,
                    { localItems: items },
                    { headers: { Authorization: `Bearer ${token}` } }
                ).then(async (res) => {
                    await AsyncStorage.setItem("@recently_viewed", JSON.stringify(res.data));
                    setRecentlyViewed(res.data);
                }).catch(() => {
                    // Silently fail background sync to avoid disrupting the UI
                });
            }
        } catch (error) {
            console.error("Failed to record product view:", error);
        }
    };

    // Utility: Clear User Data on Logout
    const clearUserData = async () => {
        try {
            await AsyncStorage.removeItem("@recently_viewed");
            setRecentlyViewed([]); 
            setWishlistIds([]); 
        } catch (error) {
            console.error("Failed to clear user data:", error);
        }
    };

    // Initialization
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
            recentlyViewed, recordProductView, syncRecentlyViewed,
            clearUserData
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

// 2. Export a strongly-typed hook
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

export default GlobalProvider;