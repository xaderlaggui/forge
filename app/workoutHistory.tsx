import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import dayjs from 'dayjs';
import Body from 'react-native-body-highlighter';
import { useWorkouts } from '../hooks/useWorkouts';
import { mapMusclesToSlugs } from '../features/planner/components/ExerciseLibrary';
import { useExercises } from '../hooks/useExercises';
import { MascotImage } from '../components/common/MascotImage';
import { useForgeTheme } from "@/hooks/useForgeTheme";

export default function WorkoutHistoryScreen() {
    const { T } = useForgeTheme();
    const s = useS(T);
  const router = useRouter();
  const { workouts } = useWorkouts();
  const { data: allExercises = [] } = useExercises();

  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts]);

  return (
    <View style={useS.container}>
      <View style={useS.header}>
        <TouchableOpacity style={useS.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={useS.title}>Workout History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={useS.content} showsVerticalScrollIndicator={false}>
        {sortedWorkouts.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MascotImage
              mascot="progress"
              width={160}
              height={160}
              animation="none"
              accessibilityLabel="Forge the bear celebrating progress gains"
              style={{ alignSelf: 'center', marginBottom: 16 }}
            />
            <Text style={[useS.empty, { marginTop: 0 }]}>No workouts logged yet.</Text>
          </View>
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
              <View key={session.id || idx} style={useS.card}>
                <View style={useS.cardHeader}>
                  <View>
                    <Text style={useS.cardDate}>{dayjs(session.date).format('MMM D, YYYY')}</Text>
                    <Text style={useS.cardTitle}>{session.notes || 'Workout'}</Text>
                  </View>
                  <View style={useS.durationBadge}>
                    <Text style={useS.durationText}>{session.durationMin} MIN</Text>
                  </View>
                </View>

                <View style={useS.statsRow}>
                  <View style={useS.stat}>
                    <Text style={useS.statValue}>{totalVolume.toLocaleString()}</Text>
                    <Text style={useS.statLabel}>LBS VOL</Text>
                  </View>
                  <View style={useS.stat}>
                    <Text style={useS.statValue}>{session.exercises.length}</Text>
                    <Text style={useS.statLabel}>EXERCISES</Text>
                  </View>
                </View>

                {data.length > 0 && (
                  <View style={useS.heatmapWrap}>
                    <Text style={useS.heatmapLabel}>Targeted Muscles</Text>
                    <View style={useS.heatmapFigures}>
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

const useS = (T: any) => StyleSheet.create({
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
