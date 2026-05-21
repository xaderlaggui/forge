import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { calculateBMI } from '../utils/bmi';
import { useAuthStore } from '../stores/authStore';
import { useForgeTheme } from '@/hooks/useForgeTheme';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SpriteMascot } from '../components/forge/SpriteMascot';
import { onboardingSpriteSequence } from '../features/sprites/OnboardingSpriteSequence';

export default function PersonalizeModal() {
  const { T } = useForgeTheme();
  const styles = useStyles(T);
  const router = useRouter();
  
  const spriteConfig = onboardingSpriteSequence.getSpriteForStep(4);
  
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
      
      // Navigate back to tabs
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
      
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const goals = [
    { id: 'cut', label: 'Cut (Lose Fat)' },
    { id: 'maintain', label: 'Maintain' },
    { id: 'bulk', label: 'Bulk (Build Muscle)' }
  ] as const;

  const diets = [
    { id: 'anything', label: 'Anything' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'keto', label: 'Keto' }
  ] as const;

  const equipments = [
    { id: 'full', label: 'Full Gym' },
    { id: 'dumbbells', label: 'Dumbbells Only' },
    { id: 'bodyweight', label: 'Bodyweight' }
  ] as const;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <TouchableOpacity style={{ marginBottom: 16 }} activeOpacity={0.8} onPress={() => alert(spriteConfig.messageSuggestion)}>
            <SpriteMascot spriteId={spriteConfig.spriteId} animation={spriteConfig.animation} size="lg" />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome to FORGE</Text>
          <Text style={styles.subtitle}>Let's calibrate your profile so our AI can build your perfect baseline.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Physical Stats</Text>
          
          <View style={styles.row}>
            <View style={styles.inputGroupFlex}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="28"
                placeholderTextColor={T.colors.t3}
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroupFlex}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                placeholderTextColor={T.colors.t3}
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="70"
              placeholderTextColor={T.colors.t3}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              maxLength={5}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Your Preferences</Text>
          
          <View style={styles.pickerGroup}>
            <Text style={styles.label}>Primary Goal</Text>
            <View style={styles.pillRow}>
              {goals.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.pill, fitnessGoal === g.id && styles.pillActive]}
                  onPress={() => setFitnessGoal(g.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, fitnessGoal === g.id && styles.pillTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerGroup}>
            <Text style={styles.label}>Dietary Preference</Text>
            <View style={styles.pillRow}>
              {diets.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.pill, dietPreference === d.id && styles.pillActive]}
                  onPress={() => setDietPreference(d.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, dietPreference === d.id && styles.pillTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerGroup}>
            <Text style={styles.label}>Equipment Access</Text>
            <View style={styles.pillRow}>
              {equipments.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.pill, equipmentAccess === e.id && styles.pillActive]}
                  onPress={() => setEquipmentAccess(e.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, equipmentAccess === e.id && styles.pillTextActive]}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCompleteSetup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Start My Journey</Text>
                <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 60, paddingTop: 40 },
  header: { marginBottom: 32, alignItems: 'center' },
  iconBadge: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,92,46,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,92,46,0.2)'
  },
  title: { fontSize: 28, fontWeight: '900', color: T.colors.t1, marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: T.colors.t2, lineHeight: 22, textAlign: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: T.colors.bg1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.colors.b1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.colors.t1, marginBottom: 20, letterSpacing: 0.3 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  inputGroupFlex: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: T.colors.t3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: T.colors.bg2,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '500',
    color: T.colors.t1,
    borderWidth: 1,
    borderColor: T.colors.b1,
  },
  pickerGroup: { marginBottom: 24 },
  pillRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: T.colors.bg2,
    borderWidth: 1,
    borderColor: T.colors.b1,
  },
  pillActive: {
    backgroundColor: 'rgba(255,92,46,0.15)',
    borderColor: T.colors.forge,
  },
  pillText: { fontSize: 14, fontWeight: '600', color: T.colors.t2 },
  pillTextActive: { color: T.colors.forge },
  button: {
    backgroundColor: T.colors.forge,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
