import React from 'react';
import { View, Text } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <View className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
            {children}
        </View>
    );
}

export function CardTitle({ title }: { title: string }) {
    return (
        <Text className="text-lg font-bold text-slate-800 mb-2">
            {title}
        </Text>
    );
}