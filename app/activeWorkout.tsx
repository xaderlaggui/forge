import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Feature Hooks & Components
import { useActiveSession } from '../features/workout/hooks/useActiveSession';
import { LiveTimerHeader } from '../features/workout/components/LiveTimerHeader';
import { WorkoutSetsTable } from '../features/workout/components/WorkoutSetsTable';

// Shared Components
import { RestTimerWidget, NumpadBottomSheet } from '../components/forge/WorkoutWidgets';
import { ForgeButton } from '../components/forge/ForgeButton';
import { ForgeTheme as T } from '../constants/ForgeTheme';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams();
  
  // Clean Architecture: All business logic is encapsulated in this hook
  const session = useActiveSession(id, date);

  return (
    <View style={styles.container}>
      {/* ── Composition: Header ── */}
      <LiveTimerHeader 
        timerLabel={session.timerLabel}
        totalExercises={session.totalExercises}
        doneExercises={session.doneExercises}
        onBack={() => router.back()}
      />

      {/* ── Composition: Main Content ── */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.exerciseTitle} maxFontSizeMultiplier={1.2}>
          {session.workoutTitle}
        </Text>

        <WorkoutSetsTable 
          exercises={session.exercises}
          onToggleSet={session.toggleSet}
          onAddSet={session.addSet}
          onOpenNumpad={session.openNumpad}
        />

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* ── Composition: Rest Timer (Absolute) ── */}
      {session.isResting && (
        <View style={styles.restTimerFloat}>
          <RestTimerWidget
            restTime={session.restTime}
            totalTime={session.totalRestTime}
            isResting={!session.isPaused}
            onSkip={() => { session.setIsResting(false); session.setRestTime(60); }}
            onAddTime={() => session.setRestTime(t => t + 30)}
            onTogglePause={() => session.setIsPaused(p => !p)}
          />
        </View>
      )}

      {/* ── Composition: Footer CTA ── */}
      <View style={styles.footer}>
        <ForgeButton
          label="FINISH WORKOUT"
          onPress={session.finishWorkout}
          size="lg"
          pulse
        />
      </View>

      {/* ── Composition: Modals ── */}
      <NumpadBottomSheet
        visible={session.numpadVisible}
        value={session.numpadValue}
        label={session.numpadLabel}
        onValueChange={session.setNumpadValue}
        onDone={session.commitNumpad}
        onClose={() => session.setNumpadVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { padding: T.spacing.page },
  
  exerciseTitle: { 
    fontSize: T.typography.sizes.h1, 
    fontWeight: '700', 
    color: T.colors.t1, 
    marginBottom: T.spacing.px5 
  },
  
  restTimerFloat: {
    position: 'absolute',
    bottom: 100, left: T.spacing.px4, right: T.spacing.px4,
    zIndex: 20,
  },
  
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: T.spacing.page, paddingBottom: 36,
    backgroundColor: T.colors.bg0,
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
  },
});
