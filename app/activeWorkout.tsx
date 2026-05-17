import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useWorkouts } from '../hooks/useWorkouts';
import { RestTimerWidget } from '../components/forge/WorkoutWidgets';
import { NumpadBottomSheet } from '../components/forge/WorkoutWidgets';
import { ForgeTheme as T } from '../constants/ForgeTheme';
import { ForgeButton } from '../components/forge/ForgeButton';

interface SetRow {
  id: number;
  prev: string;
  weight: string;
  reps: string;
  done: boolean;
}

interface ExerciseState {
  name: string;
  sets: SetRow[];
}

type NumpadTarget = { exIdx: number; setIdx: number; field: 'weight' | 'reps' } | null;

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams();
  const { workouts, saveWorkout } = useWorkouts();

  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [totalRestTime] = useState(60);
  const [workoutTitle, setWorkoutTitle] = useState('Custom Workout');
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Numpad state
  const [numpadVisible, setNumpadVisible] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState<NumpadTarget>(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [numpadLabel, setNumpadLabel] = useState('Log Value');

  // ── Load workout data ──
  useEffect(() => {
    if (isLoaded) return;
    if (id) {
      const existing = workouts.find(w => w.id === id);
      if (existing) {
        setWorkoutTitle(existing.notes || 'Scheduled Routine');
        setExercises(existing.exercises.map((ex, i) => ({
          name: ex.name,
          sets: ex.sets.map((s, idx) => ({
            id: idx,
            prev: `${s.weight} x ${s.reps}`,
            weight: s.weight.toString(),
            reps: s.reps.toString(),
            done: false,
          })),
        })));
      }
    } else {
      setExercises([{ name: 'Bench Press (Barbell)', sets: [
        { id: 1, prev: '—', weight: '', reps: '', done: false },
        { id: 2, prev: '—', weight: '', reps: '', done: false },
      ] }]);
    }
    setIsLoaded(true);
  }, [id, workouts, isLoaded]);

  // ── Elapsed timer ──
  useEffect(() => {
    const iv = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Rest countdown ──
  useEffect(() => {
    if (!isResting || isPaused) return;
    if (restTime <= 0) {
      setIsResting(false);
      Alert.alert('Rest Complete', 'Back to work! 💪');
      setRestTime(60);
      return;
    }
    const iv = setInterval(() => setRestTime(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [isResting, isPaused, restTime]);

  // ── Toggle set done ──
  const toggleSet = (exIdx: number, setIdx: number) => {
    const copy = exercises.map((ex, ei) =>
      ei !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, si) =>
          si !== setIdx ? s : { ...s, done: !s.done }
        ),
      }
    );
    setExercises(copy);
    if (!copy[exIdx].sets[setIdx].done) return; // just unchecked
    setIsResting(true);
    setIsPaused(false);
    setRestTime(60);
  };

  // ── Add set ──
  const addSet = (exIdx: number) => {
    const copy = [...exercises];
    const last = copy[exIdx].sets[copy[exIdx].sets.length - 1];
    copy[exIdx].sets.push({
      id: copy[exIdx].sets.length + 1,
      prev: last?.prev || '—',
      weight: last?.weight || '',
      reps: last?.reps || '',
      done: false,
    });
    setExercises(copy);
  };

  // ── Numpad helpers ──
  const openNumpad = (exIdx: number, setIdx: number, field: 'weight' | 'reps') => {
    const val = exercises[exIdx].sets[setIdx][field];
    setNumpadTarget({ exIdx, setIdx, field });
    setNumpadValue(val);
    setNumpadLabel(field === 'weight' ? 'Weight (lbs)' : 'Reps');
    setNumpadVisible(true);
  };

  const commitNumpad = () => {
    if (!numpadTarget) { setNumpadVisible(false); return; }
    const { exIdx, setIdx, field } = numpadTarget;
    setExercises(prev => prev.map((ex, ei) =>
      ei !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, si) =>
          si !== setIdx ? s : { ...s, [field]: numpadValue }
        ),
      }
    ));
    setNumpadVisible(false);
    setNumpadTarget(null);
  };

  // ── Finish workout ──
  const finishWorkout = async () => {
    const mins = Math.floor(timer / 60);
    try {
      await saveWorkout({
        id: id ? (id as string) : `workout_${Date.now()}`,
        date: date ? (date as string) : dayjs().format('YYYY-MM-DD'),
        exercises: exercises.map(ex => ({
          exerciseId: 'custom',
          name: ex.name,
          sets: ex.sets
            .filter(s => s.done)
            .map(s => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 })),
        })),
        durationMin: mins,
        calories: Math.round(mins * 5),
        notes: workoutTitle,
      });
      Alert.alert('Great Job! 🏆', `Workout saved — ${mins} minutes crushed.`);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save workout.');
    }
  };

  // Progress pips (number of exercises as steps)
  const totalExercises = exercises.length;
  const doneExercises = exercises.filter(ex => ex.sets.every(s => s.done)).length;

  const timerLabel = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* ── Sticky Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={T.colors.t2} />
        </TouchableOpacity>

        {/* Exercise progress pips */}
        <View style={styles.pips}>
          {exercises.map((ex, i) => (
            <View
              key={i}
              style={[
                styles.pip,
                i === doneExercises ? styles.pipActive : i < doneExercises ? styles.pipDone : styles.pipInactive,
              ]}
            />
          ))}
        </View>

        {/* Live timer */}
        <View style={styles.timerBadge}>
          <View style={styles.timerDot} />
          <Text style={styles.timerText} maxFontSizeMultiplier={1.2}>{timerLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Exercise title ── */}
        <Text style={styles.exerciseTitle} maxFontSizeMultiplier={1.2}>{workoutTitle}</Text>

        {/* ── Sets table per exercise ── */}
        {exercises.map((ex, exIdx) => (
          <View key={exIdx} style={styles.exerciseBlock}>
            <Text style={styles.exName} maxFontSizeMultiplier={1.2}>{ex.name}</Text>

            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colHead, { flex: 0.6 }]} maxFontSizeMultiplier={1.2}>SET</Text>
              <Text style={[styles.colHead, { flex: 1.4 }]} maxFontSizeMultiplier={1.2}>PREVIOUS</Text>
              <Text style={[styles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>LBS</Text>
              <Text style={[styles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>REPS</Text>
              <Text style={[styles.colHead, { flex: 0.6, textAlign: 'center' }]} maxFontSizeMultiplier={1.2}>✓</Text>
            </View>

            {/* Set rows */}
            {ex.sets.map((set, setIdx) => (
              <View
                key={setIdx}
                style={[styles.row, set.done && styles.rowDone, setIdx < ex.sets.length - 1 && styles.rowBorder]}
              >
                <Text style={[styles.cell, { flex: 0.6, color: T.colors.t2 }]} maxFontSizeMultiplier={1.2}>{setIdx + 1}</Text>
                <Text style={[styles.cell, { flex: 1.4, color: T.colors.t3, fontSize: T.typography.sizes.bodyS }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>{set.prev}</Text>

                <TouchableOpacity
                  style={[styles.inputCell, { flex: 1 }, set.done && styles.inputCellDone]}
                  onPress={() => openNumpad(exIdx, setIdx, 'weight')}
                >
                  <Text style={styles.inputCellText} maxFontSizeMultiplier={1.2}>{set.weight || '—'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.inputCell, { flex: 1 }, set.done && styles.inputCellDone]}
                  onPress={() => openNumpad(exIdx, setIdx, 'reps')}
                >
                  <Text style={styles.inputCellText} maxFontSizeMultiplier={1.2}>{set.reps || '—'}</Text>
                </TouchableOpacity>

                <View style={[{ flex: 0.6, alignItems: 'center' }]}>
                  <TouchableOpacity
                    style={[styles.checkBtn, set.done && styles.checkBtnDone]}
                    onPress={() => toggleSet(exIdx, setIdx)}
                  >
                    <Check size={14} strokeWidth={3} color={set.done ? '#fff' : 'transparent'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add set */}
            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exIdx)}>
              <Text style={styles.addSetText} maxFontSizeMultiplier={1.2}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* ── Floating Rest Timer ── */}
      {isResting && (
        <View style={styles.restTimerFloat}>
          <RestTimerWidget
            restTime={restTime}
            totalTime={totalRestTime}
            isResting={!isPaused}
            onSkip={() => { setIsResting(false); setRestTime(60); }}
            onAddTime={() => setRestTime(t => t + 30)}
            onTogglePause={() => setIsPaused(p => !p)}
          />
        </View>
      )}

      {/* ── Finish Button ── */}
      <View style={styles.footer}>
        <ForgeButton
          label="FINISH WORKOUT"
          onPress={finishWorkout}
          size="lg"
          pulse
        />
      </View>

      {/* ── Numpad Bottom Sheet ── */}
      <NumpadBottomSheet
        visible={numpadVisible}
        value={numpadValue}
        label={numpadLabel}
        onValueChange={setNumpadValue}
        onDone={commitNumpad}
        onClose={() => setNumpadVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: T.spacing.px3, paddingHorizontal: T.spacing.page,
    backgroundColor: 'rgba(10,10,12,0.95)',
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: T.radii.full,
    backgroundColor: T.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  pips: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  pip: { height: 5, borderRadius: T.radii.full },
  pipInactive: { width: 14, backgroundColor: T.colors.bg3 },
  pipActive: { width: 22, backgroundColor: T.colors.forge },
  pipDone: { width: 14, backgroundColor: T.colors.forgeDim },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: T.spacing.px3, paddingVertical: 6,
    backgroundColor: T.colors.forgeDim,
    borderRadius: T.radii.xl,
  },
  timerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.colors.forge },
  timerText: { fontSize: T.typography.sizes.bodyS, fontWeight: '700', color: T.colors.forge, fontFamily: T.typography.families.mono },

  content: { padding: T.spacing.page },
  exerciseTitle: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1, marginBottom: T.spacing.px5 },

  // Exercise block
  exerciseBlock: {
    backgroundColor: T.colors.bg1,
    borderRadius: T.radii.xl, borderWidth: 0.5, borderColor: T.colors.b1,
    overflow: 'hidden', marginBottom: T.spacing.px5,
  },
  exName: { fontSize: T.typography.sizes.body, fontWeight: '700', color: T.colors.t1, padding: T.spacing.px4, paddingBottom: T.spacing.px3 },

  // Table
  tableHeader: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
    backgroundColor: 'rgba(10,10,12,0.4)',
  },
  colHead: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t3, textTransform: 'uppercase', letterSpacing: 0.6 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: T.colors.b1 },
  rowDone: { backgroundColor: T.colors.forgeDim },

  cell: { fontSize: T.typography.sizes.bodyS, fontWeight: '500', color: T.colors.t1 },

  inputCell: {
    backgroundColor: T.colors.bg2,
    borderRadius: T.radii.sm, height: 34,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 3,
    borderWidth: 1, borderColor: 'transparent',
  },
  inputCellDone: { borderColor: 'rgba(255,92,46,0.3)' },
  inputCellText: { fontSize: T.typography.sizes.body, fontWeight: '600', color: T.colors.t1 },

  checkBtn: {
    width: 28, height: 28, borderRadius: T.radii.full,
    backgroundColor: T.colors.bg3,
    borderWidth: 1.5, borderColor: T.colors.b1,
    alignItems: 'center', justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: T.colors.forge,
    borderColor: T.colors.forge,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },

  addSetBtn: {
    paddingVertical: 14, alignItems: 'center',
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
  },
  addSetText: { fontSize: T.typography.sizes.bodyS, fontWeight: '600', color: T.colors.forge },

  // Rest Timer
  restTimerFloat: {
    position: 'absolute',
    bottom: 100, left: T.spacing.px4, right: T.spacing.px4,
    zIndex: 20,
  },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: T.spacing.page, paddingBottom: 36,
    backgroundColor: T.colors.bg0,
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
  },
});
