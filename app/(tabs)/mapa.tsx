import mapaImg from '@/assets/imagenes/mapav.png';
import React from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

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
                <Image 
                    source={mapaImg} 
                    style={styles.imagenMapa}
                    resizeMode="cover" 
                />
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
        overflow: 'hidden' 
    },
    imagenMapa: {
        width: '100%',
        height: '100%',
    }
});