import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext'; // Adjust path if needed
import { useRouter } from 'expo-router';

// 1. Define the TypeScript Interface
interface NotificationItem {
    id: string;
    title: string;
    body: string;
    time: string;
    isRead: boolean;
}

// 2. Apply the Interface to Dummy Data
const dummyNotifications: NotificationItem[] = [
    { id: '1', title: 'Order Confirmed! 🎉', body: 'Your order TRK1234567 is being processed.', time: '10 mins ago', isRead: false },
    { id: '2', title: 'Forgot something? 🛒', body: 'You left items in your bag. Complete your purchase!', time: '2 hours ago', isRead: true },
    { id: '3', title: 'Welcome to Myntra! 🚀', body: 'Start exploring top brands and latest trends.', time: '1 day ago', isRead: true },
];

export default function NotificationsScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    // 3. Strongly type the renderItem prop
    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity 
            style={[
                styles.notificationCard, 
                { backgroundColor: colors.surface },
                !item.isRead && { backgroundColor: isDark ? '#3a2027' : '#ffeef1' }
            ]}
            activeOpacity={0.8}
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
                <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Custom Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Notifications</Text>
            </View>

            <FlatList
                data={dummyNotifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50, // Adjust this based on your app's safe area
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
});