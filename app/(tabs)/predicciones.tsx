import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AI_API_URL } from '@/constants/api';

const ZONAS = ['A', 'B', 'C', 'D', 'E'] as const;
type Zona = (typeof ZONAS)[number];

const DIAS_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_INDEX = [0, 1, 2, 3, 4, 5];
const HORAS = [6, 8, 10, 12, 14, 16, 18];
const HORAS_LABEL = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm'];

interface HeatmapResponse {
  zona: string;
  dias: number[];
  horas: number[];
  matriz_prob_libre: number[][];
  recomendacion: string;
  modelo_info: {
    algoritmo: string;
    fuente_datos: string;
    filas_entrenamiento: number | null;
    mae: number | null;
    r2: number | null;
  };
}

const getHeatmapColor = (valor: number) => {
  if (valor >= 60) return { bg: '#70BF97', text: '#ffffff' }; // alta
  if (valor >= 35) return { bg: '#D4B933', text: '#ffffff' }; // media
  return { bg: '#CD776A', text: '#ffffff' }; // baja
};

export default function PrediccionesIAScreen() {
  const [zona, setZona] = useState<Zona>('A');
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPredicciones = useCallback(async (zonaSeleccionada: Zona) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AI_API_URL}/heatmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zona: zonaSeleccionada,
          dias: DIAS_INDEX,
          horas: HORAS,
        }),
      });

      if (!res.ok) {
        throw new Error(`El servicio de IA respondió con error ${res.status}`);
      }

      const json: HeatmapResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(
        'No se pudo conectar con el servicio de IA. Verifica que ai-service esté ' +
          'corriendo (ver README) y que la URL configurada sea correcta.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPredicciones(zona);
  }, [zona, cargarPredicciones]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Ionicons name="sparkles" size={24} color="#3b82f6" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Modelo Predictivo Activo</Text>
          <Text style={styles.headerSubtitle}>
            {data
              ? `${data.modelo_info.algoritmo} · datos: ${data.modelo_info.fuente_datos}`
              : 'Conectando con el servicio de IA...'}
          </Text>
        </View>
      </View>

      {/* Selector de zona */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.zonaSelector}
        contentContainerStyle={styles.zonaSelectorContent}
      >
        {ZONAS.map((z) => (
          <Pressable
            key={z}
            onPress={() => setZona(z)}
            style={[styles.zonaChip, zona === z && styles.zonaChipActive]}
          >
            <Text style={[styles.zonaChipText, zona === z && styles.zonaChipTextActive]}>
              Zona {z}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Probabilidad de espacio libre (Lun-Sáb)</Text>

      {loading && (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#3b82f6" />
          <Text style={styles.stateText}>Consultando modelo de IA...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={[styles.stateCard, styles.errorCard]}>
          <Ionicons name="alert-circle" size={20} color="#b91c1c" />
          <Text style={[styles.stateText, { color: '#b91c1c' }]}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => cargarPredicciones(zona)}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && data && (
        <>
          <View style={styles.heatmapCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.headerRow}>
                  <View style={styles.dayLabelContainer} />
                  {HORAS_LABEL.map((hora, index) => (
                    <View key={`h-${index}`} style={styles.cellContainer}>
                      <Text style={styles.headerText}>{hora}</Text>
                    </View>
                  ))}
                </View>

                {DIAS_LABEL.map((dia, i) => (
                  <View key={`d-${i}`} style={styles.dataRow}>
                    <View style={styles.dayLabelContainer}>
                      <Text style={styles.dayText}>{dia}</Text>
                    </View>

                    {data.matriz_prob_libre[i].map((valor, j) => {
                      const colors = getHeatmapColor(valor);
                      return (
                        <View
                          key={`cell-${i}-${j}`}
                          style={[styles.cell, { backgroundColor: colors.bg }]}
                        >
                          <Text style={[styles.cellText, { color: colors.text }]}>
                            {Math.round(valor)}%
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
            <Text style={styles.recommendationText}>{data.recomendacion}</Text>
          </View>
        </>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  headerCard: { flexDirection: 'row', backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  headerSubtitle: { fontSize: 12, color: '#60a5fa', marginTop: 4 },
  zonaSelector: { marginBottom: 20 },
  zonaSelectorContent: { flexDirection: 'row', paddingRight: 8 },
  zonaChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  zonaChipActive: { backgroundColor: '#3b82f6' },
  zonaChipText: { color: '#475569', fontWeight: '600', fontSize: 13 },
  zonaChipTextActive: { color: '#ffffff' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  stateCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16 },
  errorCard: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  stateText: { marginTop: 8, color: '#64748b', textAlign: 'center' },
  retryButton: { marginTop: 12, backgroundColor: '#ef4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  retryButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
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
  bottomSpacer: { height: 40 },
});
