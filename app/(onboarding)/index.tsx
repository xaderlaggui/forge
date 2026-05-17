import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { calculateBMI } from '../../utils/bmi';
import { useAuthStore } from '../../stores/authStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [height, setHeight] = useState(''); // cm
  const [weight, setWeight] = useState(''); // kg
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuthStore();

  const handleCompleteSetup = async () => {
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || !heightNum || !weightNum) {
      Alert.alert('Missing Info', 'Please fill out all fields with valid numbers.');
      return;
    }

    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Calculate BMI
      const { bmi } = calculateBMI(weightNum, heightNum);

      // Update Firestore document
      const userRef = doc(db, 'users', user.uid);
      const updates = {
        age: ageNum,
        height: heightNum,
        weight: weightNum,
        bmi: bmi,
        // Also initialize bmiHistory with the first entry
        bmiHistory: [{ value: bmi, date: new Date().toISOString() }],
        isOnboarded: true // We can use this to track completion
      };
      
      await updateDoc(userRef, updates);

      // Update local state so _layout.tsx doesn't boot us back
      setUser({ ...user, ...updates } as any);

      // Navigate to the main app!
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Let's personalize</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself so we can calculate your starting BMI and set your baseline.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 28"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 175"
              keyboardType="decimal-pad"
              value={height}
              onChangeText={setHeight}
              maxLength={5}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 70"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              maxLength={5}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCompleteSetup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 24 },
  form: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#C15A28', // Our primary color
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
