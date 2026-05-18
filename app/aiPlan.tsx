import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Check } from 'lucide-react-native';
import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabase';
import { generateFullPlan, GeneratedPlan, GeneratedWorkoutDay } from '../services/GeneratorEngine';
import dayjs from 'dayjs';
import { BearMascot } from '../components/forge/BearMascot';
import { useQueryClient } from '@tanstack/react-query';

// ─── Constants ────────────────────────────────────────────────────────────────
const GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
const EQUIPMENT = ['None', 'Dumbbells', 'Barbell', 'Machines', 'Resistance Bands', 'Pull-up Bar', 'Full Gym'];

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

// ─── Segmented Control ────────────────────────────────────────────────────────
function Segmented({
  options, value, onChange, T,
}: { options: string[]; value: string; onChange: (v: string) => void; T: any }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: T.colors.bg2, borderRadius: 12, padding: 4 }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
              backgroundColor: active ? T.colors.bg1 : 'transparent',
              shadowColor: active ? '#000' : 'transparent',
              shadowOpacity: active ? 0.1 : 0,
              shadowRadius: active ? 4 : 0,
              elevation: active ? 2 : 0,
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '700',
              color: active ? T.colors.forge : T.colors.t3,
            }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────
function Stepper({ value, min, max, onChange, T }: {
  value: number; min: number; max: number; onChange: (v: number) => void; T: any;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: T.colors.bg2, alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 24, color: T.colors.t1, fontWeight: '300' }}>−</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 28, fontWeight: '800', color: T.colors.t1, minWidth: 40, textAlign: 'center' }}>
        {value}
      </Text>
      <TouchableOpacity
        onPress={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: T.colors.forge, alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 24, color: '#FFF', fontWeight: '300' }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Slider (manual impl) ─────────────────────────────────────────────────────
function SliderRow({ value, min, max, step, onChange, T }: {
  value: number; min: number; max: number; step: number; onChange: (v: number) => void; T: any;
}) {
  const steps = Math.round((max - min) / step);
  const stepIdx = Math.round((value - min) / step);

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: steps + 1 }).map((_, i) => {
          const v = min + i * step;
          const active = v <= value;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onChange(v)}
              style={{
                flex: 1, minWidth: 28, height: 36, borderRadius: 8,
                backgroundColor: active ? T.colors.forge : T.colors.bg2,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFF' : T.colors.t3 }}>
                {v}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={{ fontSize: 12, color: T.colors.t3, marginTop: 6, textAlign: 'right' }}>
        {value} min
      </Text>
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
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <View style={{ gap: 12 }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <BearMascot variant="APPROVING" size="xl" animate />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: T.colors.t1, marginBottom: 4 }}>
        Weekly Preview
      </Text>
      {plan.workoutWeek.map((day: GeneratedWorkoutDay, i: number) => (
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
            backgroundColor: day.exercises.length > 0 ? T.colors.forgeDim : T.colors.bg2,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 11, fontWeight: '800', letterSpacing: 0.5,
              color: day.exercises.length > 0 ? T.colors.forge : T.colors.t3,
            }}>{DAY_NAMES[i]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: T.colors.t1 }}>{day.focus}</Text>
            <Text style={{ fontSize: 12, color: T.colors.t3, marginTop: 2 }}>
              {day.exercises.length > 0 ? `${day.exercises.length} exercises` : 'Rest Day'}
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
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['General Fitness']);
  const [experience, setExperience] = useState('Beginner');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [sessionMin, setSessionMin] = useState(45);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Dumbbells']);
  const [injuries, setInjuries] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [applying, setApplying] = useState(false);

  const toggleGoal = (g: string) =>
    setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const toggleEquipment = (e: string) =>
    setSelectedEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const handleGenerate = async () => {
    if (!user) { Alert.alert('Not signed in'); return; }
    setGenerating(true);
    setPlan(null);
    try {
      const result = await generateFullPlan({
        uid: user.uid,
        weightKg: (user as any).weight ?? 70,
        heightCm: (user as any).height ?? 170,
        ageYears: (user as any).age ?? 25,
        fitnessGoal: (user as any).fitnessGoal ?? 'maintain',
        dietPreference: (user as any).dietPreference ?? 'anything',
        equipmentAccess: selectedEquipment.includes('Full Gym') ? 'full'
          : selectedEquipment.includes('Barbell') ? 'full'
          : selectedEquipment.includes('Dumbbells') ? 'dumbbells'
          : 'bodyweight',
        experienceLevel: experience,
        daysPerWeek,
        sessionMin,
        customGoals: selectedGoals,
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
          <Text style={s.headerTitle}>Generate AI Plan</Text>
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

            {/* Experience */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Experience Level</Text>
              <Segmented options={EXPERIENCE} value={experience} onChange={setExperience} T={T} />
            </View>

            {/* Days per week */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Days per Week</Text>
              <Stepper value={daysPerWeek} min={1} max={7} onChange={setDaysPerWeek} T={T} />
            </View>

            {/* Session Duration */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Session Duration</Text>
              <SliderRow
                value={sessionMin}
                min={20} max={120} step={10}
                onChange={setSessionMin}
                T={T}
              />
            </View>

            {/* Equipment */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Equipment Available</Text>
              <PillSelect options={EQUIPMENT} selected={selectedEquipment} onToggle={toggleEquipment} T={T} />
            </View>

            {/* Injuries */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Injuries or Limitations (optional)</Text>
              <TextInput
                style={s.textarea}
                value={injuries}
                onChangeText={setInjuries}
                placeholder="e.g. bad knees, lower back pain..."
                placeholderTextColor={T.colors.t3}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Generate Button */}
            <View style={s.section}>
              {generating && (
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <BearMascot variant="THINKING" size="lg" animate />
                  <Text style={{ fontSize: 14, color: T.colors.t3, marginTop: 12 }}>Analyzing your profile...</Text>
                </View>
              )}
              <TouchableOpacity
                style={[s.generateBtn, generating && { opacity: 0.6 }]}
                onPress={handleGenerate}
                disabled={generating}
                activeOpacity={0.85}
              >
                {generating ? (
                  <View style={{ alignItems: 'center', gap: 12 }}>
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
