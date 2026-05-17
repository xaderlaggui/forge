import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { db } from '../../services/firebase';
import { useWorkouts } from '../../hooks/useWorkouts';
import type { Exercise } from '../../types';
import { ForgeTheme } from '../../constants/ForgeTheme';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

export default function WorkoutScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'planner' | 'library'>('planner');
  
  // Dynamic weekly dates starting from Monday
  const today = dayjs();
  const startOfWeek = today.startOf('week').add(1, 'day'); // Monday
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = startOfWeek.add(i, 'day');
    return { label: d.format('dd').charAt(0), date: d.date(), fullDate: d.format('YYYY-MM-DD') };
  });
  
  const [activeDayIdx, setActiveDayIdx] = useState(today.day() === 0 ? 6 : today.day() - 1);
  const activeDateStr = days[activeDayIdx].fullDate;

  // Exercise Library
  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'exercises'));
      return snap.docs.map(doc => doc.data() as Exercise);
    }
  });

  // Dynamic Workouts
  const { workouts, isLoading: isLoadingWorkouts } = useWorkouts();
  
  // Filter workout for selected day
  const todayWorkout = useMemo(() => {
    return workouts.find(w => w.date.startsWith(activeDateStr));
  }, [workouts, activeDateStr]);

  const buttonPulse = useSharedValue(1);
  const dotOpacity = useSharedValue(0.6);

  React.useEffect(() => {
    buttonPulse.value = withRepeat(withTiming(1.05, { duration: 1500 }), -1, true);
    dotOpacity.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const buttonPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }],
  }));
  const dotOpacityStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Planner</Text>
        
        {/* Custom Segmented Control */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'planner' && styles.activeTab]}
            onPress={() => setActiveTab('planner')}
          >
            <Text style={[styles.tabText, activeTab === 'planner' && styles.activeTabText]}>PLANNER</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'library' && styles.activeTab]}
            onPress={() => setActiveTab('library')}
          >
            <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>LIBRARY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'library' ? (
        // --- EXERCISE LIBRARY VIEW ---
        isLoadingExercises ? (
          <ActivityIndicator size="large" color={ForgeTheme.colors.forge} style={{ marginTop: 40 }} />
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
          <View style={styles.weekRow}>
            {days.map((day, idx) => {
              const isActive = idx === activeDayIdx;
              return (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setActiveDayIdx(idx)}
                  style={styles.weekDotCol}
                >
                  <Text style={styles.dayLabel}>{day.label}</Text>
                  {isActive ? (
                    <Animated.View style={[styles.weekDot, styles.weekDotActive, dotOpacityStyle]} />
                  ) : (
                    <View style={styles.weekDot} />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {isLoadingWorkouts ? (
            <ActivityIndicator size="large" color={ForgeTheme.colors.forge} />
          ) : todayWorkout ? (
            <View style={styles.todayCard}>
              <Text style={styles.todayTitle}>SCHEDULED ROUTINE</Text>
              <Text style={styles.todaySub}>{todayWorkout.notes || 'Custom Workout'}</Text>
              <Text style={{ color: ForgeTheme.colors.t2, marginBottom: 24, fontSize: 13 }}>{todayWorkout.exercises.length} Exercises Planned</Text>
              <Animated.View style={[{ borderRadius: 12, backgroundColor: 'rgba(255, 92, 46, 0.4)' }, buttonPulseStyle]}>
                <TouchableOpacity style={styles.startButton} onPress={() => router.push({ pathname: '/activeWorkout', params: { id: todayWorkout.id } })}>
                  <Text style={styles.startText}>▶ Start Workout</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : (
            <View style={[styles.todayCard, { alignItems: 'center', paddingVertical: 40 }]}>
              <Text style={styles.todaySub}>Rest Day</Text>
              <Text style={{ color: ForgeTheme.colors.t2, textAlign: 'center', marginBottom: 24, fontSize: 13 }}>No workout scheduled for this day.</Text>
              
              {/* If no workout, start a blank one */}
              <Animated.View style={[{ borderRadius: 12, backgroundColor: 'rgba(255, 92, 46, 0.4)' }, buttonPulseStyle]}>
                <TouchableOpacity style={styles.startButton} onPress={() => router.push({ pathname: '/activeWorkout', params: { date: activeDateStr } })}>
                  <Text style={styles.startText}>+ New Workout</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ForgeTheme.colors.bg0 },
  header: { padding: 24, paddingTop: 60, backgroundColor: ForgeTheme.colors.bg0, borderBottomWidth: 0.5, borderBottomColor: ForgeTheme.colors.b1 },
  title: { fontSize: 20, fontWeight: '700', color: ForgeTheme.colors.t1, marginBottom: 16 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: ForgeTheme.colors.bg1, borderRadius: 12, padding: 4, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: ForgeTheme.colors.bg2 },
  tabText: { fontWeight: '600', color: ForgeTheme.colors.t3, fontSize: 11, letterSpacing: 0.5 },
  activeTabText: { color: ForgeTheme.colors.t1 },

  list: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: ForgeTheme.colors.bg1, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: ForgeTheme.colors.t1, letterSpacing: 0.5 },
  cardSub: { fontSize: 11, color: ForgeTheme.colors.t3, marginTop: 4, textTransform: 'uppercase', fontWeight: '500', letterSpacing: 1 },
  emptyText: { textAlign: 'center', marginTop: 40, color: ForgeTheme.colors.t3, fontWeight: '500' },

  plannerContainer: { padding: 20, paddingBottom: 100 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, backgroundColor: ForgeTheme.colors.bg1, padding: 16, borderRadius: 16, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1 },
  weekDotCol: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 10, color: ForgeTheme.colors.t3, fontWeight: '600' },
  weekDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ForgeTheme.colors.bg3 },
  weekDotActive: { backgroundColor: ForgeTheme.colors.forge, shadowColor: ForgeTheme.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 },

  todayCard: { backgroundColor: ForgeTheme.colors.bg1, padding: 24, borderRadius: 20, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1 },
  todayTitle: { fontSize: 11, color: ForgeTheme.colors.t3, marginBottom: 6, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  todaySub: { fontSize: 20, fontWeight: '700', color: ForgeTheme.colors.t1, marginBottom: 32 },
  startButton: { backgroundColor: ForgeTheme.colors.forge, padding: 14, borderRadius: 12, alignItems: 'center' },
  startText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
