import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useWorkouts } from '../hooks/useWorkouts';
import { MascotImage } from '../components/common/MascotImage';
import { useForgeTheme } from "@/hooks/useForgeTheme";
// Using lucide-react-native icons instead of SVG figures for simplicity
import { Activity, Flame, Dumbbell } from 'lucide-react-native';

export default function WorkoutHistoryScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { workouts } = useWorkouts();

  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts]);

  const getIconForType = (type?: string, color: string = '#FFF') => {
    if (type === 'run' || type === 'walk' || type === 'cardio') return <Activity size={24} color={color} />;
    return <Dumbbell size={24} color={color} />;
  };

  const getMetricsText = (workout: any) => {
    if (workout.type === 'run' || workout.type === 'walk' || workout.distanceKm) {
      return `${workout.distanceKm || 0} km • ${workout.durationMin} min`;
    }
    return `${workout.exercises?.length || 0} exercises • ${workout.durationMin} min`;
  };

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
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MascotImage
              mascot="progress"
              width={160}
              height={160}
              animation="none"
              accessibilityLabel="Forge the bear celebrating progress gains"
              style={{ alignSelf: 'center', marginBottom: 16 }}
            />
            <Text style={[s.empty, { marginTop: 0 }]}>No workouts logged yet.</Text>
          </View>
        ) : (
          sortedWorkouts.map((session, idx) => (
            <TouchableOpacity 
              key={session.id || idx} 
              style={s.card}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/workoutDetail', params: { id: session.id } })}
            >
              <View style={s.iconWrap}>
                {getIconForType(session.type, T.colors.forge)}
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{session.notes || 'Workout'}</Text>
                <Text style={s.cardDate}>{dayjs(session.date).format('MMM D, YYYY')}</Text>
                <Text style={s.metrics}>{getMetricsText(session)}</Text>
              </View>
            </TouchableOpacity>
          ))
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
    flexDirection: 'row',
    backgroundColor: T.colors.bg1, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: T.colors.b1, marginBottom: 12,
    alignItems: 'center',
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: T.colors.forgeDim || 'rgba(255, 69, 0, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: T.colors.t1, marginBottom: 2 },
  cardDate: { fontSize: 12, fontWeight: '500', color: T.colors.t3, marginBottom: 6 },
  metrics: { fontSize: 13, fontWeight: '600', color: T.colors.t2 },
});
