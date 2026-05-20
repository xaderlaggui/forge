import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { calculateBMI } from '../../utils/bmi';
import { useAuthStore } from '../../stores/authStore';
import { useForgeTheme } from '@/hooks/useForgeTheme';

export default function OnboardingScreen() {
  const { T } = useForgeTheme();
  const styles = useStyles(T);
  const router = useRouter();
  const [age, setAge] = useState('');
  const [height, setHeight] = useState(''); // cm
  const [weight, setWeight] = useState(''); // kg
  const [loading, setLoading] = useState(false);
  
  // AI Generator Preferences
  const [fitnessGoal, setFitnessGoal] = useState<'cut'|'maintain'|'bulk'>('maintain');
  const [dietPreference, setDietPreference] = useState<'anything'|'vegan'|'keto'>('anything');
  const [equipmentAccess, setEquipmentAccess] = useState<'full'|'dumbbells'|'bodyweight'>('full');

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
      const { bmi } = calculateBMI(weightNum, heightNum);
      const weightLbs = Math.round(weightNum * 2.20462);
      const updates = {
        age: ageNum,
        height: heightNum,
        weight: weightNum,
        bmi,
        fitness_goal: fitnessGoal,
        diet_preference: dietPreference,
        equipment_access: equipmentAccess,
        bmi_history: [{ value: bmi, date: new Date().toISOString() }],
        weight_history: [{ value: weightLbs, date: new Date().toISOString() }],
        is_onboarded: true,
      };
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.uid);
      if (error) throw error;
      setUser({ ...user, ...updates, isOnboarded: true } as any);
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Preferences</Text>
          <Text style={styles.sectionSubtitle}>Help us tailor your AI-generated workouts and meals.</Text>
        </View>

        {/* Goal Selection */}
        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Primary Goal</Text>
          <View style={styles.pillRow}>
            {(['cut', 'maintain', 'bulk'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.pill, fitnessGoal === g && styles.pillActive]}
                onPress={() => setFitnessGoal(g)}
              >
                <Text style={[styles.pillText, fitnessGoal === g && styles.pillTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Diet Selection */}
        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Dietary Preference</Text>
          <View style={styles.pillRow}>
            {(['anything', 'vegan', 'keto'] as const).map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.pill, dietPreference === d && styles.pillActive]}
                onPress={() => setDietPreference(d)}
              >
                <Text style={[styles.pillText, dietPreference === d && styles.pillTextActive]}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment Selection */}
        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Equipment Access</Text>
          <View style={styles.pillRow}>
            {(['full', 'dumbbells', 'bodyweight'] as const).map(e => (
              <TouchableOpacity
                key={e}
                style={[styles.pill, equipmentAccess === e && styles.pillActive]}
                onPress={() => setEquipmentAccess(e)}
              >
                <Text style={[styles.pillText, equipmentAccess === e && styles.pillTextActive]}>
                  {e === 'full' ? 'Full Gym' : e.charAt(0).toUpperCase() + e.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
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

const useStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: T.colors.t1, marginBottom: 8 },
  subtitle: { fontSize: 16, color: T.colors.t3, lineHeight: 24 },
  form: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: T.colors.t3, marginBottom: 8 },
  input: {
    backgroundColor: T.colors.bg2,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: T.colors.t1,
    borderWidth: 0.5,
    borderColor: T.colors.b1,
  },
  sectionHeader: { marginTop: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: T.colors.t1, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: T.colors.t3 },
  pickerGroup: { marginBottom: 24 },
  pillRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: T.colors.bg2,
    borderWidth: 1,
    borderColor: T.colors.b1,
  },
  pillActive: {
    backgroundColor: T.colors.forge,
    borderColor: T.colors.forge,
  },
  pillText: { fontSize: 14, fontWeight: '600', color: T.colors.t3 },
  pillTextActive: { color: '#fff' },
  button: {
    backgroundColor: T.colors.forge, // Our primary color
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
