import React from 'react';
import { View, StyleSheet, ScrollView, Text, Image } from 'react-native';
import { ForgeSegment } from '../../components/forge/ForgeSegment';
import { ForgeTheme as T } from '../../constants/ForgeTheme';

// Feature Modules
import { usePlannerData } from '../../features/planner/hooks/usePlannerData';
import { ExerciseLibrary } from '../../features/planner/components/ExerciseLibrary';
import { WeeklyCalendar } from '../../features/planner/components/WeeklyCalendar';
import { DailyPlanCard } from '../../features/planner/components/DailyPlanCard';
import { RoutineList } from '../../features/planner/components/RoutineList';

export default function WorkoutScreen() {
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
          <Image source={require('../../assets/images/mascot_workout.png')} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
          <Text style={s.title} maxFontSizeMultiplier={1.2}>Workout Planner</Text>
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
        <ScrollView contentContainerStyle={s.plannerContainer} showsVerticalScrollIndicator={false}>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
    backgroundColor: T.colors.bg0, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  title: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1 },
  plannerContainer: { padding: T.spacing.page, paddingBottom: 100 },
});
