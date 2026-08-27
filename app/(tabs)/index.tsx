import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

// Componente interno para los espacios de parqueo
const ParkingSpot = ({ id, status }: { id: string; status: 'libre' | 'ocupado'}) => {
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
  const estadisticas = { libres: 33, ocupados: 24, total: 57 }; // Simulación de datos estadísticos
  
  // Simulando los datos de tu ZIP web
  const zonas = [
    {
      nombre: 'ZONA A - Cafetín Superior',
      espacios: [
        { id: 'A01', status: 'libre' }, { id: 'A02', status: 'ocupado' },
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
              <ParkingSpot key={espacio.id} id={espacio.id} status={espacio.status as any} />
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

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