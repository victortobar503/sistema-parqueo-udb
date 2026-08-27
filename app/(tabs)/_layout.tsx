import { Tabs } from 'expo-router';
import React from 'react';
// Si usas íconos de Expo (FontAwesome, Ionicons, etc.)
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#003DA5' }, //azulito u
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#003DA5',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa en Tiempo Real',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="predicciones"
        options={{
          title: 'Predicciones IA',
          tabBarIcon: ({ color }) => <Ionicons name="analytics-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}