import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUpCircle, ArrowDownCircle, PersonStanding, Check, AlertTriangle, Plus, X } from 'lucide-react-native';
import { ForgeTheme as T } from '../constants/ForgeTheme';
import { useRoutines } from '../hooks/useRoutines';
import { ExercisePickerModal } from '../components/forge/ExercisePickerModal';

type SplitType = 'push' | 'pull' | 'legs' | 'full';

const SPLITS = {
  push: { label: 'PUSH', cls: 'push', icon: ArrowUpCircle, color: '#FF5C2E', hint: 'Chest · Shoulders · Triceps', exercises: ['Bench Press (Barbell)', 'Overhead Press (Dumbbell)', 'Lateral Raises', 'Tricep Pushdown'] },
  pull: { label: 'PULL', cls: 'pull', icon: ArrowDownCircle, color: '#0A84FF', hint: 'Back · Biceps · Rear Delt', exercises: ['Barbell Row', 'Pull-ups', 'Face Pulls', 'Bicep Curl (Dumbbell)'] },
  legs: { label: 'LEGS', cls: 'legs', icon: PersonStanding, color: '#30D158', hint: 'Quads · Hamstrings · Calves', exercises: ['Squat (Barbell)', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] },
  full: { label: 'FULL BODY', cls: 'full', icon: PersonStanding, color: '#BF5AF2', hint: 'All muscle groups', exercises: ['Bench Press (Barbell)', 'Barbell Row', 'Squat (Barbell)', 'Overhead Press (Dumbbell)'] }
};

const OVERLAPS: Record<string, string[]> = {
  push: ['Bench Press (Barbell)+Incline DB Press', 'Overhead Press (Dumbbell)+Arnold Press', 'Cable Flyes+Chest Flyes'],
  pull: ['Pull-ups+Lat Pulldown', 'Bicep Curls+Hammer Curls'],
  legs: ['Squat (Barbell)+Leg Press'],
  full: []
};

const PRESETS = ['3×8', '3×10', '3×12', '4×8', '5×5'];

interface ExData {
  name: string;
  preset: string;
}

