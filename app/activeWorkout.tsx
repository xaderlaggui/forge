import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// Feature Hooks & Components
import { useActiveSession } from '../features/workout/hooks/useActiveSession';
import { LiveTimerHeader } from '../features/workout/components/LiveTimerHeader';
import { WorkoutSetsTable } from '../features/workout/components/WorkoutSetsTable';

// Shared Components
import { RestTimerWidget, NumpadBottomSheet } from '../components/forge/WorkoutWidgets';
import { ForgeButton } from '../components/forge/ForgeButton';
import { ForgeTheme as T } from '../constants/ForgeTheme';

const PRESETS = [
  { label: '3×8', sets: 3, reps: 8 },
  { label: '3×10', sets: 3, reps: 10 },
  { label: '3×12', sets: 3, reps: 12 },
  { label: '4×8', sets: 4, reps: 8 },
  { label: '5×5', sets: 5, reps: 5 },
];

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { id, date, routineId } = useLocalSearchParams();
  
  const session = useActiveSession(id, date, routineId);

  const handleBack = () => {
    if (session.workoutStarted && !session.allSetsComplete) {
      Alert.alert(
        'Cancel Workout?',
        'You have an active workout session. Are you sure you want to leave?',
        [
          { text: 'Keep Working', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const currentExercise = session.exercises[session.currentExerciseIndex];

  return (
    <View style={styles.container}>
      <LiveTimerHeader 
        timerLabel={session.timerLabel}
        totalExercises={session.totalExercises}
        doneExercises={session.doneExercises}
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!session.workoutStarted ? (
          <View style={styles.startOverlay}>
            <Text style={styles.exerciseTitle} maxFontSizeMultiplier={1.2}>
              {session.workoutTitle}
            </Text>
            <Text style={styles.startHint}>Tap Start Workout to begin tracking.</Text>
          </View>
        ) : (
          <>
            {/* Feature 4: Volume Tracker */}
            <View style={styles.volumeTracker}>
              <View style={styles.volStat}>
                <Text style={styles.volValue}>{session.volumeStats.volume.toLocaleString()}</Text>
                <Text style={styles.volLabel}>LBS VOL</Text>
              </View>
              <View style={styles.volDivider} />
              <View style={styles.volStat}>
                <Text style={styles.volValue}>{session.volumeStats.completedSets}</Text>
                <Text style={styles.volLabel}>SETS DONE</Text>
              </View>
              <View style={styles.volDivider} />
              <View style={styles.volStat}>
                <Text style={styles.volValue}>{session.doneExercises}/{session.totalExercises}</Text>
                <Text style={styles.volLabel}>EXERCISES</Text>
              </View>
            </View>

            {/* Exercise Navigator */}
            <View style={styles.navigator}>
              <TouchableOpacity 
                style={styles.navBtn} 
                disabled={session.currentExerciseIndex === 0}
                onPress={() => session.setCurrentExerciseIndex(i => i - 1)}
              >
                <ChevronLeft size={24} color={session.currentExerciseIndex === 0 ? T.colors.t3 : T.colors.forge} />
              </TouchableOpacity>
              
              <Text style={styles.navCount}>
                {session.currentExerciseIndex + 1} OF {session.totalExercises}
              </Text>

              <TouchableOpacity 
                style={styles.navBtn} 
                disabled={session.currentExerciseIndex === session.totalExercises - 1}
                onPress={() => session.setCurrentExerciseIndex(i => i + 1)}
              >
                <ChevronRight size={24} color={session.currentExerciseIndex === session.totalExercises - 1 ? T.colors.t3 : T.colors.forge} />
              </TouchableOpacity>
            </View>

            {currentExercise && (
              <>
                <Text style={styles.exerciseName} maxFontSizeMultiplier={1.2}>
                  {currentExercise.name}
                </Text>

                {/* Preset Selector */}
                <View style={styles.presetSection}>
                  <Text style={styles.presetLabel}>QUICK PRESETS</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
                    {PRESETS.map(p => {
                      const isActive = currentExercise.sets.length === p.sets && currentExercise.sets[0]?.reps === p.reps.toString();
                      return (
                        <TouchableOpacity 
                          key={p.label} 
                          style={[styles.presetChip, isActive && styles.presetChipActive]}
                          onPress={() => session.selectPreset(session.currentExerciseIndex, p.sets, p.reps)}
                        >
                          <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>{p.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Set Table for Current Exercise Only */}
                <WorkoutSetsTable 
                  exercises={[currentExercise]}
                  personalRecords={session.personalRecords}
                  onToggleSet={(exIdx, setIdx) => session.toggleSet(session.currentExerciseIndex, setIdx)}
                  onAddSet={(exIdx) => session.addSet(session.currentExerciseIndex)}
                  onRemoveSet={(exIdx, setIdx) => session.removeSet(session.currentExerciseIndex, setIdx)}
                  onOpenNumpad={(exIdx, setIdx, field) => session.openNumpad(session.currentExerciseIndex, setIdx, field)}
                />
              </>
            )}
          </>
        )}

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Rest Timer (Absolute) */}
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

      {/* Footer CTA */}
      <View style={styles.footer}>
        {!session.workoutStarted ? (
          <ForgeButton
            label="START WORKOUT"
            onPress={() => session.setWorkoutStarted(true)}
            size="lg"
            pulse
          />
        ) : (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <ForgeButton
              label="REST"
              onPress={() => { session.setIsResting(true); session.setIsPaused(false); }}
              size="lg"
              variant="secondary"
              style={{ flex: 1 }}
            />
            <ForgeButton
              label="COMPLETE"
              onPress={session.finishWorkout}
              size="lg"
              disabled={!session.allSetsComplete}
              variant={session.allSetsComplete ? 'primary' : 'secondary'}
              style={{ flex: 2 }}
            />
          </View>
        )}
      </View>

      {/* Modals */}
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
  
  startOverlay: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  exerciseTitle: { fontSize: 24, fontWeight: '800', color: T.colors.t1, marginBottom: 8, textAlign: 'center' },
  startHint: { fontSize: 14, color: T.colors.t3, textAlign: 'center' },

  volumeTracker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.colors.bg1, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: T.colors.b1,
    marginBottom: 24,
  },
  volStat: { alignItems: 'center', flex: 1 },
  volValue: { fontSize: 20, fontWeight: '800', color: T.colors.t1, marginBottom: 4 },
  volLabel: { fontSize: 10, fontWeight: '700', color: T.colors.forge, letterSpacing: 1 },
  volDivider: { width: 1, height: 24, backgroundColor: T.colors.b1 },

  navigator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  navBtn: { padding: 8 },
  navCount: { fontSize: 12, fontWeight: '800', color: T.colors.t3, letterSpacing: 1 },

  exerciseName: { fontSize: 28, fontWeight: '800', color: T.colors.t1, marginBottom: 20 },

  presetSection: { marginBottom: 24 },
  presetLabel: { fontSize: 10, fontWeight: '800', color: T.colors.t3, letterSpacing: 0.8, marginBottom: 8 },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetChip: { backgroundColor: T.colors.bg1, borderWidth: 0.5, borderColor: T.colors.b1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  presetChipActive: { backgroundColor: T.colors.forge },
  presetChipText: { color: T.colors.t2, fontSize: 13, fontWeight: '700' },
  presetChipTextActive: { color: '#000' },

  restTimerFloat: {
    position: 'absolute',
    bottom: 140, left: T.spacing.px4, right: T.spacing.px4,
    zIndex: 20,
  },
  manualRestBtn: {
    backgroundColor: T.colors.bg1,
    borderWidth: 1,
    borderColor: T.colors.forge,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manualRestText: {
    color: T.colors.forge,
    fontWeight: '700',
    fontSize: 14,
  },
  
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: T.spacing.page, paddingBottom: 36,
    backgroundColor: T.colors.bg0,
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
  },
});
