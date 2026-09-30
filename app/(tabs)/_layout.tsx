import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    // aqui namas estan los tabs para moverse entre las pantallas, falta agregar la del mapa de la U
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
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa de la U',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}