import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { subscriptionService, authService } from '../services/api';

export default function SubscriptionsScreen({ navigation }) {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await subscriptionService.getMySubscriptions();
            setSubscriptions(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigation.replace('Login');
    };

    const getStatusStyle = (status) => {
        const styles = {
            PENDING: { backgroundColor: '#fff3cd', color: '#856404' },
            ACTIVE: { backgroundColor: '#d4edda', color: '#155724' },
            COMPLETED: { backgroundColor: '#d1ecf1', color: '#0c5460' },
            CANCELLED: { backgroundColor: '#f8d7da', color: '#721c24' },
        };
        return styles[status] || styles.PENDING;
    };

    const renderSubscription = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.packageName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                <View style={styles.details}>
                    <Text style={styles.detailText}>
                        Start: {new Date(item.startDate).toLocaleDateString()}
                    </Text>
                    <Text style={styles.detailText}>
                        End: {new Date(item.endDate).toLocaleDateString()}
                    </Text>
                    <Text style={styles.detailText}>Amount: ${item.totalAmount}</Text>
                    {item.notes && <Text style={styles.detailText}>Notes: {item.notes}</Text>}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Subscriptions</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Packages')}>
                        <Text style={styles.headerLink}>Packages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {subscriptions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No subscriptions yet</Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('Packages')}
                    >
                        <Text style={styles.browseButtonText}>Browse Packages</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={subscriptions}
                    renderItem={renderSubscription}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#667eea',
        padding: 20,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    headerLink: {
        color: 'white',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
    },
    loadingText: {
        fontSize: 18,
        color: '#667eea',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    browseButton: {
        backgroundColor: '#667eea',
        padding: 15,
        borderRadius: 8,
    },
    browseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    list: {
        padding: 15,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#667eea',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    details: {
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#555',
    },
});
