import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapaU() {

    return (
        // agregado la img que se vera del mapa
        <ScrollView style={styles.container}>
            {/* agregando imagen del mapa (esta es una imagen random namas pa probar */}
            <Image source={{ uri: 'https://res.cloudinary.com/dhotqeo6c/image/upload/v1744075041/samples/man-portrait.jpg' }} style={styles.images} resizeMode="contain" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#f8fafc' 
    },
    images: {
        width: '100%',
        height: 700,
    },
});