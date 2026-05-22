import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { Activity, AlertTriangle, CalendarDays, ChevronLeft, Plus, Target, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ForgeButton } from '../components/forge/ForgeButton';
import { ExerciseLibrary } from '../features/planner/components/ExerciseLibrary';
import { WeeklyCalendar } from '../features/planner/components/WeeklyCalendar';
import { useExercises } from '../hooks/useExercises';
import { GeneratedPlan, generateWorkoutPlanOnly } from '../services/GeneratorEngine';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { ActivityLevel, calculateNutritionTargets, Goal } from '../utils/nutritionEngine';

export default function PlanGeneratorScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: dbExercises = [] } = useExercises();

  // -- Form State --
  const [goal, setGoal] = useState<Goal>('maintain');
  const [activity, setActivity] = useState<ActivityLevel>('active');
  const [days, setDays] = useState<3 | 4 | 5 | 6>(4);
  const [injuries, setInjuries] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // -- Preview State --
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Week days for WeeklyCalendar component mapping
  const weekDays = useMemo(() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const todayPH = new Date(utc + (3600000 * 8)); // UTC+8

    const dayOfWeek = todayPH.getDay();
    const currentIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(todayPH);
    startOfWeek.setDate(todayPH.getDate() - currentIdx);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const label = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
      const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return {
        label,
        date: d.getDate(),
        fullDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayName: fullNames[i]
      };
    });
  }, []);

  const handleGenerate = async () => {
    if (!user?.uid) return;
    setIsGenerating(true);

    try {
      const weightLbs = (user as any)?.weight || 175;
      const heightCm = (user as any)?.height || 170;
      const age = (user as any)?.age || 25;
      const nutritionTargets = calculateNutritionTargets(weightLbs, 175, 30, 'male', activity, goal);

      // Generate the dynamic AI workout plan
      const generated = await generateWorkoutPlanOnly({
        uid: user.uid,
        weightKg: weightLbs / 2.20462,
        heightCm: heightCm,
        ageYears: age,
        fitnessGoal: goal,
        dietPreference: 'anything', // Not used for workout only
        equipmentAccess: 'full',
        experienceLevel: 'Intermediate',
        daysPerWeek: days,
        customGoals: injuries ? [`Injuries/Limitations: ${injuries}`] : []
      });

      // Also set nutrition targets locally on profile (optional but good practice)
      await supabase.from('profiles').update({ targets_nutrition: nutritionTargets }).eq('id', user.uid);

      setPlan(generated);
    } catch (err: any) {
      Alert.alert('Error Generating Plan', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddExercise = (exercise: any) => {
    if (!plan) return;
    const currentDayName = weekDays[activeDayIdx].dayName;

    const updatedWeek = plan.workoutWeek.map(dayObj => {
      if (dayObj.day === currentDayName) {
        return {
          ...dayObj,
          exercises: [...dayObj.exercises, { name: exercise.name, sets: 3, reps: '8-12', restSec: 90 }]
        };
      }
      return dayObj;
    });

    setPlan({ ...plan, workoutWeek: updatedWeek });
    setShowPicker(false);
  };

  const handleRemoveExercise = (exIndex: number) => {
    if (!plan) return;
    const currentDayName = weekDays[activeDayIdx].dayName;

    const updatedWeek = plan.workoutWeek.map(dayObj => {
      if (dayObj.day === currentDayName) {
        return {
          ...dayObj,
          exercises: dayObj.exercises.filter((_, i) => i !== exIndex)
        };
      }
      return dayObj;
    });

    setPlan({ ...plan, workoutWeek: updatedWeek });
  };

  const handleSaveToDatabase = async () => {
    if (!plan || !user?.uid) return;
    setIsSaving(true);
    try {
      const dateKey = dayjs().format('YYYY-MM-DD');

      const { error } = await supabase.from('generated_workout_plan_weekly').upsert({
        user_id: user.uid,
        date: dateKey,
        plan: plan,
        saved_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

      if (error) throw error;

      // Invalidate the activeWorkoutPlan query so the Planner instantly updates
      await queryClient.invalidateQueries({ queryKey: ['activeWorkoutPlan', user.uid] });

      Alert.alert('Plan Applied!', 'Your dynamic routine is now active in the Planner.', [
        { text: 'Awesome', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderOption = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      style={[s.optionCard, isSelected && s.optionCardActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[s.optionText, isSelected && s.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  // --- PREVIEW RENDER ---
  if (plan) {
    const currentDayName = weekDays[activeDayIdx].dayName;
    const currentDayPlan = plan.workoutWeek.find(d => d.day === currentDayName);
    const isRest = !currentDayPlan || currentDayPlan.exercises.length === 0;

    return (
      <View style={s.container}>
        <View style={[s.header, { paddingBottom: 8 }]}>
          <TouchableOpacity onPress={() => setPlan(null)} style={s.backBtn}>
            <ChevronLeft color={T.colors.t1} size={24} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Review Schedule</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, backgroundColor: T.colors.bg0 }}>
          <WeeklyCalendar
            days={weekDays}
            activeDayIdx={activeDayIdx}
            onSelectDay={setActiveDayIdx}
          />
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.colors.t1 }}>
              {currentDayName}
            </Text>
            <Text style={{ fontSize: 14, color: T.colors.forge, fontWeight: '700', marginTop: 4 }}>
              {currentDayPlan?.focus || 'Active Recovery / Rest'}
            </Text>
          </View>

          {isRest ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>Rest day! Enjoy your recovery.</Text>
            </View>
          ) : (
            currentDayPlan.exercises.map((ex, i) => (
              <View key={i} style={s.exCard}>
                <View style={s.exIconWrap}>
                  <Text style={s.exInitial}>{ex.name.substring(0, 3).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.exName}>{ex.name}</Text>
                  <Text style={s.exMeta}>{ex.sets} Sets • {ex.reps}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveExercise(i)} style={{ padding: 8 }}>
                  <X size={18} color={T.colors.t3} />
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity style={s.addBtn} onPress={() => setShowPicker(true)}>
            <Plus size={20} color={T.colors.forge} />
            <Text style={s.addBtnText}>Add Exercise</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={s.footer}>
          <ForgeButton
            label="Apply to Planner"
            onPress={handleSaveToDatabase}
            loading={isSaving}
            pulse
          />
        </View>

        {/* Exercise Picker Modal */}
        <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPicker(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg0 }}>
            <View style={[s.header, { paddingTop: 16 }]}>
              <TouchableOpacity onPress={() => setShowPicker(false)} style={s.iconBtn}>
                <X size={24} color={T.colors.t1} />
              </TouchableOpacity>
              <Text style={s.headerTitle}>Select Exercise</Text>
              <View style={{ width: 40 }} />
            </View>
            <ExerciseLibrary exercises={[]} isLoading={false} onSelect={handleAddExercise} />
          </SafeAreaView>
        </Modal>
      </View>
    );
  }

  // --- FORM RENDER ---
  return (
    <View style={s.container}>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} bounces={false}>

        <View style={s.hero}>
          <Text style={s.heroTitle}>Build Your Routine</Text>
          <Text style={s.heroSubtitle}>Let the AI pick specific exercises from the library tailored to your goals.</Text>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Target size={18} color={T.colors.t2} />
            <Text style={s.sectionTitle}>Primary Goal</Text>
          </View>
          <View style={s.row}>
            {renderOption('Shred Fat', goal === 'cut', () => setGoal('cut'))}
            {renderOption('Recomp', goal === 'maintain', () => setGoal('maintain'))}
            {renderOption('Build Muscle', goal === 'bulk', () => setGoal('bulk'))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Activity size={18} color={T.colors.t2} />
            <Text style={s.sectionTitle}>Daily Activity Level</Text>
          </View>
          <View style={s.row}>
            {renderOption('Desk Job', activity === 'sedentary', () => setActivity('sedentary'))}
            {renderOption('Light Activity', activity === 'light', () => setActivity('light'))}
          </View>
          <View style={s.row}>
            {renderOption('Active', activity === 'active', () => setActivity('active'))}
            {renderOption('Very Active', activity === 'very_active', () => setActivity('very_active'))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <CalendarDays size={18} color={T.colors.t2} />
            <Text style={s.sectionTitle}>Training Frequency</Text>
          </View>
          <View style={s.freqRow}>
            {[3, 4, 5, 6].map(num => (
              <TouchableOpacity
                key={num}
                style={[s.freqCircle, days === num && s.freqCircleActive]}
                onPress={() => setDays(num as any)}
              >
                <Text style={[s.freqText, days === num && s.freqTextActive]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <AlertTriangle size={18} color={T.colors.t2} />
            <Text style={s.sectionTitle}>Injuries or Limitations (Optional)</Text>
          </View>
          <TextInput
            style={s.textarea}
            value={injuries}
            onChangeText={setInjuries}
            placeholder="e.g. bad lower back, shoulder impingement..."
            placeholderTextColor={T.colors.t3}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

      </ScrollView>

      <View style={s.footer}>
        <ForgeButton
          label="Generate AI Routine"
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
    paddingTop: 50, paddingBottom: 10, paddingHorizontal: T.spacing.page,
    backgroundColor: T.colors.bg1,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: { padding: 4, marginLeft: -4 },
  iconBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: T.typography.sizes.h3, fontWeight: '700', color: T.colors.t1 },

  scroll: { flex: 1 },
  content: { padding: T.spacing.page, paddingBottom: 100 },

  hero: { alignItems: 'center', marginVertical: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: T.colors.t1, marginTop: 30, marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: T.colors.t2, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: T.colors.t2, textTransform: 'uppercase', letterSpacing: 1 },
  hintText: { fontSize: 13, color: T.colors.t3, marginBottom: 16 },

  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  optionCard: {
    flex: 1, backgroundColor: T.colors.bg2, borderRadius: T.radii.lg,
    paddingVertical: 12, paddingHorizontal: 12,
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
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: T.colors.bg2, borderWidth: 1, borderColor: T.colors.b1,
    alignItems: 'center', justifyContent: 'center'
  },
  freqCircleActive: {
    backgroundColor: T.colors.forge,
    borderColor: T.colors.forge,
  },
  freqText: { fontSize: 24, fontWeight: '700', color: T.colors.t2 },
  freqTextActive: { color: '#000000' },

  textarea: {
    backgroundColor: T.colors.bg2,
    borderRadius: T.radii.lg,
    borderWidth: 1,
    borderColor: T.colors.b1,
    padding: 12,
    fontSize: 15,
    color: T.colors.t1,
    minHeight: 150,
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: T.colors.bg1,
    padding: T.spacing.page, paddingBottom: 40,
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10,
  },

  // Preview Styles
  exCard: {
    backgroundColor: T.colors.bg1, ...T.shadows.lift, borderRadius: 16,
    padding: 16, borderWidth: 0.5, borderColor: T.colors.b1,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginBottom: 12,
  },
  exIconWrap: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
  },
  exInitial: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: T.colors.forge },
  exName: { fontSize: 15, fontWeight: '700', color: T.colors.t1 },
  exMeta: { fontSize: 12, fontWeight: '600', color: T.colors.t3, marginTop: 4 },

  emptyState: { padding: 40, alignItems: 'center', backgroundColor: T.colors.bg2, borderRadius: 16, marginBottom: 12 },
  emptyText: { color: T.colors.t3, fontWeight: '600' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: T.colors.forgeDim, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,92,46,0.3)', marginTop: 8
  },
  addBtnText: { fontSize: 15, fontWeight: '700', color: T.colors.forge }
});
