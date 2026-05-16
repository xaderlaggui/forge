import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useAuthStore } from '../../stores/authStore';

export default function ProgressScreen() {
  const { user } = useAuthStore();

  // Dummy data for the last 7 days of workouts
  const barData = [
    { value: 45, label: 'M' },
    { value: 60, label: 'T', frontColor: '#C15A28' },
    { value: 0, label: 'W' },
    { value: 50, label: 'T' },
    { value: 30, label: 'F' },
    { value: 90, label: 'S', frontColor: '#C15A28' },
    { value: 0, label: 'S' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your evolution</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Weight</Text>
        <Text style={styles.cardValue}>{user?.weight || '--'} kg</Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Workout Duration (mins)</Text>
        <View style={{ marginTop: 20 }}>
          <BarChart
            data={barData}
            barWidth={22}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="#E0E0E0"
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            height={150}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  
  card: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 14, color: '#666', marginBottom: 8 },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A' },

  chartCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#eee' }
});
