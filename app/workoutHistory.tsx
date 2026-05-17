import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import dayjs from 'dayjs';
import Body from 'react-native-body-highlighter';
import { ForgeTheme as T } from '../constants/ForgeTheme';
import { useWorkouts } from '../hooks/useWorkouts';
import { mapMusclesToSlugs } from '../features/planner/components/ExerciseLibrary';
import { useExercises } from '../hooks/useExercises';

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const { workouts } = useWorkouts();
  const { data: allExercises = [] } = useExercises();

  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={s.title}>Workout History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {sortedWorkouts.length === 0 ? (
          <Text style={s.empty}>No workouts logged yet.</Text>
        ) : (
          sortedWorkouts.map((session, idx) => {
            let totalVolume = 0;
            let allMuscles = new Set<string>();

            session.exercises.forEach(ex => {
              // Find the exercise in the global library to get its muscle groups
              const libraryEx = allExercises.find((le: any) => le.name === ex.name);
              if (libraryEx) {
                libraryEx.muscleGroups.forEach((m: any) => allMuscles.add(m));
              }

              ex.sets.forEach((set: any) => {
                totalVolume += (set.weight || 0) * (set.reps || 0);
              });
            });

            const data = mapMusclesToSlugs(Array.from(allMuscles)).map((slug: any) => ({ slug, intensity: 2 }));

            return (
              <View key={session.id || idx} style={s.card}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.cardDate}>{dayjs(session.date).format('MMM D, YYYY')}</Text>
                    <Text style={s.cardTitle}>{session.notes || 'Workout'}</Text>
                  </View>
                  <View style={s.durationBadge}>
                    <Text style={s.durationText}>{session.durationMin} MIN</Text>
                  </View>
                </View>

                <View style={s.statsRow}>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{totalVolume.toLocaleString()}</Text>
                    <Text style={s.statLabel}>LBS VOL</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{session.exercises.length}</Text>
                    <Text style={s.statLabel}>EXERCISES</Text>
                  </View>
                </View>

                {data.length > 0 && (
                  <View style={s.heatmapWrap}>
                    <Text style={s.heatmapLabel}>Targeted Muscles</Text>
                    <View style={s.heatmapFigures}>
                      <Body data={data} gender="male" side="front" scale={0.45} colors={['#333', T.colors.forge]} />
                      <Body data={data} gender="male" side="back" scale={0.45} colors={['#333', T.colors.forge]} />
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: T.colors.bg1, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: T.colors.t1, paddingBottom: 8 },
  content: { padding: 16, paddingBottom: 40 },
  empty: { color: T.colors.t3, textAlign: 'center', marginTop: 40 },
  
  card: {
    backgroundColor: T.colors.bg1, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: T.colors.b1, marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardDate: { fontSize: 12, fontWeight: '600', color: T.colors.forge, marginBottom: 4, textTransform: 'uppercase' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: T.colors.t1 },
  durationBadge: { backgroundColor: T.colors.bg2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  durationText: { fontSize: 10, fontWeight: '700', color: T.colors.t2 },
  
  statsRow: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  stat: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: T.colors.t1 },
  statLabel: { fontSize: 10, fontWeight: '700', color: T.colors.t3, letterSpacing: 0.5 },

  heatmapWrap: { borderTopWidth: 0.5, borderTopColor: T.colors.b1, paddingTop: 16 },
  heatmapLabel: { fontSize: 10, fontWeight: '700', color: T.colors.t3, letterSpacing: 0.5, marginBottom: 10 },
  heatmapFigures: { flexDirection: 'row', justifyContent: 'center', gap: 40 },
});
