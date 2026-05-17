import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useWorkouts } from '../../../hooks/useWorkouts';
import { useRoutines } from '../../../hooks/useRoutines';
import { ExerciseState, NumpadTarget } from '../types';

export function useActiveSession(id?: string | string[], date?: string | string[], routineId?: string | string[]) {
  const router = useRouter();
  const { workouts, saveWorkout } = useWorkouts();
  const { routines } = useRoutines();

  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [totalRestTime] = useState(60);
  const [workoutTitle, setWorkoutTitle] = useState('Custom Workout');
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Numpad state
  const [numpadVisible, setNumpadVisible] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState<NumpadTarget>(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [numpadLabel, setNumpadLabel] = useState('Log Value');

  // Load initial data
  useEffect(() => {
    if (isLoaded) return;
    
    // Helper to find previous set stats
    const getPrev = (exName: string, setIdx: number) => {
      // Find the most recent workout that contains this exercise
      const past = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      for (const w of past) {
        const loggedEx = w.exercises.find(e => e.name === exName);
        if (loggedEx && loggedEx.sets[setIdx]) {
          return `${loggedEx.sets[setIdx].weight} x ${loggedEx.sets[setIdx].reps}`;
        }
      }
      return '—';
    };

    if (id && typeof id === 'string') {
      const existing = workouts.find(w => w.id === id);
      if (existing) {
        setWorkoutTitle(existing.notes || 'Scheduled Routine');
        setExercises(existing.exercises.map((ex, i) => ({
          name: ex.name,
          sets: ex.sets.map((s, idx) => ({
            id: idx,
            prev: getPrev(ex.name, idx),
            weight: s.weight.toString(),
            reps: s.reps.toString(),
            done: false,
          })),
        })));
      }
    } else if (routineId && typeof routineId === 'string') {
      const routine = routines.find(r => r.id === routineId);
      if (routine) {
        setWorkoutTitle(routine.name);
        setExercises(routine.exercises.map((ex) => ({
          name: ex.name,
          sets: Array.from({ length: ex.sets }).map((_, idx) => ({
            id: idx + 1,
            prev: getPrev(ex.name, idx),
            weight: '',
            reps: ex.reps.toString(),
            done: false,
          })),
        })));
      }
    } else {
      setExercises([{ 
        name: 'Bench Press (Barbell)', 
        sets: [
          { id: 1, prev: getPrev('Bench Press (Barbell)', 0), weight: '', reps: '', done: false },
          { id: 2, prev: getPrev('Bench Press (Barbell)', 1), weight: '', reps: '', done: false },
        ] 
      }]);
    }
    setIsLoaded(true);
  }, [id, routineId, workouts, routines, isLoaded]);

  // General Timer
  useEffect(() => {
    if (!workoutStarted) return;
    const iv = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [workoutStarted]);

  // Rest Countdown
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
    
    // Spec: Does NOT auto-start the rest timer.
  };

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

  const removeSet = (exIdx: number, setIdx: number) => {
    const copy = [...exercises];
    copy[exIdx].sets.splice(setIdx, 1);
    setExercises(copy);
  };

  const selectPreset = (exIdx: number, sets: number, reps: number) => {
    const copy = [...exercises];
    copy[exIdx].sets = Array.from({ length: sets }).map((_, i) => ({
      id: i + 1,
      prev: '—',
      weight: '',
      reps: reps.toString(),
      done: false
    }));
    setExercises(copy);

    // Feature 5: Rest Timer Auto-Duration Based on Preset
    let duration = 90; // default hypertrophy
    if (reps <= 5) duration = 180; // volume/heavy strength
    else if (reps <= 8) duration = 120; // strength/power
    
    setRestTime(duration);
    // Note: totalRestTime is not used as a state setter currently, we can just use restTime for the ring max
  };

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

  const finishWorkout = async () => {
    const mins = Math.floor(timer / 60);
    try {
      await saveWorkout({
        id: (id && typeof id === 'string') ? id : `workout_${Date.now()}`,
        date: (date && typeof date === 'string') ? date : dayjs().format('YYYY-MM-DD'),
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

  const totalExercises = exercises.length;
  const doneExercises = exercises.filter(ex => ex.sets.every(s => s.done)).length;
  const timerLabel = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`;
  
  const allSetsComplete = useMemo(() => {
    if (exercises.length === 0) return false;
    return exercises.every(ex => ex.sets.every(s => s.done));
  }, [exercises]);

  // Feature 4: Volume Tracker
  const volumeStats = useMemo(() => {
    let vol = 0;
    let completedSets = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.done) {
          completedSets++;
          vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }
      });
    });
    return { volume: vol, completedSets };
  }, [exercises]);

  // Feature 1: Personal Records (PR) Mapping
  const personalRecords = useMemo(() => {
    const prs: Record<string, Record<string, number>> = {};
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        if (!prs[ex.name]) prs[ex.name] = {};
        ex.sets.forEach(s => {
          if (s.weight > (prs[ex.name][s.reps.toString()] || 0)) {
            prs[ex.name][s.reps.toString()] = s.weight;
          }
        });
      });
    });
    return prs;
  }, [workouts]);

  return {
    workoutStarted, setWorkoutStarted,
    timer, timerLabel, isResting, isPaused, restTime, totalRestTime,
    workoutTitle, exercises, numpadVisible, numpadValue, numpadLabel,
    doneExercises, totalExercises, currentExerciseIndex, setCurrentExerciseIndex,
    allSetsComplete, volumeStats, personalRecords,
    setNumpadValue, setNumpadVisible, setIsResting, setRestTime, setIsPaused,
    toggleSet, addSet, removeSet, selectPreset, openNumpad, commitNumpad, finishWorkout
  };
}
