import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BearMascot } from '../components/forge/BearMascot';
import { GeneratedPlan, generateMealPlanOnly } from '../services/GeneratorEngine';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const GOALS = ['Diet (Weight Loss)', 'Maintain', 'Lean Bulking', 'Bulking'];
const DIET_PREFS = ['Anything', 'Vegan', 'Vegetarian', 'Keto', 'High Protein'];

// ─── Pill Multi-Select ────────────────────────────────────────────────────────
function PillSelect({
  options, selected, onToggle, accent, T,
}: { options: string[]; selected: string[]; onToggle: (v: string) => void; accent?: boolean; T: any }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onToggle(opt)}
            style={{
              paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100,
              backgroundColor: active ? T.colors.forge : T.colors.bg2,
              borderWidth: 1, borderColor: active ? T.colors.forge : T.colors.b1,
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '700',
              color: active ? '#FFF' : T.colors.t2,
            }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}



// ─── AI Rationale Card ────────────────────────────────────────────────────────
function CoachMessageCard({ message, T }: { message: string, T: any }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: T.colors.bg1,
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
        <Text style={{ fontSize: 13, color: T.colors.t1, lineHeight: 20, fontWeight: '500' }}>{message}</Text>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {plan.mealPlan.days.map((d: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedDayIdx(idx)}
              style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8,
                backgroundColor: selectedDayIdx === idx ? T.colors.forge : T.colors.bg2,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: selectedDayIdx === idx ? '#000' : T.colors.t2 }}>
                {d.dayOfWeek.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
            backgroundColor: T.colors.bg1, borderRadius: 14,
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
      const { error } = await supabase.from('generated_plans').upsert({
        user_id: user.uid,
        date: dayjs().format('YYYY-MM-DD'),
        plan: plan,
        saved_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });
      if (error) throw error;

      // Invalidate the activePlan query so the Dashboard and Planner instantly update
      await queryClient.invalidateQueries({ queryKey: ['activePlan', user.uid] });

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

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color={T.colors.forge} />
          <Text style={s.headerTitle}>Generate Weekly Plan</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {!plan ? (
          <>
            {/* Goal */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Goal</Text>
              <PillSelect options={GOALS} selected={selectedGoals} onToggle={toggleGoal} T={T} />
            </View>

            {/* Dietary Preferences */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Dietary Preferences</Text>
              <PillSelect options={DIET_PREFS} selected={selectedDiets} onToggle={toggleDiet} T={T} />
            </View>

            {/* Allergies */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Allergies or Restrictions (optional)</Text>
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

            {/* Generate Button */}
            <View style={s.section}>
              <TouchableOpacity
                style={[s.generateBtn, generating && { opacity: 0.6 }]}
                onPress={handleGenerate}
                disabled={generating}
                activeOpacity={0.85}
              >
                {generating ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <ActivityIndicator color="#000" />
                    <Text style={s.generateBtnText}>Building your plan with AI...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Sparkles size={20} color="#000" />
                    <Text style={s.generateBtnText}>Generate Plan</Text>
                  </View>
                )}
              </TouchableOpacity>
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

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: T.colors.bg1, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: T.colors.t1, paddingBottom: 8 },
  content: { padding: 20, paddingBottom: 40 },

  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: T.colors.t3, letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 12,
  },
  textarea: {
    backgroundColor: T.colors.bg1, borderRadius: 14,
    borderWidth: 0.5, borderColor: T.colors.b1,
    padding: 14, fontSize: 15, color: T.colors.t1,
    minHeight: 90,
  },
  generateBtn: {
    backgroundColor: T.colors.forge, paddingVertical: 18,
    borderRadius: 16, alignItems: 'center',
    shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  generateBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
});
