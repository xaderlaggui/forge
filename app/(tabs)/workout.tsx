import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ForgeSegment } from '../../components/forge/ForgeSegment';

// Feature Modules
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { DailyPlanCard } from '../../features/planner/components/DailyPlanCard';
import { ExerciseLibrary } from '../../features/planner/components/ExerciseLibrary';
import { RoutineList } from '../../features/planner/components/RoutineList';
import { WeeklyCalendar } from '../../features/planner/components/WeeklyCalendar';
import { usePlannerData } from '../../features/planner/hooks/usePlannerData';

import { useScrollToHideNav } from '../../hooks/useScrollToHideNav';

export default function WorkoutScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const { onScroll } = useScrollToHideNav();
  // Clean Architecture: Hook handles all state, formatting, and fetching
  const {
    activeTab, setActiveTab,
    days, activeDayIdx, setActiveDayIdx, activeDateStr,
    exercises, isLoadingExercises,
    loggedWorkout, plannedWorkout, isLoadingWorkouts
  } = usePlannerData();

  return (
    <View style={s.container}>
      {/* ── Composition: Header ── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: T.spacing.px4 }}>
          <View>
            <Text style={s.headerSub} maxFontSizeMultiplier={1.2}>Your Training</Text>
            <Text style={s.title} maxFontSizeMultiplier={1.2}>Workout Planner</Text>
          </View>
        </View>
        <ForgeSegment
          options={['Planner', 'Routines', 'Library']}
          value={activeTab}
          onChange={setActiveTab}
        />
      </View>

      {/* ── Composition: Content ── */}
      {activeTab === 'Library' ? (
        <ExerciseLibrary
          exercises={exercises}
          isLoading={isLoadingExercises}
        />
      ) : activeTab === 'Routines' ? (
        <RoutineList />
      ) : (
        <ScrollView contentContainerStyle={s.plannerContainer} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
          <WeeklyCalendar
            days={days}
            activeDayIdx={activeDayIdx}
            onSelectDay={setActiveDayIdx}
          />

          <DailyPlanCard
            isLoading={isLoadingWorkouts}
            loggedWorkout={loggedWorkout}
            plannedWorkout={plannedWorkout}
            activeDateStr={activeDateStr}
          />
        </ScrollView>
      )}
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
    backgroundColor: T.colors.bg0, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  headerSub: { fontSize: T.typography.sizes.bodyS, color: T.colors.t2, fontWeight: '500', marginBottom: 2 },
  title: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1 },
  plannerContainer: { padding: T.spacing.page, paddingBottom: 100 },
});
