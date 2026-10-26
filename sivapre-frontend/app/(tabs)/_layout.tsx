// Iconos inferiores


import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Platform } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textLight,
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopColor: '#E0E0E0',
                    borderTopWidth: 1,
                    height: Platform.OS === 'android' ? 110 : 100,
                    paddingBottom: Platform.OS === 'android' ? 30 : 20,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: 'Inter-Regular',
                    fontSize: 11,
                },
                headerStyle: {
                    backgroundColor: Colors.primary,
                },
                headerTintColor: Colors.white,
                headerTitleStyle: {
                    fontFamily: 'Montserrat-ExtraBold',
                    fontSize: 18,
                },
            }}
        >
            <Tabs.Screen
                name="inicio"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reporte"
                options={{
                    title: 'Reportar',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="informacion"
                options={{
                    title: 'Información',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="mis-reportes"
                options={{
                    title: 'Mis Reportes',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}