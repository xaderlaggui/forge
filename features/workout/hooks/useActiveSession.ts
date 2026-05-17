import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useWorkouts } from '../../../hooks/useWorkouts';
import { ExerciseState, NumpadTarget } from '../types';

export function useActiveSession(id?: string | string[], date?: string | string[]) {
  const router = useRouter();
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

  // Load initial data
  useEffect(() => {
    if (isLoaded) return;
    if (id && typeof id === 'string') {
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
      setExercises([{ 
        name: 'Bench Press (Barbell)', 
        sets: [
          { id: 1, prev: '—', weight: '', reps: '', done: false },
          { id: 2, prev: '—', weight: '', reps: '', done: false },
        ] 
      }]);
    }
    setIsLoaded(true);
  }, [id, workouts, isLoaded]);

  // General Timer
  useEffect(() => {
    const iv = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

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
    if (!copy[exIdx].sets[setIdx].done) return;
    
    // Trigger rest timer
    setIsResting(true);
    setIsPaused(false);
    setRestTime(60);
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

  return {
    timer, timerLabel, isResting, isPaused, restTime, totalRestTime,
    workoutTitle, exercises, numpadVisible, numpadValue, numpadLabel,
    doneExercises, totalExercises,
    setNumpadValue, setNumpadVisible, setIsResting, setRestTime, setIsPaused,
    toggleSet, addSet, openNumpad, commitNumpad, finishWorkout
  };
}
