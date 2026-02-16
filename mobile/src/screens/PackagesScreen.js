import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { packageService, subscriptionService } from '../services/api';

export default function PackagesScreen({ navigation }) {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await packageService.getAllPackages();
            setPackages(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (packageId) => {
        try {
            const startDate = new Date().toISOString().split('T')[0];
            await subscriptionService.createSubscription({
                packageId,
                startDate,
                notes: ''
            });
            Alert.alert('Success', 'Subscription created successfully!');
            navigation.navigate('Subscriptions');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create subscription');
        }
    };

    const renderPackage = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <View style={styles.details}>
                <Text style={styles.detailText}>Price: ${item.price}</Text>
                <Text style={styles.detailText}>Duration: {item.durationDays} days</Text>
                <Text style={styles.detailText}>Meals/Day: {item.mealsPerDay}</Text>
                <Text style={styles.detailText}>Type: {item.packageType}</Text>
            </View>
            <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => handleSubscribe(item.id)}
            >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
        </View>
    );

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
                <Text style={styles.headerTitle}>Meal Packages</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Subscriptions')}>
                    <Text style={styles.headerLink}>My Subscriptions</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={packages}
                renderItem={renderPackage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerLink: {
        color: 'white',
        fontSize: 16,
    },
    loadingText: {
        fontSize: 18,
        color: '#667eea',
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
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: 10,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    details: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    subscribeButton: {
        backgroundColor: '#667eea',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    subscribeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
