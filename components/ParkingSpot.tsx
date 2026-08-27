import React from 'react';
import { View, Text } from 'react-native';

interface ParkingSpotProps {
    id: string;
    status: 'libre' | 'ocupado' | 'reservado';
}

export function ParkingSpot({ id, status }: ParkingSpotProps) {
    const bgColors = {
        libre: 'bg-green-100 border-green-500',
        ocupado: 'bg-red-100 border-red-500',
        reservado: 'bg-yellow-100 border-yellow-500'
    };

    const textColors = {
        libre: 'text-green-700',
        ocupado: 'text-red-700',
        reservado: 'text-yellow-700'
    };

    return (
        <View className={`w-14 h-14 border-2 rounded-md items-center justify-center m-1 ${bgColors[status]}`}>
            <Text className={`font-bold text-xs ${textColors[status]}`}>{id}</Text>
        </View>
    );
}