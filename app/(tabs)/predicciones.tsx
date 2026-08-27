import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrediccionesIAScreen() {
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const horas = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm'];

  const heatmapData = [
    [85, 25, 15, 45, 30, 80, 95],
    [90, 30, 20, 50, 40, 75, 90],
    [80, 20, 10, 40, 35, 85, 95],
    [85, 35, 25, 55, 45, 70, 85],
    [70, 40, 30, 60, 50, 60, 80],
    [95, 80, 75, 85, 90, 95, 95],
  ];

  const getHeatmapColor = (valor: number) => {
    if (valor >= 70) return { bg: '#70BF97', text: '#ffffff' };
    if (valor >= 40) return { bg: '#D4B933', text: '#ffffff' };
    return { bg: '#CD776A', text: '#ffffff' };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Ionicons name="sparkles" size={24} color="#3b82f6" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Modelo Predictivo Activo</Text>
          <Text style={styles.headerSubtitle}>Entrenado con historial de 6 meses - Precisión 87%</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Probabilidad de espacio libre (Lun-Sáb)</Text>

      <View style={styles.heatmapCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <View style={styles.dayLabelContainer} />
              {horas.map((hora, index) => (
                <View key={`h-${index}`} style={styles.cellContainer}>
                  <Text style={styles.headerText}>{hora}</Text>
                </View>
              ))}
            </View>

            {dias.map((dia, i) => (
              <View key={`d-${i}`} style={styles.dataRow}>
                <View style={styles.dayLabelContainer}>
                  <Text style={styles.dayText}>{dia}</Text>
                </View>

                {heatmapData[i].map((valor, j) => {
                  const colors = getHeatmapColor(valor);
                  return (
                    <View
                      key={`cell-${i}-${j}`}
                      style={[styles.cell, { backgroundColor: colors.bg }]}
                    >
                      <Text style={[styles.cellText, { color: colors.text }]}>
                        {valor}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Alta</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
            <Text style={styles.legendText}>Media</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Baja</Text>
          </View>
        </View>
      </View>

      <View style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <Ionicons name="trending-up" size={20} color="#166534" />
          <Text style={styles.recommendationTitle}>Recomendación IA</Text>
        </View>
        <Text style={styles.recommendationText}>
          El mejor horario para encontrar espacio libre en la Zona A es antes de las 6:30 AM o después de las 11:30 AM. Evita llegar entre 8:00 AM y 10:00 AM.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  headerCard: { flexDirection: 'row', backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#bfdbfe' },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  headerSubtitle: { fontSize: 12, color: '#60a5fa', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  heatmapCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  headerRow: { flexDirection: 'row', marginBottom: 8 },
  dataRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dayLabelContainer: { width: 40, justifyContent: 'center' },
  dayText: { fontWeight: 'bold', color: '#475569', fontSize: 14 },
  cellContainer: { width: 48, alignItems: 'center', marginHorizontal: 2 },
  headerText: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  cell: { width: 48, height: 36, marginHorizontal: 2, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  cellText: { fontSize: 12, fontWeight: 'bold' },
  legendContainer: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: '#475569' },
  recommendationCard: { backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  recommendationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  recommendationTitle: { fontWeight: 'bold', color: '#166534', marginLeft: 8 },
  recommendationText: { color: '#15803d', lineHeight: 20 },
  bottomSpacer: { height: 40 }
});