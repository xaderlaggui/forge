import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { ForgeSegment } from '../../components/forge/ForgeSegment';
import { ForgeTheme as T } from '../../constants/ForgeTheme';

// Feature Modules
import { usePlannerData } from '../../features/planner/hooks/usePlannerData';
import { ExerciseLibrary } from '../../features/planner/components/ExerciseLibrary';
import { WeeklyCalendar } from '../../features/planner/components/WeeklyCalendar';
import { DailyPlanCard } from '../../features/planner/components/DailyPlanCard';

export default function WorkoutScreen() {
  // Clean Architecture: Hook handles all state, formatting, and fetching
  const {
    activeTab, setActiveTab,
    days, activeDayIdx, setActiveDayIdx, activeDateStr,
    exercises, isLoadingExercises,
    todayWorkout, isLoadingWorkouts
  } = usePlannerData();

  return (
    <View style={s.container}>
      {/* ── Composition: Header ── */}
      <View style={s.header}>
        <Text style={s.title} maxFontSizeMultiplier={1.2}>Workout Planner</Text>
        <ForgeSegment
          options={['Planner', 'Library']}
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
      ) : (
        <ScrollView contentContainerStyle={s.plannerContainer} showsVerticalScrollIndicator={false}>
          <WeeklyCalendar 
            days={days} 
            activeDayIdx={activeDayIdx} 
            onSelectDay={setActiveDayIdx} 
          />
          
          <DailyPlanCard 
            isLoading={isLoadingWorkouts}
            todayWorkout={todayWorkout}
            activeDateStr={activeDateStr}
          />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
    backgroundColor: T.colors.bg0, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  title: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1, marginBottom: T.spacing.px4 },
  plannerContainer: { padding: T.spacing.page, paddingBottom: 100 },
});
