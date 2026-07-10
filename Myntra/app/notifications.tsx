import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Image,
    SafeAreaView,
    Platform,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext'; 
import { useRouter } from 'expo-router';
import { useGlobalContext } from './context/GlobalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from './constants/api'; 

interface NotificationData {
    url?: string;
    image?: string;
}
 
interface NotificationItem {
    _id: string;
    title: string;
    body: string;
    createdAt: string;
    isRead: boolean;
    data?: NotificationData;
}

export default function NotificationsScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const { fetchUnreadNotificationsCount } = useGlobalContext();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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

            if (response.data?.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (error) {
            // Silently handle error in production
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (item: NotificationItem) => {
        if (item.data?.url) {
            router.push(item.data.url as any);
        }

        if (item.isRead) return;

        // Optimistic UI Update
        setNotifications(prev => 
            prev.map(notif => notif._id === item._id ? { ...notif, isRead: true } : notif)
        );

        try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.put(`${API_URL}/api/notifications/${item._id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUnreadNotificationsCount();
        } catch (error) {
            // Silently handle error
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    const keyExtractor = useCallback((item: NotificationItem) => item._id, []);

    const renderItem = useCallback(({ item }: { item: NotificationItem }) => {
        const unreadBackground = isDark ? '#3a2027' : '#ffeef1';
        const cardBg = item.isRead ? colors.surface : unreadBackground;

        return (
            <TouchableOpacity 
                style={[styles.notificationCard, { backgroundColor: cardBg }]}
                activeOpacity={0.75}
                onPress={() => handleNotificationClick(item)}
            >
                <View style={styles.iconContainer}>
                    {item.data?.image ? (
                        <Image 
                            source={{ uri: item.data.image }} 
                            style={styles.productImage} 
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.fallbackIconFrame, { backgroundColor: colors.border }]}>
                            <Ionicons 
                                name="notifications" 
                                size={22} 
                                color={!item.isRead ? "#ff3f6c" : colors.textMuted} 
                            />
                        </View>
                    )}
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>

                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    }, [colors, isDark]);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View className="flex-1 w-full max-w-[1400px] mx-auto">
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton} hitSlop={15}>
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
                        <Ionicons 
                            name="notifications-off-outline" 
                            size={56} 
                            color={colors.textMuted} 
                            style={styles.emptyIcon} 
                        />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            No notifications yet.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1,
        // 👉 Android header overlapping fix:
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1 
    },
    backButton: { 
        marginRight: 16 
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '700',
        letterSpacing: -0.3
    },
    listContainer: { 
        padding: 16 
    },
    notificationCard: { 
        flexDirection: 'row', 
        padding: 14, 
        borderRadius: 12, 
        marginBottom: 12, 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1 
    },
    iconContainer: { 
        marginRight: 14 
    },
    productImage: { 
        width: 48, 
        height: 48, 
        borderRadius: 8, 
        backgroundColor: '#f5f5f5' 
    },
    fallbackIconFrame: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: { 
        flex: 1,
        justifyContent: 'center'
    },
    title: { 
        fontSize: 15, 
        fontWeight: '700', 
        marginBottom: 3,
        letterSpacing: -0.1
    },
    body: { 
        fontSize: 13, 
        lineHeight: 17,
        marginBottom: 6 
    },
    time: { 
        fontSize: 11,
        fontWeight: '500'
    },
    unreadDot: { 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: '#ff3f6c', 
        marginLeft: 12 
    },
    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 32
    },
    emptyIcon: { 
        opacity: 0.4,
        marginBottom: 12
    },
    emptyText: { 
        fontSize: 15,
        fontWeight: '500'
    },
});