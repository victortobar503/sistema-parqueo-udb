import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
// Ajusta la ruta dependiendo de dónde guardaste la imagen
import MapaUDB from '@/assets/imagenes/mapav.svg'; 

export default function MapaU() {
    const { width, height } = useWindowDimensions();
    const esEscritorio = width > height;

    return (
        <View style={styles.container}>
            <View 
                style={{
                    transform: esEscritorio ? [{ rotate: '90deg' }] : [{ rotate: '0deg' }],
                    width: esEscritorio ? height : width,
                    height: esEscritorio ? width : height,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <MapaUDB width="100%" height="100%" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#409c54',
        alignItems: 'center',
        justifyContent: 'center',
        // Evita que aparezcan barras de desplazamiento al rotar en la web
        overflow: 'hidden' 
    },
});