import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ForgeSegment } from '../../components/forge/ForgeSegment';

// Feature Modules
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useRouter } from 'expo-router';
import { Dumbbell, RefreshCw, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DailyPlanCard } from '../../features/planner/components/DailyPlanCard';
import { ExerciseLibrary } from '../../features/planner/components/ExerciseLibrary';
import { RoutineList } from '../../features/planner/components/RoutineList';
import { WeeklyCalendar } from '../../features/planner/components/WeeklyCalendar';
import { usePlannerData } from '../../features/planner/hooks/usePlannerData';

import { useScrollToHideNav } from '../../hooks/useScrollToHideNav';

export default function WorkoutScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { onScroll } = useScrollToHideNav();
  // Clean Architecture: Hook handles all state, formatting, and fetching
  const {
    activeTab, setActiveTab,
    days, activeDayIdx, setActiveDayIdx, activeDateStr,
    exercises, isLoadingExercises,
    loggedWorkout, plannedWorkout, isLoadingWorkouts,
    activePlan,
  } = usePlannerData();

  const handleRegenerateWorkoutPlan = () => {
    if (activePlan) {
      Alert.alert(
        'Generate New Weekly Workout Plan?',
        'This will replace your current active AI workout plan. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Regenerate', style: 'destructive', onPress: () => router.push('/plan-generator') }
        ]
      );
    } else {
      router.push('/plan-generator');
    }
  };

  const handleFabPress = () => {
    router.push('/plan-generator');
  };

  return (
    <View style={s.container}>
      {/* ── Composition: Header ── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: T.spacing.px4 }}>
          <View>
            <Text style={s.headerSub} maxFontSizeMultiplier={1.2}>Your Training</Text>
            <Text style={s.title} maxFontSizeMultiplier={1.2}>Workout Planner</Text>
          </View>
          <TouchableOpacity onPress={handleRegenerateWorkoutPlan} style={{ padding: 4, marginTop: 4 }}>
            <RefreshCw size={22} color={T.colors.t1} />
          </TouchableOpacity>
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
        <ScrollView contentContainerStyle={s.plannerContainer} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} bounces={false}>
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

      {/* ── Generate Weekly Plan FAB ── */}
      {activeTab === 'Planner' && (
        <View style={[s.fabWrapper, { bottom: 85 + insets.bottom }]}>
          <TouchableOpacity
            style={[s.fab, { backgroundColor: T.colors.forge, shadowColor: T.colors.forge }]}
            onPress={handleFabPress}
            activeOpacity={0.85}
            accessibilityLabel="Generate AI Workout Plan"
            accessibilityRole="button"
          >
            <Dumbbell size={24} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
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
  fabWrapper: {
    position: 'absolute',
    right: T.spacing.page,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
});
