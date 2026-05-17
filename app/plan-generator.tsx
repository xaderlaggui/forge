import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import { ForgeButton } from '../components/forge/ForgeButton';
import { calculateNutritionTargets, Goal, ActivityLevel } from '../utils/nutritionEngine';
import { generateWeeklySchedule } from '../utils/workoutEngine';
import { ChevronLeft, Zap, Target, Activity, CalendarDays } from 'lucide-react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";

export default function PlanGeneratorScreen() {
    const { T } = useForgeTheme();
    const s = useS(T);
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [goal, setGoal] = useState<Goal>('maintain');
  const [activity, setActivity] = useState<ActivityLevel>('active');
  const [days, setDays] = useState<3|4|5|6>(4);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!user?.uid) return;
    setIsGenerating(true);

    try {
      // 1. Run Nutrition Engine (assuming weight is in user profile, fallback to 175)
      const weightLbs = (user as any)?.weight || 175;
      const nutritionTargets = calculateNutritionTargets(weightLbs, 175, 30, 'male', activity, goal);

      // 2. Run Workout Engine
      const weeklySchedule = generateWeeklySchedule(days);

      // 3. Save to Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'targets.nutrition': nutritionTargets,
        'targets.workoutSplit': `${days}_DAY_SPLIT`,
        'plan.weeklySchedule': weeklySchedule,
      });

      // 4. Success & Redirect
      Alert.alert('Plan Generated!', 'Your new PPL split and Macro targets have been locked in.', [
        { text: 'Let\'s Go!', onPress: () => router.back() }
      ]);

    } catch (err: any) {
      Alert.alert('Error Generating Plan', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderOption = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity 
      style={[useS.optionCard, isSelected && useS.optionCardActive]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[useS.optionText, isSelected && useS.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={useS.container}>
      {/* Header */}
      <View style={useS.header}>
        <TouchableOpacity onPress={() => router.back()} style={useS.backBtn}>
          <ChevronLeft color={T.colors.t1} size={24} />
        </TouchableOpacity>
        <Text style={useS.headerTitle}>AI Plan Generator</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={useS.scroll} contentContainerStyle={useS.content}>
        
        <View style={useS.hero}>
          <Zap size={48} color={T.colors.forge} />
          <Text style={useS.heroTitle}>Build Your Routine</Text>
          <Text style={useS.heroSubtitle}>Let the algorithm construct your optimal PPL split and calculate your exact macros.</Text>
        </View>

        {/* GOAL */}
        <View style={useS.section}>
          <View style={useS.sectionHeader}>
            <Target size={18} color={T.colors.t2} />
            <Text style={useS.sectionTitle}>Primary Goal</Text>
          </View>
          <View style={useS.row}>
            {renderOption('Shred Fat (Cut)', goal === 'cut', () => setGoal('cut'))}
            {renderOption('Recomp (Maintain)', goal === 'maintain', () => setGoal('maintain'))}
            {renderOption('Build Muscle (Bulk)', goal === 'bulk', () => setGoal('bulk'))}
          </View>
        </View>

        {/* ACTIVITY */}
        <View style={useS.section}>
          <View style={useS.sectionHeader}>
            <Activity size={18} color={T.colors.t2} />
            <Text style={useS.sectionTitle}>Daily Activity Level</Text>
          </View>
          <View style={useS.row}>
            {renderOption('Desk Job (Sedentary)', activity === 'sedentary', () => setActivity('sedentary'))}
            {renderOption('Light Activity', activity === 'light', () => setActivity('light'))}
          </View>
          <View style={useS.row}>
            {renderOption('Active (10k Steps)', activity === 'active', () => setActivity('active'))}
            {renderOption('Very Active (Manual Labor)', activity === 'very_active', () => setActivity('very_active'))}
          </View>
        </View>

        {/* FREQUENCY */}
        <View style={useS.section}>
          <View style={useS.sectionHeader}>
            <CalendarDays size={18} color={T.colors.t2} />
            <Text style={useS.sectionTitle}>Training Frequency</Text>
          </View>
          <Text style={useS.hintText}>How many days per week can you realistically hit the gym?</Text>
          <View style={useS.freqRow}>
            {[3, 4, 5, 6].map(num => (
              <TouchableOpacity 
                key={num}
                style={[useS.freqCircle, days === num && useS.freqCircleActive]}
                onPress={() => setDays(num as any)}
              >
                <Text style={[useS.freqText, days === num && useS.freqTextActive]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Sticky Footer CTA */}
      <View style={useS.footer}>
        <ForgeButton 
          label="Generate My Plan"
          onPress={handleGenerate}
          loading={isGenerating}
          pulse
        />
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
          container: { flex: 1, backgroundColor: T.colors.bg0 },
          header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 60, paddingBottom: 16, paddingHorizontal: T.spacing.page,
            backgroundColor: T.colors.bg1,
            borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
          },
          backBtn: { padding: 4, marginLeft: -4 },
          headerTitle: { fontSize: T.typography.sizes.h3, fontWeight: '700', color: T.colors.t1 },
          
          scroll: { flex: 1 },
          content: { padding: T.spacing.page, paddingBottom: 100 },
          
          hero: { alignItems: 'center', marginVertical: 32 },
          heroTitle: { fontSize: 28, fontWeight: '800', color: T.colors.t1, marginTop: 16, marginBottom: 8 },
          heroSubtitle: { fontSize: 15, color: T.colors.t2, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

          section: { marginBottom: 32 },
          sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
          sectionTitle: { fontSize: 14, fontWeight: '700', color: T.colors.t2, textTransform: 'uppercase', letterSpacing: 1 },
          hintText: { fontSize: 13, color: T.colors.t3, marginBottom: 16 },

          row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
          optionCard: {
            flex: 1, backgroundColor: T.colors.bg2, borderRadius: T.radii.lg,
            paddingVertical: 16, paddingHorizontal: 12,
            borderWidth: 1, borderColor: T.colors.b1,
            alignItems: 'center', justifyContent: 'center',
          },
          optionCardActive: {
            backgroundColor: T.colors.forgeDim,
            borderColor: T.colors.forge,
          },
          optionText: { fontSize: 14, fontWeight: '600', color: T.colors.t2, textAlign: 'center' },
          optionTextActive: { color: T.colors.forge },

          freqRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
          freqCircle: {
            width: 60, height: 60, borderRadius: 30,
            backgroundColor: T.colors.bg2, borderWidth: 1, borderColor: T.colors.b1,
            alignItems: 'center', justifyContent: 'center'
          },
          freqCircleActive: {
            backgroundColor: T.colors.forge,
            borderColor: T.colors.forge,
          },
          freqText: { fontSize: 24, fontWeight: '700', color: T.colors.t2 },
          freqTextActive: { color: '#000000' },

          footer: {
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: T.spacing.page, paddingBottom: 40,
            backgroundColor: T.colors.bg1,
            borderTopWidth: 0.5, borderTopColor: T.colors.b1,
          }
        });
