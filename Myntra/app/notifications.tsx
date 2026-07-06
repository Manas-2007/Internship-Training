import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext'; 
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// 👉 Adjust this import path if your API_URL is located elsewhere
import { API_URL } from './constants/api'; 

// 1. Updated Interface to match MongoDB Schema
interface NotificationItem {
    _id: string;
    title: string;
    body: string;
    createdAt: string;
    isRead: boolean;
    data?: any;
}

export default function NotificationsScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    
    // State to hold the real notifications
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            const response = await axios.get(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (item: NotificationItem) => {
        // 1. If there's a URL in the data, navigate there (e.g., /orders)
        if (item.data && item.data.url) {
            router.push(item.data.url);
        }

        // 2. If it's already read, do nothing more
        if (item.isRead) return;

        // 3. Optimistically update UI to remove the red dot instantly
        setNotifications(prev => 
            prev.map(notif => notif._id === item._id ? { ...notif, isRead: true } : notif)
        );

        // 4. Update the database in the background
        try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.put(`${API_URL}/api/notifications/${item._id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Helper function to format MongoDB dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity 
            style={[
                styles.notificationCard, 
                { backgroundColor: colors.surface },
                !item.isRead && { backgroundColor: isDark ? '#3a2027' : '#ffeef1' }
            ]}
            activeOpacity={0.8}
            onPress={() => handleNotificationClick(item)}
        >
            <View style={styles.iconContainer}>
                <Ionicons 
                    name="notifications" 
                    size={24} 
                    color={!item.isRead ? "#ff3f6c" : colors.textMuted} 
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[styles.body, { color: colors.textMuted }]}>{item.body}</Text>
                <Text style={[styles.time, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View 
                className="flex-1 w-full max-w-[1400px] mx-auto shadow-2xl shadow-black/5"
                style={{ backgroundColor: colors.background }}
            >
                {/* Custom Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity 
    onPress={() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/'); // Agar history clear ho gayi hai, toh seedha Home par bhej do
        }
    }} 
    style={styles.backButton}
>
    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
</TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>Notifications</Text>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : notifications.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} style={{ opacity: 0.5 }} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    listContainer: { padding: 16 },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: { marginRight: 16 },
    textContainer: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    body: { fontSize: 14, marginBottom: 6 },
    time: { fontSize: 12 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff3f6c', marginLeft: 8 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 16, fontSize: 16 },
});