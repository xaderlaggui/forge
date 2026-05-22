import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { AlertTriangle, Apple, Target } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BearMascot } from '../components/forge/BearMascot';
import { ForgeButton } from '../components/forge/ForgeButton';
import { WeeklyCalendar } from '../features/planner/components/WeeklyCalendar';
import { GeneratedPlan, generateMealPlanOnly } from '../services/GeneratorEngine';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

// Removed PillSelect// ─── AI Rationale Card ────────────────────────────────────────────────────────
function CoachMessageCard({ message, T }: { message: string, T: any }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: T.colors.bg1, ...T.shadows.lift,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: T.colors.b1,
      marginBottom: 24,
      shadowColor: T.colors.forge,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    }}>
      <View style={{
        width: 90,
        backgroundColor: T.colors.forgeDim,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 16
      }}>
        <BearMascot variant="SMUG" size="xl" style={{ position: 'absolute', bottom: -30, left: -70 }} />
      </View>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: T.colors.forge, marginBottom: 6 }}>Coach AI</Text>
        <Text numberOfLines={8} style={{ fontSize: 13, color: T.colors.t1, lineHeight: 20, fontWeight: '500' }}>{message}</Text>
      </View>
    </View>
  );
}

// ─── Generated Plan Preview ───────────────────────────────────────────────────
function PlanPreview({ plan, onApply, onSaveDraft, isApplying, T }: {
  plan: GeneratedPlan;
  onApply: () => void;
  onSaveDraft: () => void;
  isApplying: boolean;
  T: any;
}) {
  const [selectedDayIdx, setSelectedDayIdx] = React.useState(0);
  const isWeekly = Array.isArray(plan.mealPlan.days) && plan.mealPlan.days.length > 0;
  const days = isWeekly ? plan.mealPlan.days : [{ dayOfWeek: 'Preview', meals: plan.mealPlan.meals }];
  const currentDay = days?.[selectedDayIdx];

  return (
    <View style={{ gap: 12 }}>
      {plan.coachMessage && (
        <CoachMessageCard message={plan.coachMessage} T={T} />
      )}
      {isWeekly && (
        <WeeklyCalendar
          days={plan.mealPlan.days.map((d: any, idx: number) => {
            const dateObj = dayjs().startOf('week').add(1, 'day').add(idx, 'day');
            return {
              label: d.dayOfWeek.substring(0, 3),
              date: dateObj.date(),
              fullDate: dateObj.format('YYYY-MM-DD'),
            };
          })}
          activeDayIdx={selectedDayIdx}
          onSelectDay={setSelectedDayIdx}
        />
      )}

      <Text style={{ fontSize: 18, fontWeight: '800', color: T.colors.t1, marginBottom: 4 }}>
        Meal Plan Preview ({currentDay?.dayOfWeek})
      </Text>
      <Text style={{ fontSize: 14, color: T.colors.t2, marginBottom: 8, fontWeight: '600' }}>
        Targets: {plan.mealPlan.targetCalories} kcal • {plan.mealPlan.targetProtein}g P • {plan.mealPlan.targetCarbs}g C • {plan.mealPlan.targetFat}g F
      </Text>
      {(currentDay?.meals || []).map((meal: any, i: number) => (
        <View
          key={i}
          style={{
            backgroundColor: T.colors.bg1, ...T.shadows.lift, borderRadius: 14,
            padding: 16, borderWidth: 0.5, borderColor: T.colors.b1,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}
        >
          <View style={{
            width: 44, height: 44, borderRadius: 10,
            backgroundColor: T.colors.forgeDim,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 11, fontWeight: '800', letterSpacing: 0.5,
              color: T.colors.forge,
            }}>{meal.name.substring(0, 3).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: T.colors.t1 }}>{meal.name}</Text>
            <Text style={{ fontSize: 13, color: T.colors.t2, marginTop: 2, lineHeight: 18 }}>
              {meal.description}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: T.colors.t3, marginTop: 4 }}>
              {meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
            </Text>
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <TouchableOpacity
          onPress={onSaveDraft}
          style={{
            flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
            backgroundColor: T.colors.bg2, borderWidth: 1, borderColor: T.colors.b1,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: T.colors.t1 }}>Save as Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onApply}
          disabled={isApplying}
          style={{
            flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
            backgroundColor: T.colors.forge, opacity: isApplying ? 0.6 : 1,
          }}
        >
          {isApplying
            ? <ActivityIndicator color="#000" />
            : <Text style={{ fontSize: 15, fontWeight: '800', color: '#000' }}>Apply to Planner</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AIPlanScreen() {
  const router = useRouter();
  const { T } = useForgeTheme();
  const s = useStyles(T);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Form state
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Maintain']);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['Anything']);
  const [allergies, setAllergies] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [applying, setApplying] = useState(false);

  const toggleGoal = (g: string) => setSelectedGoals([g]);

  const toggleDiet = (d: string) => setSelectedDiets([d]);

  const handleGenerate = async () => {
    if (!user) { Alert.alert('Not signed in'); return; }
    setGenerating(true);
    setPlan(null);
    try {
      const result = await generateMealPlanOnly({
        uid: user.uid,
        weightKg: (user as any).weight ?? 70,
        heightCm: (user as any).height ?? 170,
        ageYears: (user as any).age ?? 25,
        fitnessGoal: selectedGoals.includes('Bulking') ? 'bulk'
          : selectedGoals.includes('Lean Bulking') ? 'bulk'
            : selectedGoals.includes('Diet (Weight Loss)') ? 'cut'
              : 'maintain',
        dietPreference: selectedDiets.includes('Vegan') ? 'vegan'
          : selectedDiets.includes('Keto') ? 'keto'
            : 'anything',
        equipmentAccess: 'full', // Not needed for meal plans
        customGoals: [...selectedGoals, ...selectedDiets, ...(allergies ? [`Allergies/Restrictions: ${allergies}`] : [])],
      });
      setPlan(result);
    } catch (e: any) {
      Alert.alert('Generation Failed', e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = async () => {
    if (!plan || !user) return;
    setApplying(true);
    try {
      const { error } = await supabase.from('generated_meal_plan_weekly').upsert({
        user_id: user.uid,
        date: dayjs().format('YYYY-MM-DD'),
        plan: plan,
        saved_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });
      if (error) throw error;

      // Invalidate the activeMealPlan query so the Dashboard and Planner instantly update
      await queryClient.invalidateQueries({ queryKey: ['activeMealPlan', user.uid] });

      Alert.alert('Plan Activated!', 'Your personalized plan is now live in the Planner.', [
        { text: "Let's go!", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setApplying(false);
    }
  };

  const handleSaveDraft = () => {
    Alert.alert('Saved', 'Your plan has been saved as a draft.');
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

  return (
    <View style={s.container}>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {!plan ? (
          <>
            <View style={s.hero}>
              <Text style={s.heroTitle}>Build Your Meal Plan</Text>
              <Text style={s.heroSubtitle}>Let the AI craft a personalized nutrition strategy based on your stats.</Text>
            </View>

            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Target size={18} color={T.colors.t2} />
                <Text style={s.sectionTitle}>Primary Goal</Text>
              </View>
              <View style={s.row}>
                {renderOption('Diet (Weight Loss)', selectedGoals.includes('Diet (Weight Loss)'), () => toggleGoal('Diet (Weight Loss)'))}
                {renderOption('Maintain', selectedGoals.includes('Maintain'), () => toggleGoal('Maintain'))}
              </View>
              <View style={s.row}>
                {renderOption('Lean Bulking', selectedGoals.includes('Lean Bulking'), () => toggleGoal('Lean Bulking'))}
                {renderOption('Bulking', selectedGoals.includes('Bulking'), () => toggleGoal('Bulking'))}
              </View>
            </View>

            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Apple size={18} color={T.colors.t2} />
                <Text style={s.sectionTitle}>Dietary Preferences</Text>
              </View>
              <View style={s.row}>
                {renderOption('Anything', selectedDiets.includes('Anything'), () => toggleDiet('Anything'))}
                {renderOption('High Protein', selectedDiets.includes('High Protein'), () => toggleDiet('High Protein'))}
              </View>
              <View style={s.row}>
                {renderOption('Vegan', selectedDiets.includes('Vegan'), () => toggleDiet('Vegan'))}
                {renderOption('Vegetarian', selectedDiets.includes('Vegetarian'), () => toggleDiet('Vegetarian'))}
                {renderOption('Keto', selectedDiets.includes('Keto'), () => toggleDiet('Keto'))}
              </View>
            </View>

            <View style={s.section}>
              <View style={s.sectionHeader}>
                <AlertTriangle size={18} color={T.colors.t2} />
                <Text style={s.sectionTitle}>Allergies or Restrictions (Optional)</Text>
              </View>
              <TextInput
                style={s.textarea}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="e.g. peanut allergy, lactose intolerant..."
                placeholderTextColor={T.colors.t3}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </>
        ) : (
          <PlanPreview
            plan={plan}
            onApply={handleApply}
            onSaveDraft={handleSaveDraft}
            isApplying={applying}
            T={T}
          />
        )}
      </ScrollView>

      {!plan && (
        <View style={s.footer}>
          <ForgeButton
            label="Generate AI Meal Plan"
            onPress={handleGenerate}
            loading={generating}
            pulse
          />
        </View>
      )}
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 10, paddingHorizontal: T.spacing.page,
    backgroundColor: T.colors.bg1,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: T.typography.sizes.h3, fontWeight: '700', color: T.colors.t1 },

  scroll: { flex: 1 },
  content: { padding: T.spacing.page, paddingBottom: 100 },

  hero: { alignItems: 'center', marginVertical: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: T.colors.t1, marginTop: 30, marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: T.colors.t2, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: T.colors.t2, textTransform: 'uppercase', letterSpacing: 1 },

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
  }
});
