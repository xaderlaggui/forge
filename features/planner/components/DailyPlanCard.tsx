import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useRouter } from 'expo-router';
import { Eye } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Body from 'react-native-body-highlighter';
import { BearMascot } from '../../../components/forge/BearMascot';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { ForgeSkeleton } from '../../../components/forge/ForgeSkeleton';
import { useExercises } from '../../../features/workout/hooks/useExercises';
import { classifyWorkoutFromExercises } from '../../../utils/workoutClassifier';
import { mapMusclesToSlugs } from './ExerciseLibrary';

function SkeletonPlanner() {
  const { T } = useForgeTheme();
  const s = useS(T);
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


export function DailyPlanCard({ isLoading, loggedWorkout, plannedWorkout, activeDateStr }: DailyPlanCardProps) {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { data: allExercises = [] } = useExercises();

  if (isLoading) {
    return <SkeletonPlanner />;
  }

  const isRestDay = !plannedWorkout || plannedWorkout.dayType === 'Rest';
  const isCompleted = !!loggedWorkout;

  // Helper to get heatmap data for either logged or planned workout
  const getHeatmapData = (workoutObj: any) => {
    if (!workoutObj) return [];

    // Feature 3: Highlight based on session type if title exists
    const title = workoutObj.title?.toLowerCase() || '';
    if (title.includes('push')) {
      return mapMusclesToSlugs(['chest', 'shoulders', 'triceps']).map(slug => ({ ...slug, intensity: 2 }));
    }
    if (title.includes('pull')) {
      return mapMusclesToSlugs(['back', 'biceps', 'rear delts']).map(slug => ({ ...slug, intensity: 2 }));
    }
    if (title.includes('leg')) {
      return mapMusclesToSlugs(['quadriceps', 'hamstrings', 'glutes', 'calves']).map(slug => ({ ...slug, intensity: 2 }));
    }
    if (title.includes('full body') || title.includes('full-body')) {
      return mapMusclesToSlugs(['chest', 'shoulders', 'triceps', 'back', 'biceps', 'quadriceps', 'hamstrings', 'glutes', 'calves']).map(slug => ({ ...slug, intensity: 2 }));
    }

    const exercisesList = workoutObj.exercises;
    if (!exercisesList || exercisesList.length === 0) return [];
    let allMuscles = new Set<string>();
    exercisesList.forEach((ex: any) => {
      const libraryEx = allExercises.find((le: any) => le.name === (ex.name || ex.exerciseName));
      if (libraryEx) {
        libraryEx.muscleGroups.forEach((m: any) => allMuscles.add(m));
      }
    });
    return mapMusclesToSlugs(Array.from(allMuscles)).map((slug: any) => ({ slug: slug.slug, intensity: 2 }));
  };

  // Only allow starting workouts on exactly today's date (Manila Time)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const todayPH = new Date(utc + (3600000 * 8)); // UTC+8
  const year = todayPH.getFullYear();
  const month = String(todayPH.getMonth() + 1).padStart(2, '0');
  const date = String(todayPH.getDate()).padStart(2, '0');
  const todayDateStr = `${year}-${month}-${date}`;
  const isToday = activeDateStr === todayDateStr;

  if (isCompleted) {
    const data = getHeatmapData(loggedWorkout);

    let totalVolume = 0;
    loggedWorkout.exercises?.forEach((ex: any) => {
      ex.sets?.forEach((set: any) => {
        totalVolume += (set.weight || 0) * (set.reps || 0);
      });
    });

    return (
      <View style={{ position: 'relative', overflow: 'visible', ...T.shadows.lift }}>
        <View style={[s.todayCard, { overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: T.colors.forgeDim }} />

          <Text style={s.todayTitle} maxFontSizeMultiplier={1.2}>Completed</Text>
          <Text style={s.todaySub} maxFontSizeMultiplier={1.2}>{classifyWorkoutFromExercises(loggedWorkout.exercises)}</Text>
          <Text style={s.todayMeta} maxFontSizeMultiplier={1.2}>
            {loggedWorkout.exercises?.length ?? 0} Exercises{'\n'}
            {loggedWorkout.durationMin || 0} min • {totalVolume.toLocaleString()} kg Vol
          </Text>
          {data.length > 0 && (
            <View style={s.heatmapFigures}>
              <Body data={data} gender="male" side="front" scale={0.4} colors={['#333', T.colors.forge]} />
              <Body data={data} gender="male" side="back" scale={0.4} colors={['#333', T.colors.forge]} />
            </View>
          )}
          <ForgeButton
            label="View Details"
            onPress={() => router.push({ pathname: '/workoutDetail', params: { id: loggedWorkout.id } })}
            variant="secondary"
          />
        </View>
        <BearMascot variant="APPROVING" style={{ height: 140, width: 140, position: 'absolute', right: -10, bottom: 47, zIndex: 10 }} />
      </View>
    );
  }

  if (!isRestDay) {
    const data = getHeatmapData(plannedWorkout);
    return (
      <View style={{ position: 'relative', overflow: 'visible', ...T.shadows.lift }}>
        <View style={[s.todayCard, { overflow: 'hidden' }]}>
          {/* Decorative blob + preview eye button */}
          <View style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: T.colors.forgeDim }} />
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/routinePreview', params: { title: classifyWorkoutFromExercises(plannedWorkout.exercises), exercises: JSON.stringify(plannedWorkout.exercises) } })}
            style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Eye size={18} color={T.colors.forge} />
          </TouchableOpacity>

          <Text style={s.todayTitle} maxFontSizeMultiplier={1.2}>Scheduled Routine</Text>
          <Text style={s.todaySub} maxFontSizeMultiplier={1.2}>{classifyWorkoutFromExercises(plannedWorkout.exercises)}</Text>
          <Text style={s.todayMeta} maxFontSizeMultiplier={1.2}>
            {plannedWorkout.exercises?.length ?? 0} Exercises Prescribed
          </Text>
          {data.length > 0 && (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={s.heatmapFigures}>
                <Body data={data} gender="male" side="front" scale={0.4} colors={['#333', T.colors.forge]} />
                <Body data={data} gender="male" side="back" scale={0.4} colors={['#333', T.colors.forge]} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: T.colors.forge }} />
                <Text style={{ fontSize: 10, color: T.colors.t3, fontWeight: '600', textTransform: 'uppercase' }}>Target Muscles</Text>
              </View>
            </View>
          )}
          {isToday && (
            <ForgeButton
              label="▶ Start"
              onPress={() => router.push({ pathname: '/activeWorkout', params: { date: activeDateStr, title: classifyWorkoutFromExercises(plannedWorkout.exercises), plannedExercises: JSON.stringify(plannedWorkout.exercises) } })}
              pulse
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[s.todayCard, s.todayCardEmpty]}>
      <BearMascot
        variant="THINKING"
        size="lg"
        style={{ alignSelf: 'center', marginBottom: 16 }}
      />
      <Text style={s.todaySub} maxFontSizeMultiplier={1.2}>Active Recovery</Text>
      <Text style={s.todayMetaCenter} maxFontSizeMultiplier={1.2}>
        No formal training scheduled. Rest up or do light cardio.
      </Text>
      {isToday && (
        <ForgeButton
          label="+ Log Extra Workout"
          onPress={() => router.push({ pathname: '/activeWorkout', params: { date: activeDateStr } })}
          variant="secondary"
        />
      )}
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  todayCard: {
    backgroundColor: T.colors.bg1, ...T.shadows.lift, padding: T.spacing.px6, borderRadius: T.radii.xl,
    borderWidth: 0.5, borderColor: T.colors.b1,
  },
  todayCardEmpty: { alignItems: 'center', paddingVertical: 40 },
  todayTitle: {
    fontSize: T.typography.sizes.label, color: T.colors.t3, marginBottom: 6,
    fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase',
  },
  todaySub: { fontSize: T.typography.sizes.h3, fontWeight: '700', color: T.colors.t1, marginBottom: T.spacing.px2 },
  todayMeta: { color: T.colors.t2, marginBottom: T.spacing.px6, fontSize: T.typography.sizes.bodyS },
  todayMetaCenter: { color: T.colors.t2, marginBottom: T.spacing.px6, fontSize: T.typography.sizes.bodyS, textAlign: 'center' },
  heatmapFigures: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: T.spacing.px6 },
});
