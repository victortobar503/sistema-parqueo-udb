import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../lib/firebase'; // ajusta los ../ según dónde esté este archivo

type Estado = 'libre' | 'ocupado';

const ParkingSpot = ({ id, status }: { id: string; status: Estado }) => {
  const getColors = () => {
    switch (status) {
      case 'libre': return { bg: '#dcfce7', border: '#22c55e', text: '#15803d' }; // Verde
      case 'ocupado': return { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' }; // Rojo
    }
  };
  const colors = getColors();

  return (
    <View style={[styles.spot, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.spotText, { color: colors.text }]}>{id}</Text>
    </View>
  );
};

export default function MapaEnVivoScreen() {
  // Estado del espacio A01 (el que tiene sensor real)
  const [estadoA01, setEstadoA01] = useState<Estado>('libre');

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, 'espacios', 'A01'));
        const e = snap.data()?.estado;
        if (e === 'libre' || e === 'ocupado') setEstadoA01(e);
      } catch (err) {
        console.error('Error leyendo A01:', err);
      }
    };

    cargar();                                // primera carga
    const timer = setInterval(cargar, 5000); // refresco cada 5 segundos
    return () => clearInterval(timer);       // limpia al salir de la pantalla
  }, []);

  // Base del resto de espacios (sin A01): 32 libres, 24 ocupados
    const BASE_LIBRES = 32;
    const BASE_OCUPADOS = 24;

    const estadisticas = {
      libres: BASE_LIBRES + (estadoA01 === 'libre' ? 1 : 0),
      ocupados: BASE_OCUPADOS + (estadoA01 === 'ocupado' ? 1 : 0),
      total: BASE_LIBRES + BASE_OCUPADOS + 1, // 57
    };

  const zonas: { nombre: string; espacios: { id: string; status: Estado }[] }[] = [
    {
      nombre: 'ZONA A - Cafetín Superior',
      espacios: [
        { id: 'A01', status: estadoA01 }, // ← desde Firestore (sensor real)
        { id: 'A02', status: 'ocupado' },
        { id: 'A03', status: 'libre' }, { id: 'A04', status: 'libre' },
        { id: 'A05', status: 'ocupado' }, { id: 'A06', status: 'libre' },
      ]
    },
    {
      nombre: 'ZONA B - Ed. Académico',
      espacios: [
        { id: 'B01', status: 'ocupado' }, { id: 'B02', status: 'ocupado' },
        { id: 'B03', status: 'libre' }, { id: 'B04', status: 'libre' },
      ]
    },
    {
      nombre: 'ZONA C - Ed. Administrativo',
      espacios: [
        { id: 'C01', status: 'libre' }, { id: 'C02', status: 'ocupado' },
        { id: 'C03', status: 'ocupado' }, { id: 'C04', status: 'libre' },
        { id: 'C05', status: 'libre' }, { id: 'C06', status: 'ocupado' },
      ]
    },
    {
      nombre: 'ZONA D - Ed. Biblioteca',
      espacios: [
        { id: 'D01', status: 'libre' }, { id: 'D02', status: 'libre' },
        { id: 'D03', status: 'ocupado' }, { id: 'D04', status: 'ocupado' },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Tarjeta de Estadísticas */}
      <View style={styles.card}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>DISPONIBLES</Text>
            <Text style={[styles.statValue, { color: '#16a34a' }]}>{estadisticas.libres}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>OCUPADOS</Text>
            <Text style={[styles.statValue, { color: '#dc2626' }]}>{estadisticas.ocupados}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TOTAL</Text>
            <Text style={[styles.statValue, { color: '#1e293b' }]}>{estadisticas.total}</Text>
          </View>
        </View>
      </View>

      {/* Renderizado de Zonas */}
      {zonas.map((zona, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{zona.nombre}</Text>
          <View style={styles.grid}>
            {zona.espacios.map((espacio) => (
              <ParkingSpot key={espacio.id} id={espacio.id} status={espacio.status} />
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// namas estilos
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f8fafc', padding: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statBox: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12, color: '#64748b',
    fontWeight: 'bold'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  spot: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  spotText: {
    fontWeight: 'bold',
    fontSize: 12
  }
});