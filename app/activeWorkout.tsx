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
import { ForgeTheme } from '../constants/ForgeTheme';

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
          <ChevronLeft size={20} color={ForgeTheme.colors.t2} />
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
          <Text style={styles.timerText}>{timerLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Exercise title ── */}
        <Text style={styles.exerciseTitle}>{workoutTitle}</Text>

        {/* ── Sets table per exercise ── */}
        {exercises.map((ex, exIdx) => (
          <View key={exIdx} style={styles.exerciseBlock}>
            <Text style={styles.exName}>{ex.name}</Text>

            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colHead, { flex: 0.6 }]}>SET</Text>
              <Text style={[styles.colHead, { flex: 1.4 }]}>PREVIOUS</Text>
              <Text style={[styles.colHead, { flex: 1 }]}>LBS</Text>
              <Text style={[styles.colHead, { flex: 1 }]}>REPS</Text>
              <Text style={[styles.colHead, { flex: 0.6, textAlign: 'center' }]}>✓</Text>
            </View>

            {/* Set rows */}
            {ex.sets.map((set, setIdx) => (
              <View
                key={setIdx}
                style={[styles.row, set.done && styles.rowDone, setIdx < ex.sets.length - 1 && styles.rowBorder]}
              >
                <Text style={[styles.cell, { flex: 0.6, color: ForgeTheme.colors.t2 }]}>{setIdx + 1}</Text>
                <Text style={[styles.cell, { flex: 1.4, color: ForgeTheme.colors.t3, fontSize: 12 }]} numberOfLines={1}>{set.prev}</Text>

                <TouchableOpacity
                  style={[styles.inputCell, { flex: 1 }, set.done && styles.inputCellDone]}
                  onPress={() => openNumpad(exIdx, setIdx, 'weight')}
                >
                  <Text style={styles.inputCellText}>{set.weight || '—'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.inputCell, { flex: 1 }, set.done && styles.inputCellDone]}
                  onPress={() => openNumpad(exIdx, setIdx, 'reps')}
                >
                  <Text style={styles.inputCellText}>{set.reps || '—'}</Text>
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
              <Text style={styles.addSetText}>+ Add Set</Text>
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
        <TouchableOpacity style={styles.finishBtn} onPress={finishWorkout} activeOpacity={0.85}>
          <Text style={styles.finishText}>FINISH WORKOUT</Text>
        </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: ForgeTheme.colors.bg0 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: 'rgba(10,10,11,0.95)',
    borderBottomWidth: 0.5, borderBottomColor: ForgeTheme.colors.b1,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ForgeTheme.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  pips: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  pip: { height: 5, borderRadius: 3 },
  pipInactive: { width: 14, backgroundColor: ForgeTheme.colors.bg3 },
  pipActive: { width: 22, backgroundColor: ForgeTheme.colors.forge },
  pipDone: { width: 14, backgroundColor: ForgeTheme.colors.forge, opacity: 0.5 },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,92,46,0.1)',
    borderRadius: 20,
  },
  timerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ForgeTheme.colors.forge },
  timerText: { fontSize: 13, fontWeight: '700', color: ForgeTheme.colors.forge },

  content: { padding: 20 },
  exerciseTitle: { fontSize: 24, fontWeight: '700', color: ForgeTheme.colors.t1, marginBottom: 20 },

  // Exercise block
  exerciseBlock: {
    backgroundColor: ForgeTheme.colors.bg1,
    borderRadius: 20, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1,
    overflow: 'hidden', marginBottom: 20,
  },
  exName: { fontSize: 15, fontWeight: '700', color: ForgeTheme.colors.t1, padding: 16, paddingBottom: 12 },

  // Table
  tableHeader: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: ForgeTheme.colors.b1,
    backgroundColor: 'rgba(10,10,11,0.4)',
  },
  colHead: { fontSize: 10, fontWeight: '600', color: ForgeTheme.colors.t3, textTransform: 'uppercase', letterSpacing: 0.6 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: ForgeTheme.colors.b1 },
  rowDone: { backgroundColor: 'rgba(255,92,46,0.04)' },

  cell: { fontSize: 13, fontWeight: '500', color: ForgeTheme.colors.t1 },

  inputCell: {
    backgroundColor: ForgeTheme.colors.bg2,
    borderRadius: 10, height: 34,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 3,
    borderWidth: 1, borderColor: 'transparent',
  },
  inputCellDone: { borderColor: 'rgba(255,92,46,0.3)' },
  inputCellText: { fontSize: 14, fontWeight: '600', color: ForgeTheme.colors.t1 },

  checkBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: ForgeTheme.colors.bg3,
    borderWidth: 1.5, borderColor: ForgeTheme.colors.b1,
    alignItems: 'center', justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: ForgeTheme.colors.forge,
    borderColor: ForgeTheme.colors.forge,
    shadowColor: ForgeTheme.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },

  addSetBtn: {
    paddingVertical: 14, alignItems: 'center',
    borderTopWidth: 0.5, borderTopColor: ForgeTheme.colors.b1,
  },
  addSetText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,92,46,0.8)' },

  // Rest Timer
  restTimerFloat: {
    position: 'absolute',
    bottom: 100, left: 16, right: 16,
    zIndex: 20,
  },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36,
    backgroundColor: ForgeTheme.colors.bg0,
    borderTopWidth: 0.5, borderTopColor: ForgeTheme.colors.b1,
  },
  finishBtn: {
    backgroundColor: ForgeTheme.colors.forge,
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: ForgeTheme.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 6,
  },
  finishText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
});
