import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, Clock } from 'lucide-react-native';
import { useWorkouts } from '../hooks/useWorkouts';
import dayjs from 'dayjs';
import { ForgeTheme } from '../constants/ForgeTheme';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams();
  const { workouts, saveWorkout } = useWorkouts();
  
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [workoutTitle, setWorkoutTitle] = useState('CUSTOM WORKOUT');
  
  // Track exercises state
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      if (id) {
        const existing = workouts.find(w => w.id === id);
        if (existing) {
          setWorkoutTitle(existing.notes || 'SCHEDULED ROUTINE');
          // Map to local UI state
          setExercises(existing.exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets.map((s, idx) => ({ id: idx, weight: s.weight.toString(), reps: s.reps.toString(), done: false }))
          })));
        }
      } else {
        // Blank Template
        setExercises([
          { name: 'Add Exercise...', sets: [{ id: 1, weight: '0', reps: '0', done: false }] }
        ]);
      }
      setIsLoaded(true);
    }
  }, [id, workouts, isLoaded]);

  const heartbeat = useSharedValue(1);
  React.useEffect(() => {
    heartbeat.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1.0, { duration: 150 }),
        withTiming(1.2, { duration: 150 }),
        withTiming(1.0, { duration: 550 })
      ),
      -1,
      false
    );
  }, []);

  const heartbeatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartbeat.value }]
  }));

  useEffect(() => {
    let interval: any;
    if (isResting && restTime > 0) {
      interval = setInterval(() => setRestTime(t => t - 1), 1000);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      Alert.alert("Rest Complete", "Back to work!");
      setRestTime(60);
    }
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  useEffect(() => {
    // Workout timer
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSet = (exIdx: number, setIdx: number) => {
    const newExercises = [...exercises];
    const isDone = newExercises[exIdx].sets[setIdx].done;
    newExercises[exIdx].sets[setIdx].done = !isDone;
    setExercises(newExercises);
    
    if (!isDone && !isResting) {
      setIsResting(true);
      setRestTime(60);
    }
  };

  const finishWorkout = async () => {
    try {
      await saveWorkout({
        id: id ? (id as string) : `workout_${Date.now()}`,
        date: date ? (date as string) : dayjs().format('YYYY-MM-DD'),
        exercises: exercises.map(ex => ({
          exerciseId: 'custom',
          name: ex.name,
          sets: ex.sets.filter((s: any) => s.done).map((s: any) => ({ weight: Number(s.weight), reps: Number(s.reps) }))
        })),
        durationMin: Math.floor(timer / 60),
        calories: 300, // mock calculation
        notes: workoutTitle
      });
      Alert.alert("Great Job!", "Workout saved to your history.");
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save workout");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>CURRENT WORKOUT</Text>
          <Text style={styles.title}>{workoutTitle}</Text>
        </View>
        <Text style={styles.timer}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</Text>
      </View>

      {isResting && (
        <View style={styles.restTimerContainer}>
          <View style={styles.restBanner}>
            <Animated.View style={heartbeatStyle}>
              <Clock size={20} color={ForgeTheme.colors.forge} />
            </Animated.View>
            <Text style={styles.restText}>00:{restTime.toString().padStart(2, '0')}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsResting(false)} style={styles.skipButton}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {exercises.map((ex, exIdx) => (
          <View key={exIdx} style={styles.exerciseCard}>
            <Text style={styles.exName}>{ex.name.toUpperCase()}</Text>
            
            <View style={styles.tableHeader}>
              <Text style={styles.colSet}>SET</Text>
              <Text style={styles.colKg}>LBS</Text>
              <Text style={styles.colReps}>REPS</Text>
              <Text style={styles.colCheck}>DONE</Text>
            </View>

            {ex.sets.map((set: any, setIdx: number) => (
              <View key={setIdx} style={[styles.row, set.done && styles.rowDone]}>
                <Text style={styles.colSetValue}>{setIdx + 1}</Text>
                <TextInput style={[styles.input, styles.colKgValue]} keyboardType="numeric" defaultValue={set.weight} onChangeText={t => { const e = [...exercises]; e[exIdx].sets[setIdx].weight = t; setExercises(e); }} />
                <TextInput style={[styles.input, styles.colRepsValue]} keyboardType="numeric" defaultValue={set.reps} onChangeText={t => { const e = [...exercises]; e[exIdx].sets[setIdx].reps = t; setExercises(e); }} />
                <View style={styles.colCheckValue}>
                  <TouchableOpacity 
                    style={[styles.checkBtn, set.done && styles.checkBtnDone]} 
                    onPress={() => toggleSet(exIdx, setIdx)}
                  >
                    <Check size={16} color={set.done ? '#FFF' : 'transparent'} strokeWidth={4} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {/* Add Set Button */}
            <TouchableOpacity 
              style={styles.addSetBtn} 
              onPress={() => {
                const e = [...exercises];
                const lastSet = e[exIdx].sets[e[exIdx].sets.length - 1];
                e[exIdx].sets.push({ id: e[exIdx].sets.length + 1, weight: lastSet ? lastSet.weight : '0', reps: lastSet ? lastSet.reps : '0', done: false });
                setExercises(e);
              }}
            >
              <Text style={styles.addSetText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.finishBtn} onPress={finishWorkout}>
        <Text style={styles.finishText}>FINISH WORKOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ForgeTheme.colors.bg0, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 },
  subtitle: { color: ForgeTheme.colors.t3, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: ForgeTheme.colors.t1, letterSpacing: -0.5 },
  timer: { fontSize: 24, fontWeight: '700', color: ForgeTheme.colors.forge },
  
  restTimerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginBottom: 16, backgroundColor: ForgeTheme.colors.bg1, padding: 16, borderRadius: 16, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1 },
  restBanner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restText: { color: ForgeTheme.colors.t1, fontWeight: '700', fontSize: 24, letterSpacing: 1 },
  skipButton: { backgroundColor: ForgeTheme.colors.bg2, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  skipText: { color: ForgeTheme.colors.t1, fontWeight: '600', fontSize: 12, letterSpacing: 1 },

  content: { padding: 20, paddingBottom: 100 },
  exerciseCard: { backgroundColor: ForgeTheme.colors.bg1, borderRadius: 16, marginBottom: 24, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1, overflow: 'hidden' },
  exName: { fontSize: 14, fontWeight: '700', color: ForgeTheme.colors.t1, padding: 16, paddingBottom: 12, letterSpacing: 0.5 },
  
  tableHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: ForgeTheme.colors.b1, backgroundColor: 'rgba(10, 10, 11, 0.5)' },
  colSet: { flex: 1, fontSize: 10, fontWeight: '600', color: ForgeTheme.colors.t3, textAlign: 'center', letterSpacing: 1 },
  colKg: { flex: 2, fontSize: 10, fontWeight: '600', color: ForgeTheme.colors.t3, textAlign: 'center', letterSpacing: 1 },
  colReps: { flex: 2, fontSize: 10, fontWeight: '600', color: ForgeTheme.colors.t3, textAlign: 'center', letterSpacing: 1 },
  colCheck: { flex: 1, fontSize: 10, fontWeight: '600', color: ForgeTheme.colors.t3, textAlign: 'center', letterSpacing: 1 },
  
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: ForgeTheme.colors.b1 },
  rowDone: { backgroundColor: 'rgba(255,92,46,0.05)' },
  
  colSetValue: { flex: 1, fontWeight: '600', color: ForgeTheme.colors.t2, textAlign: 'center', fontSize: 14 },
  colKgValue: { flex: 2, textAlign: 'center', color: ForgeTheme.colors.t1, fontWeight: '700', fontSize: 16 },
  colRepsValue: { flex: 2, textAlign: 'center', color: ForgeTheme.colors.t1, fontWeight: '700', fontSize: 16 },
  colCheckValue: { flex: 1, alignItems: 'center' },
  
  input: { backgroundColor: 'transparent', marginHorizontal: 4 },
  checkBtn: { width: 30, height: 30, backgroundColor: ForgeTheme.colors.bg2, borderRadius: 8, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1, alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: { backgroundColor: ForgeTheme.colors.forge, borderColor: ForgeTheme.colors.forge, shadowColor: ForgeTheme.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },

  addSetBtn: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 0.5, borderTopColor: ForgeTheme.colors.b1 },
  addSetText: { color: ForgeTheme.colors.t2, fontSize: 12, fontWeight: '600' },

  finishBtn: { backgroundColor: ForgeTheme.colors.forge, margin: 24, padding: 16, borderRadius: 12, alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 },
  finishText: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 1 }
});