export default function BuildRoutineScreen() {
  const router = useRouter();
  const { saveRoutine } = useRoutines();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [split, setSplit] = useState<SplitType>('push');
  const [exercises, setExercises] = useState<ExData[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const overlapWarning = useMemo(() => {
    if (!split) return null;
    const pairs = OVERLAPS[split] || [];
    for (const pair of pairs) {
      const [a, b] = pair.split('+');
      if (exercises.find(x => x.name === a) && exercises.find(x => x.name === b)) {
        return `"${a}" and "${b}" target the same muscles. Consider removing one to avoid redundancy.`;
      }
    }
    return null;
  }, [exercises, split]);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) return Alert.alert('Missing Name', 'Please name your routine.');
      // Auto-populate based on split if exercises are empty
      if (exercises.length === 0) {
        setExercises(SPLITS[split].exercises.map(name => ({ name, preset: '3×10' })));
      }
      setStep(2);
    } else if (step === 2) {
      if (exercises.length === 0) return Alert.alert('No Exercises', 'Please add at least one exercise.');
      setStep(3);
    }
  };

  const handleSave = async () => {
    const formattedExercises = exercises.map(ex => {
      const parts = ex.preset.split('×');
      return {
        name: ex.name,
        sets: Number(parts[0]) || 3,
        reps: Number(parts[1]) || 10,
        preset: ex.preset
      };
    });

    await saveRoutine({
      id: `routine_${Date.now()}`,
      name: name.trim() || 'My Routine',
      split,
      exercises: formattedExercises
    });
    
    router.back();
  };

  const setPreset = (idx: number, preset: string) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, preset } : ex));
  };

  const removeEx = (idx: number) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <X size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={s.title}>CREATE ROUTINE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.stepDots}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[s.dot, step === i && s.dotActive, step > i && s.dotDone]} />
          ))}
        </View>

        {step === 1 && (
          <View>
            <Text style={s.stepLabel}>STEP 1 OF 3 — NAME & SPLIT</Text>
            
            <Text style={s.fieldLabel}>ROUTINE NAME</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. My Push Day"
              placeholderTextColor={T.colors.t3}
              value={name}
              onChangeText={setName}
            />

            <Text style={s.fieldLabel}>CHOOSE SPLIT TYPE</Text>
            <View style={s.splitGrid}>
              {(Object.keys(SPLITS) as SplitType[]).map(key => {
                const sp = SPLITS[key];
                const Icon = sp.icon;
                const active = split === key;
                return (
                  <TouchableOpacity 
                    key={key} 
                    style={[s.splitCard, active && { backgroundColor: sp.color + '18', borderColor: sp.color }]}
                    onPress={() => setSplit(key)}
                    activeOpacity={0.7}
                  >
                    <Icon size={24} color={active ? sp.color : T.colors.t2} style={{ marginBottom: 6 }} />
                    <Text style={[s.scName, active && { color: sp.color }]}>{sp.label}</Text>
                    <Text style={s.scHint}>{sp.hint}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
              <Text style={s.nextBtnText}>Next Step →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={s.stepLabel}>STEP 2 OF 3 — EXERCISES</Text>
            
            {overlapWarning && (
              <View style={s.warnCard}>
                <AlertTriangle size={16} color="#FFD60A" style={{ marginTop: 2 }} />
                <Text style={s.warnText}>{overlapWarning}</Text>
              </View>
            )}

            <Text style={s.fieldLabel}>{SPLITS[split].label} EXERCISES</Text>
            
            {exercises.map((ex, idx) => (
              <View key={idx} style={s.exItem}>
                <View style={s.exItemTop}>
                  <Text style={s.exItemName}>{ex.name}</Text>
                  <TouchableOpacity onPress={() => removeEx(idx)} style={{ padding: 4 }}>
                    <X size={16} color={T.colors.t3} />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.presetRow}>
                  {PRESETS.map(p => (
                    <TouchableOpacity 
                      key={p} 
                      style={[s.presetPill, ex.preset === p && s.presetPillOn]}
                      onPress={() => setPreset(idx, p)}
                    >
                      <Text style={[s.presetPillText, ex.preset === p && { color: '#FF5C2E' }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}

            <TouchableOpacity style={s.addExBtn} onPress={() => setPickerVisible(true)}>
              <Plus size={16} color={T.colors.forge} strokeWidth={3} />
              <Text style={s.addExText}>Add Exercise</Text>
            </TouchableOpacity>

            <View style={s.navRow}>
              <TouchableOpacity style={s.navBack} onPress={() => setStep(1)}>
                <Text style={s.navBackText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.navNext} onPress={handleNext}>
                <Text style={s.navNextText}>Review →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={s.stepLabel}>STEP 3 OF 3 — REVIEW & SAVE</Text>

            <Text style={s.fieldLabel}>ROUTINE DETAILS</Text>
            <View style={s.reviewCard}>
              <View style={s.rvRow}>
                <Text style={s.rvName}>{name || 'My Routine'}</Text>
                <View style={[s.badge, { backgroundColor: SPLITS[split].color + '26' }]}>
                  <Text style={[s.badgeText, { color: SPLITS[split].color }]}>{SPLITS[split].label}</Text>
                </View>
              </View>
            </View>

            <Text style={[s.fieldLabel, { marginTop: 16 }]}>EXERCISES</Text>
            <View style={s.reviewCard}>
              {exercises.map((ex, idx) => (
                <View key={idx} style={[s.rvRow, idx < exercises.length - 1 && s.rvBorder]}>
                  <Text style={s.rvName}>{ex.name}</Text>
                  <Text style={s.rvPreset}>{ex.preset}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[s.nextBtn, { marginTop: 24 }]} onPress={handleSave}>
              <Text style={s.nextBtnText}>Save Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.navBack, { marginTop: 12, borderBottomWidth: 0, paddingVertical: 16 }]} onPress={() => setStep(2)}>
              <Text style={s.navBackText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ExercisePickerModal 
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(ex, preset) => {
          setExercises(prev => [...prev, { name: ex.name, preset: preset?.label || '3×10' }]);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1, backgroundColor: T.colors.bg0,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: T.colors.t1, letterSpacing: 1 },
  content: { padding: T.spacing.page, paddingBottom: 60 },

  stepDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.colors.bg3 },
  dotActive: { width: 20, backgroundColor: T.colors.forge },
  dotDone: { backgroundColor: T.colors.forge },

  stepLabel: { color: T.colors.t3, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textAlign: 'center', marginBottom: 24 },
  fieldLabel: { color: T.colors.t3, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 },
  
  input: {
    backgroundColor: T.colors.bg1, borderWidth: 0.5, borderColor: T.colors.b1,
    borderRadius: 12, padding: 16, color: T.colors.t1, fontSize: 16, fontWeight: '600', marginBottom: 24,
  },

  splitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  splitCard: {
    width: '48%', backgroundColor: T.colors.bg1, borderWidth: 0.5, borderColor: T.colors.b1,
    borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center',
  },
  scName: { fontSize: 14, fontWeight: '800', color: T.colors.t1, marginTop: 8, marginBottom: 2 },
  scHint: { fontSize: 10, color: T.colors.t3, textAlign: 'center' },

  nextBtn: { backgroundColor: T.colors.forge, padding: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

  warnCard: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)', borderWidth: 0.5, borderColor: 'rgba(255, 214, 10, 0.3)',
    borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, marginBottom: 20,
  },
  warnText: { color: '#FFD60A', fontSize: 13, lineHeight: 18, flex: 1, fontWeight: '500' },

  exItem: { backgroundColor: T.colors.bg1, borderWidth: 0.5, borderColor: T.colors.b1, borderRadius: 14, padding: 14, marginBottom: 10 },
  exItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exItemName: { color: T.colors.t1, fontSize: 15, fontWeight: '700' },
  
  presetRow: { flexDirection: 'row', gap: 6 },
  presetPill: { backgroundColor: T.colors.bg2, borderWidth: 0.5, borderColor: T.colors.b1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  presetPillOn: { backgroundColor: 'rgba(255, 92, 46, 0.1)', borderColor: '#FF5C2E' },
  presetPillText: { color: T.colors.t3, fontSize: 12, fontWeight: '700' },

  addExBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.colors.b1, borderStyle: 'dashed', marginTop: 6, marginBottom: 24 },
  addExText: { color: T.colors.forge, fontSize: 14, fontWeight: '700' },

  navRow: { flexDirection: 'row', gap: 12 },
  navBack: { flex: 1, borderWidth: 0.5, borderColor: T.colors.b1, borderRadius: 14, padding: 16, alignItems: 'center' },
  navBackText: { color: T.colors.t2, fontSize: 15, fontWeight: '700' },
  navNext: { flex: 2, backgroundColor: T.colors.forge, borderRadius: 14, padding: 16, alignItems: 'center' },
  navNextText: { color: '#000', fontSize: 15, fontWeight: '800' },

  reviewCard: { backgroundColor: T.colors.bg1, borderWidth: 0.5, borderColor: T.colors.b1, borderRadius: 14, padding: 16 },
  rvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rvBorder: { borderBottomWidth: 0.5, borderBottomColor: T.colors.b1 },
  rvName: { color: T.colors.t1, fontSize: 15, fontWeight: '600' },
  rvPreset: { color: T.colors.t3, fontSize: 13, fontWeight: '600' },
  
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
