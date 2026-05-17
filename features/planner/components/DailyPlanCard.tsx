import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { ForgeSkeleton } from '../../../components/forge/ForgeSkeleton';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';

function SkeletonPlanner() {
  return (
    <View style={s.todayCard}>
      <ForgeSkeleton width="40%" height={12} radius={4} style={{ marginBottom: 10 }} />
      <ForgeSkeleton width="70%" height={24} radius={6} style={{ marginBottom: 8 }} />
      <ForgeSkeleton width="55%" height={14} radius={4} style={{ marginBottom: 32 }} />
      <ForgeSkeleton width="100%" height={52} radius={T.radii.md} />
    </View>
  );
}

interface DailyPlanCardProps {
  isLoading: boolean;
  loggedWorkout?: any;
  plannedWorkout?: any;
  activeDateStr: string;
}

import { useExercises } from '../../../hooks/useExercises';
import { mapMusclesToSlugs } from './ExerciseLibrary';
import Body from 'react-native-body-highlighter';

export function DailyPlanCard({ isLoading, loggedWorkout, plannedWorkout, activeDateStr }: DailyPlanCardProps) {
  const router = useRouter();
  const { data: allExercises = [] } = useExercises();

  if (isLoading) {
    return <SkeletonPlanner />;
  }

  const isRestDay = !plannedWorkout || plannedWorkout.dayType === 'Rest';
  const isCompleted = !!loggedWorkout;

  // Helper to get heatmap data for either logged or planned workout
  const getHeatmapData = (exercisesList: any[]) => {
    if (!exercisesList || exercisesList.length === 0) return [];
    let allMuscles = new Set<string>();
    exercisesList.forEach((ex: any) => {
      const libraryEx = allExercises.find((le: any) => le.name === (ex.name || ex.exerciseName));
      if (libraryEx) {
        libraryEx.muscleGroups.forEach((m: any) => allMuscles.add(m));
      }
    });
    return mapMusclesToSlugs(Array.from(allMuscles)).map((slug: any) => ({ slug, intensity: 2 }));
  };

  if (isCompleted) {
    const data = getHeatmapData(loggedWorkout.exercises);
    return (
      <View style={s.todayCard}>
        <Text style={s.todayTitle} maxFontSizeMultiplier={1.2}>✅ Completed</Text>
        <Text style={s.todaySub} maxFontSizeMultiplier={1.2}>{loggedWorkout.notes || 'Workout Logged'}</Text>
        <Text style={s.todayMeta} maxFontSizeMultiplier={1.2}>
          {loggedWorkout.exercises?.length ?? 0} Exercises Completed
        </Text>
        {data.length > 0 && (
          <View style={s.heatmapFigures}>
            <Body data={data} gender="male" side="front" scale={0.4} colors={['#333', T.colors.forge]} />
            <Body data={data} gender="male" side="back" scale={0.4} colors={['#333', T.colors.forge]} />
          </View>
        )}
        <ForgeButton
          label="View Details"
          onPress={() => router.push({ pathname: '/activeWorkout', params: { id: loggedWorkout.id } })}
          variant="secondary"
        />
      </View>
    );
  }

  if (!isRestDay) {
    const data = getHeatmapData(plannedWorkout.exercises);
    return (
      <View style={s.todayCard}>
        <Text style={s.todayTitle} maxFontSizeMultiplier={1.2}>Scheduled Routine</Text>
        <Text style={s.todaySub} maxFontSizeMultiplier={1.2}>{plannedWorkout.title}</Text>
        <Text style={s.todayMeta} maxFontSizeMultiplier={1.2}>
          {plannedWorkout.exercises?.length ?? 0} Exercises Prescribed
        </Text>
        {data.length > 0 && (
          <View style={s.heatmapFigures}>
            <Body data={data} gender="male" side="front" scale={0.4} colors={['#333', T.colors.forge]} />
            <Body data={data} gender="male" side="back" scale={0.4} colors={['#333', T.colors.forge]} />
          </View>
        )}
        <ForgeButton
          label="▶ Start Routine"
          onPress={() => router.push({ pathname: '/activeWorkout', params: { date: activeDateStr } })}
          pulse
        />
      </View>
    );
  }

  return (
    <View style={[s.todayCard, s.todayCardEmpty]}>
      <Text style={s.todaySub} maxFontSizeMultiplier={1.2}>Active Recovery</Text>
      <Text style={s.todayMetaCenter} maxFontSizeMultiplier={1.2}>
        No formal training scheduled. Rest up or do light cardio.
      </Text>
      <ForgeButton
        label="+ Log Extra Workout"
        onPress={() => router.push({ pathname: '/activeWorkout', params: { date: activeDateStr } })}
        variant="secondary"
      />
    </View>
  );
}

const s = StyleSheet.create({
  todayCard: {
    backgroundColor: T.colors.bg1, padding: T.spacing.px6, borderRadius: T.radii.xl,
    borderWidth: 0.5, borderColor: T.colors.b1,
  },
  todayCardEmpty: { alignItems: 'center', paddingVertical: 40 },
  todayTitle: {
    fontSize: T.typography.sizes.label, color: T.colors.t3, marginBottom: 6,
    fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase',
  },
  todaySub: { fontSize: T.typography.sizes.h2, fontWeight: '700', color: T.colors.t1, marginBottom: T.spacing.px2 },
  todayMeta: { color: T.colors.t2, marginBottom: T.spacing.px6, fontSize: T.typography.sizes.bodyS },
  todayMetaCenter: { color: T.colors.t2, marginBottom: T.spacing.px6, fontSize: T.typography.sizes.bodyS, textAlign: 'center' },
  heatmapFigures: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: T.spacing.px6 },
});
