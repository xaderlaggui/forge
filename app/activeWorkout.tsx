import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60); // 60s rest
  
  // Basic mock exercises for the active logger
  const exercises = [
    { name: 'Barbell Squat', sets: [{ weight: '60', reps: '10', done: false }, { weight: '60', reps: '10', done: false }] },
    { name: 'Push-up', sets: [{ weight: '0', reps: '15', done: false }] }
  ];

  // Timer logic
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

  const toggleSet = () => {
    if (!isResting) {
      setIsResting(true);
    }
  };

  const finishWorkout = () => {
    Alert.alert("Great Job!", "Workout saved to Firestore.");
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upper Body Power</Text>
        <Text style={styles.timer}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</Text>
      </View>

      {isResting && (
        <View style={styles.restBanner}>
          <Text style={styles.restText}>Resting... {restTime}s</Text>
          <TouchableOpacity onPress={() => setIsResting(false)} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {exercises.map((ex, exIdx) => (
          <View key={exIdx} style={styles.exerciseCard}>
            <Text style={styles.exName}>{ex.name}</Text>
            
            <View style={styles.tableHeader}>
              <Text style={styles.colSet}>SET</Text>
              <Text style={styles.colKg}>KG</Text>
              <Text style={styles.colReps}>REPS</Text>
              <Text style={styles.colCheck}>✓</Text>
            </View>

            {ex.sets.map((set, setIdx) => (
              <View key={setIdx} style={styles.row}>
                <Text style={styles.colSet}>{setIdx + 1}</Text>
                <TextInput style={[styles.input, styles.colKg]} keyboardType="numeric" defaultValue={set.weight} />
                <TextInput style={[styles.input, styles.colReps]} keyboardType="numeric" defaultValue={set.reps} />
                <TouchableOpacity style={styles.checkBtn} onPress={toggleSet}>
                  <Text style={styles.checkIcon}>✓</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.finishBtn} onPress={finishWorkout}>
        <Text style={styles.finishText}>Finish Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  timer: { fontSize: 20, fontWeight: '600', color: '#C15A28' },
  
  restBanner: { backgroundColor: '#4CAF50', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  skipButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  skipText: { color: '#fff', fontWeight: 'bold' },

  content: { padding: 16 },
  exerciseCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  exName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
  tableHeader: { flexDirection: 'row', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  colSet: { flex: 1, fontWeight: 'bold', color: '#666', textAlign: 'center' },
  colKg: { flex: 2, textAlign: 'center', color: '#666', fontWeight: 'bold' },
  colReps: { flex: 2, textAlign: 'center', color: '#666', fontWeight: 'bold' },
  colCheck: { flex: 1, textAlign: 'center', color: '#666', fontWeight: 'bold' },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 8, marginHorizontal: 4 },
  checkBtn: { flex: 1, backgroundColor: '#E0E0E0', borderRadius: 8, height: 36, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  checkIcon: { color: '#fff', fontWeight: 'bold' },

  finishBtn: { backgroundColor: '#C15A28', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  finishText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
