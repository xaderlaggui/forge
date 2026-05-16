import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import type { Exercise } from '../../types';

export default function WorkoutScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'planner' | 'library'>('planner');
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'exercises'));
      return snap.docs.map(doc => doc.data() as Exercise);
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout</Text>
        
        {/* Custom Segmented Control */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'planner' && styles.activeTab]}
            onPress={() => setActiveTab('planner')}
          >
            <Text style={[styles.tabText, activeTab === 'planner' && styles.activeTabText]}>Planner</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'library' && styles.activeTab]}
            onPress={() => setActiveTab('library')}
          >
            <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>Library</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'library' ? (
        // --- EXERCISE LIBRARY VIEW ---
        isLoading ? (
          <ActivityIndicator size="large" color="#C15A28" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.muscleGroups.join(', ')} • {item.equipment}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No exercises found. Go to Settings and click Seed!</Text>
            }
          />
        )
      ) : (
        // --- WORKOUT PLANNER VIEW ---
        <ScrollView contentContainerStyle={styles.plannerContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekRow}>
            {weekDays.map((day, idx) => (
              <View key={idx} style={[styles.dayCircle, idx === 1 && styles.activeDayCircle]}>
                <Text style={[styles.dayText, idx === 1 && styles.activeDayText]}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.todayCard}>
            <Text style={styles.todayTitle}>Today's Routine</Text>
            <Text style={styles.todaySub}>Upper Body Power</Text>
            
            <TouchableOpacity style={styles.startButton} onPress={() => router.push('/activeWorkout')}>
              <Text style={styles.startText}>▶ Start Workout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: '#1A1A1A' },

  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 4, textTransform: 'capitalize' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },

  plannerContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  activeDayCircle: { backgroundColor: '#C15A28', borderColor: '#C15A28' },
  dayText: { fontSize: 12, fontWeight: '600', color: '#666' },
  activeDayText: { color: '#fff' },

  todayCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#eee' },
  todayTitle: { fontSize: 14, color: '#666', marginBottom: 4 },
  todaySub: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 24 },
  startButton: { backgroundColor: '#C15A28', padding: 16, borderRadius: 12, alignItems: 'center' },
  startText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
