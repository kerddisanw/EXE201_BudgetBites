import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PackagesScreen from './src/screens/PackagesScreen';
import SubscriptionsScreen from './src/screens/SubscriptionsScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Packages" component={PackagesScreen} />
                <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
