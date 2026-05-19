import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUpCircle, ArrowDownCircle, PersonStanding, AlertTriangle, Plus, X, Zap, Dumbbell, Timer, Shuffle, Sparkles, Check } from 'lucide-react-native';
import { useRoutines } from '../hooks/useRoutines';
import { useExercises } from '../hooks/useExercises';
import { useAuthStore } from '../stores/authStore';
import { groqComplete } from '../services/groq';
import { ExerciseLibrary, ExercisePreviewModal } from '../features/planner/components/ExerciseLibrary';
import type { Exercise } from '../types';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { buildRoutinePrompt } from '../constants/prompts';

// ── Types ──────────────────────────────────────────────────────────────
type SplitType   = 'push' | 'pull' | 'legs' | 'full';
type PurposeType = 'strength' | 'hypertrophy' | 'endurance' | 'mixed';

// ── Config ─────────────────────────────────────────────────────────────
const SPLITS: Record<SplitType, { label: string; icon: any; color: string; hint: string }> = {
  push: { label: 'PUSH',      icon: ArrowUpCircle,   color: '#FF5C2E', hint: 'Chest · Shoulders · Triceps' },
  pull: { label: 'PULL',      icon: ArrowDownCircle, color: '#0A84FF', hint: 'Back · Biceps · Rear Delt'   },
  legs: { label: 'LEGS',      icon: PersonStanding,  color: '#30D158', hint: 'Quads · Hamstrings · Calves' },
  full: { label: 'FULL BODY', icon: PersonStanding,  color: '#BF5AF2', hint: 'All muscle groups'           },
};

const PURPOSES: Record<PurposeType, {
  label: string; icon: any; color: string;
  hint: string; presets: string[]; description: string;
}> = {
  strength: {
    label: 'STRENGTH', icon: Zap, color: '#FF5C2E',
    hint: 'Heavy compounds, low reps',
    presets: ['3×5', '4×4', '5×3', '5×5'],
    description: 'Focused on maximal force production. Low reps, heavy weight, long rest periods.',
  },
  hypertrophy: {
    label: 'HYPERTROPHY', icon: Dumbbell, color: '#0A84FF',
    hint: 'Moderate weight, high volume',
    presets: ['3×10', '3×12', '4×8', '4×12'],
    description: 'Optimized for muscle growth. Moderate weight, higher reps, shorter rest.',
  },
  endurance: {
    label: 'ENDURANCE', icon: Timer, color: '#30D158',
    hint: 'Light weight, high reps',
    presets: ['3×15', '3×20', '4×15', '2×25'],
    description: 'Build muscular endurance and cardio capacity. Light weight, very high reps.',
  },
  mixed: {
    label: 'MIXED', icon: Shuffle, color: '#BF5AF2',
    hint: 'Balanced approach',
    presets: ['3×8', '3×10', '3×12', '4×8'],
    description: 'Combines strength, hypertrophy and endurance for well-rounded fitness.',
  },
};

interface ExData {
  name: string;
  preset: string;
  category?: string;
  purpose?: string;
}

export default function BuildRoutineScreen() {
    const { T } = useForgeTheme();
    const s = useS(T);
  const router = useRouter();
  const { saveRoutine }           = useRoutines();
  const { data: dbExercises }     = useExercises();
  const { user }                  = useAuthStore();

  const [step,    setStep]    = useState(1);
  const [name,    setName]    = useState('');
  const [split,   setSplit]   = useState<SplitType>('push');
  const [purpose, setPurpose] = useState<PurposeType>('hypertrophy');
  const [exercises, setExercises] = useState<ExData[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [previewEx,  setPreviewEx]  = useState<Exercise | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // ── Derive preset bank from current purpose ─────────────────
  const presets = PURPOSES[purpose].presets;

  // ── Exercises filtered to selected split (for picker + auto-populate) ────
  const splitExercises = useMemo(() => {
    if (!dbExercises) return [];
    if (split === 'full') return dbExercises;
    return dbExercises.filter(e => e.category === split);
  }, [dbExercises, split]);

  // ── Warning: purpose-aware ──────────────────────────────────
  const overlapWarning = useMemo(() => {
    // Strength: warn only when too many exercises (>4)
    if (purpose === 'strength') {
      return exercises.length > 4
        ? `Strength sessions work best with 4 or fewer exercises. Consider removing ${exercises.length - 4}.`
        : null;
    }
    // Others: warn on duplicate primary muscle group
    const primary = exercises.map(e => e.category).filter(Boolean);
    const dups = primary.filter((v, i) => primary.indexOf(v) !== i);
    if (dups.length > 0) {
      const names = exercises.filter(e => e.category === dups[0]).map(e => e.name);
      if (names.length >= 2)
        return `"${names[0]}" and "${names[1]}" target the same muscle group (${dups[0]}). Consider removing one.`;
    }
    return null;
  }, [exercises, purpose]);

  // ── AI Exercise Generator ──────────────────────────────────
  const generateWithAI = async () => {
    setIsAiGenerating(true);
    try {
      const equipment = user?.equipmentAccess ?? 'full';
      const equipmentDesc = {
        full:       'full commercial gym (barbells, dumbbells, cables, machines)',
        dumbbells:  'dumbbells and a bench only',
        bodyweight: 'bodyweight only, no equipment',
      }[equipment] ?? 'full gym';

      const purposeDesc = PURPOSES[purpose].description;
      const splitLabel  = SPLITS[split].label;
      const cap = purpose === 'strength' ? 4 : 5;

      const prompt = buildRoutinePrompt(splitLabel, PURPOSES[purpose].label, purposeDesc, equipmentDesc, cap, purpose);

      const content = await groqComplete(
        [{ role: 'user', content: prompt }],
        { model: 'llama-3.1-8b-instant', max_tokens: 600, temperature: 0.5, response_format: { type: 'json_object' } }
      );

      const parsed = JSON.parse(content);
      const arr: { name: string; sets: number; reps: string }[] = Array.isArray(parsed)
        ? parsed
        : (parsed.exercises ?? parsed.workout ?? []);

      if (!arr.length) throw new Error('Empty response');

      const defaultPreset = PURPOSES[purpose].presets[0];
      const mapped: ExData[] = arr.slice(0, cap).map(e => {
        // Try to match to a known exercise for muscle group context
        const known = splitExercises.find(
          db => db.name.toLowerCase() === e.name.toLowerCase()
        );
        return {
          name: e.name,
          preset: (`${e.sets}×${e.reps}`) || defaultPreset,
          category: known?.category ?? split,
          purpose: known?.purpose ?? purpose,
        };
      });
      setExercises(mapped);
    } catch (err) {
      console.error('AI generate error:', err);
      Alert.alert('AI Error', 'Could not generate exercises. Using smart suggestions instead.');
      autoPopulate();
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ── Auto-populate exercises on step 2→3 ────────────────────
  const autoPopulate = () => {
    if (!dbExercises || exercises.length > 0) return;

    let pool = [...splitExercises]; // already filtered by split

    // Filter by purpose if not mixed
    if (purpose !== 'mixed') {
      const purposeFiltered = pool.filter(e => e.purpose === purpose);
      if (purposeFiltered.length >= 3) pool = purposeFiltered;
    }

    // Group by primary muscle to ensure diversity
    const grouped: Record<string, Exercise[]> = {};
    pool.forEach(ex => {
      const k = ex.muscleGroups[0] || 'other';
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(ex);
    });

    const selected: Exercise[] = [];
    Object.values(grouped).forEach(group => {
      const pick = group[Math.floor(Math.random() * group.length)];
      selected.push(pick);
    });

    // Strength: cap at 4 | others: cap at 5
    const cap = purpose === 'strength' ? 4 : 5;
    const shuffled = selected.sort(() => 0.5 - Math.random()).slice(0, cap);
    const defaultPreset = presets[0];
    setExercises(shuffled.map(ex => ({ name: ex.name, preset: defaultPreset, category: ex.category, purpose: ex.purpose })));
  };

  // ── Step navigation ─────────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) return Alert.alert('Missing Name', 'Please name your routine.');
      setStep(2);
    } else if (step === 2) {
      // Always reset so user sees the AI/suggestions choice fresh
      setExercises([]);
      setStep(3);
    } else if (step === 3) {
      if (exercises.length === 0) return Alert.alert('No Exercises', 'Please add at least one exercise.');
      setStep(4);
    }
  };

  const goBack = () => setStep(s => Math.max(1, s - 1));

  // ── Save ────────────────────────────────────────────────────
  const handleSave = async () => {
    const formatted = exercises.map(ex => {
      const parts = ex.preset.split('×');
      return { name: ex.name, sets: Number(parts[0]) || 3, reps: Number(parts[1]) || 10, preset: ex.preset };
    });
    await saveRoutine({
      id: `routine_${Date.now()}`,
      name: name.trim() || 'My Routine',
      split,
      exercises: formatted,
    });
    router.back();
  };

  const setPreset      = (idx: number, p: string) => setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, preset: p } : ex));
  const removeEx       = (idx: number) => setExercises(prev => prev.filter((_, i) => i !== idx));
  const handleAddExercise = (ex: Exercise) => { setExercises(prev => [...prev, { name: ex.name, preset: presets[0], category: ex.category, purpose: ex.purpose }]); setShowPicker(false); };
  const handlePreview  = (exName: string) => { const full = dbExercises?.find(e => e.name === exName); if (full) setPreviewEx(full); };

  // ── Render ──────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <X size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={s.title}>CREATE ROUTINE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Step dots — now 4 steps */}
        <View style={s.stepDots}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[s.dot, step === i && s.dotActive, step > i && s.dotDone]} />
          ))}
        </View>

        {/* ── STEP 1: Name & Split ── */}
        {step === 1 && (
          <View>
            <Text style={s.stepLabel}>STEP 1 OF 4 — NAME & SPLIT</Text>

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
                const sp   = SPLITS[key];
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

        {/* ── STEP 2: Training Purpose ── */}
        {step === 2 && (
          <View>
            <Text style={s.stepLabel}>STEP 2 OF 4 — TRAINING PURPOSE</Text>
            <Text style={[s.fieldLabel, { marginBottom: 14 }]}>WHAT IS YOUR GOAL FOR THIS SESSION?</Text>

            <View style={s.purposeGrid}>
              {(Object.keys(PURPOSES) as PurposeType[]).map(key => {
                const p    = PURPOSES[key];
                const Icon = p.icon;
                const active = purpose === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[s.purposeCard, active && { borderColor: p.color, backgroundColor: p.color + '12' }]}
                    onPress={() => setPurpose(key)}
                    activeOpacity={0.75}
                  >
                    {/* Icon + label row */}
                    <View style={[s.purposeIconWrap, { backgroundColor: p.color + '22' }]}>
                      <Icon size={20} color={p.color} />
                    </View>
                    <Text style={[s.purposeLabel, active && { color: p.color }]}>{p.label}</Text>
                    <Text style={s.purposeHint} numberOfLines={2}>{p.hint}</Text>

                    {/* Rep scheme chips */}
                    <View style={s.presetPreview}>
                      {p.presets.slice(0, 2).map(preset => (
                        <View key={preset} style={[s.presetTag, active && { borderColor: p.color + '90', backgroundColor: p.color + '16' }]}>
                          <Text style={[s.presetTagText, active && { color: p.color }]}>{preset}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Active check */}
                    {active && (
                      <View style={[s.activeCheck, { backgroundColor: p.color }]}>
                      <Check size={11} color="#000" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description of selected purpose */}
            <View style={[s.purposeDescCard, { borderColor: PURPOSES[purpose].color + '40', backgroundColor: PURPOSES[purpose].color + '08' }]}>
              <Text style={[s.purposeDescText, { color: PURPOSES[purpose].color }]}>{PURPOSES[purpose].description}</Text>
            </View>

            <View style={s.navRow}>
              <TouchableOpacity style={s.navBack} onPress={goBack}><Text style={s.navBackText}>Back</Text></TouchableOpacity>
              <TouchableOpacity style={s.navNext} onPress={handleNext}><Text style={s.navNextText}>Next →</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 3: Exercises ── */}
        {step === 3 && (
          <View>
            <Text style={s.stepLabel}>STEP 3 OF 4 — EXERCISES</Text>

            {/* Purpose context banner */}
            <View style={[s.purposeBanner, { borderColor: PURPOSES[purpose].color + '50', backgroundColor: PURPOSES[purpose].color + '0D' }]}>
              {React.createElement(PURPOSES[purpose].icon, { size: 14, color: PURPOSES[purpose].color })}
              <Text style={[s.purposeBannerText, { color: PURPOSES[purpose].color }]}>
                {PURPOSES[purpose].label} · {SPLITS[split].label}
              </Text>
            </View>

            {overlapWarning && (
              <View style={s.warnCard}>
                <AlertTriangle size={16} color={T.colors.gold} style={{ marginTop: 2 }} />
                <Text style={s.warnText}>{overlapWarning}</Text>
              </View>
            )}

            <Text style={s.fieldLabel}>{SPLITS[split].label} — {PURPOSES[purpose].label} EXERCISES</Text>

            {exercises.length === 0 && (
              <View style={s.emptyExState}>
                {isAiGenerating ? (
                  <View style={s.aiLoadingWrap}>
                    <ActivityIndicator color={T.colors.forge} size="large" />
                    <Text style={s.aiLoadingText}>AI is building your {PURPOSES[purpose].label.toLowerCase()} session…</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity style={s.aiGenBtn} onPress={generateWithAI}>
                      <Sparkles size={18} color="#000" strokeWidth={2.5} />
                      <Text style={s.aiGenBtnText}>Generate with AI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.autoFillBtn} onPress={autoPopulate}>
                      <Text style={s.autoFillText}>Use Smart Suggestions</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {exercises.map((ex, idx) => (
              <View key={idx} style={s.exItem}>
                <View style={s.exItemTop}>
                  <TouchableOpacity onPress={() => handlePreview(ex.name)} style={{ flex: 1 }}>
                    <Text style={s.exItemName}>{ex.name}</Text>
                    {ex.purpose && (
                      <Text style={[s.exPurposeBadge, { color: PURPOSES[ex.purpose as PurposeType]?.color ?? T.colors.t3 }]}>
                        {ex.purpose.toUpperCase()}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeEx(idx)} style={{ padding: 4 }}>
                    <X size={16} color={T.colors.t3} />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.presetRow}>
                  {presets.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[s.presetPill, ex.preset === p && s.presetPillOn]}
                      onPress={() => setPreset(idx, p)}
                    >
                      <Text style={[s.presetPillText, ex.preset === p && { color: PURPOSES[purpose].color }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}

            <TouchableOpacity style={s.addExBtn} onPress={() => setShowPicker(true)}>
              <Plus size={18} color={T.colors.forge} />
              <Text style={s.addExText}>Add Exercise</Text>
            </TouchableOpacity>

            <View style={s.navRow}>
              <TouchableOpacity style={s.navBack} onPress={goBack}><Text style={s.navBackText}>Back</Text></TouchableOpacity>
              <TouchableOpacity style={s.navNext} onPress={handleNext}><Text style={s.navNextText}>Review →</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 4: Review & Save ── */}
        {step === 4 && (
          <View>
            <Text style={s.stepLabel}>STEP 4 OF 4 — REVIEW & SAVE</Text>

            <Text style={s.fieldLabel}>ROUTINE DETAILS</Text>
            <View style={s.reviewCard}>
              <View style={s.rvRow}>
                <Text style={s.rvName}>{name || 'My Routine'}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <View style={[s.badge, { backgroundColor: SPLITS[split].color + '26' }]}>
                    <Text style={[s.badgeText, { color: SPLITS[split].color }]}>{SPLITS[split].label}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: PURPOSES[purpose].color + '26' }]}>
                    <Text style={[s.badgeText, { color: PURPOSES[purpose].color }]}>{PURPOSES[purpose].label}</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={[s.fieldLabel, { marginTop: 16 }]}>EXERCISES ({exercises.length})</Text>
            <View style={s.reviewCard}>
              {exercises.map((ex, idx) => (
                <View key={idx} style={[s.rvRow, idx < exercises.length - 1 && s.rvBorder]}>
                  <View>
                    <Text style={s.rvName}>{ex.name}</Text>
                    {ex.purpose && (
                      <Text style={[s.exPurposeBadge, { color: PURPOSES[ex.purpose as PurposeType]?.color ?? T.colors.t3 }]}>
                        {ex.purpose.toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <Text style={s.rvPreset}>{ex.preset}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[s.nextBtn, { marginTop: 24 }]} onPress={handleSave}>
              <Text style={s.nextBtnText}>Save Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.navBack, { marginTop: 12, borderWidth: 0, paddingVertical: 16 }]} onPress={goBack}>
              <Text style={s.navBackText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Exercise Picker Modal */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPicker(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg0 }}>
          <View style={[s.header, { paddingTop: 16 }]}>
            <TouchableOpacity onPress={() => setShowPicker(false)} style={s.iconBtn}>
              <X size={24} color={T.colors.t1} />
            </TouchableOpacity>
            <Text style={s.title}>SELECT EXERCISE</Text>
            <View style={{ width: 40 }} />
          </View>
          <ExerciseLibrary exercises={splitExercises} isLoading={!dbExercises} onSelect={handleAddExercise} />
        </SafeAreaView>
      </Modal>

      {/* Preview Modal */}
      <ExercisePreviewModal exercise={previewEx} onClose={() => setPreviewEx(null)} />
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
          container: { flex: 1, backgroundColor: T.colors.bg0 },
          header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: 16,
            borderBottomWidth: 0.5, borderBottomColor: T.colors.b1, backgroundColor: T.colors.bg0,
          },
          iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
          title: { fontSize: 16, fontWeight: '800', color: T.colors.t1, letterSpacing: 1 },
          content: { padding: T.spacing.page, paddingBottom: 80 },

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
            borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 100,
          },
          scName: { fontSize: 14, fontWeight: '800', color: T.colors.t1, marginTop: 8, marginBottom: 2 },
          scHint: { fontSize: 10, color: T.colors.t3, textAlign: 'center' },

          // Purpose cards – compact 2-col grid
          purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
          purposeCard: {
            width: '47.5%', backgroundColor: T.colors.bg1, borderWidth: 1.5, borderColor: T.colors.b1,
            borderRadius: 16, padding: 14, position: 'relative', overflow: 'hidden',
          },
          purposeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
          purposeLabel: { fontSize: 13, fontWeight: '800', color: T.colors.t1, letterSpacing: 0.4, marginBottom: 3 },
          purposeHint: { fontSize: 10, color: T.colors.t3, fontWeight: '600', lineHeight: 14, marginBottom: 10 },
          presetPreview: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
          presetTag: {
            paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5,
            borderWidth: 0.5, borderColor: T.colors.b1, backgroundColor: T.colors.bg2,
          },
          presetTagText: { fontSize: 10, fontWeight: '700', color: T.colors.t3 },
          activeCheck: {
            position: 'absolute', top: 10, right: 10,
            width: 18, height: 18, borderRadius: 9,
            alignItems: 'center', justifyContent: 'center',
          },
          // Selected purpose description card
          purposeDescCard: {
            borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 24,
          },
          purposeDescText: { fontSize: 12, fontWeight: '600', lineHeight: 18 },

          // Purpose banner in step 3
          purposeBanner: {
            flexDirection: 'row', alignItems: 'center', gap: 8,
            borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
            marginBottom: 16,
          },
          purposeBannerText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },

          nextBtn: { backgroundColor: T.colors.forge, padding: 16, borderRadius: 14, alignItems: 'center' },
          nextBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

          warnCard: {
            backgroundColor: T.colors.goldDim, borderWidth: 0.5, borderColor: T.colors.gold,
            borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, marginBottom: 20,
          },
          warnText: { color: T.colors.t1, fontSize: 13, lineHeight: 18, flex: 1, fontWeight: '500' },

          exItem: { backgroundColor: T.colors.bg1, borderWidth: 0.5, borderColor: T.colors.b1, borderRadius: 14, padding: 14, marginBottom: 10 },
          exItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
          exItemName: { color: T.colors.t1, fontSize: 15, fontWeight: '700', marginBottom: 2 },
          exPurposeBadge: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

          presetRow: { flexDirection: 'row', gap: 6 },
          presetPill: { backgroundColor: T.colors.bg2, borderWidth: 0.5, borderColor: T.colors.b1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
          presetPillOn: { backgroundColor: 'rgba(255, 92, 46, 0.08)', borderColor: T.colors.forge },
          presetPillText: { color: T.colors.t3, fontSize: 12, fontWeight: '700' },

          addExBtn: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderWidth: 1, borderStyle: 'dashed', borderColor: T.colors.forge,
            borderRadius: 14, padding: 16, marginBottom: 24,
          },
          addExText: { color: T.colors.forge, fontSize: 15, fontWeight: '700' },

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

          // AI Generation empty state
          emptyExState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
          aiGenBtn: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            backgroundColor: T.colors.forge, paddingVertical: 16, paddingHorizontal: 32,
            borderRadius: 14, width: '100%',
            shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
          },
          aiGenBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
          autoFillBtn: { paddingVertical: 12, paddingHorizontal: 24 },
          autoFillText: { color: T.colors.t3, fontSize: 14, fontWeight: '600' },
          aiLoadingWrap: { alignItems: 'center', gap: 16, paddingVertical: 20 },
          aiLoadingText: { color: T.colors.t3, fontSize: 14, fontWeight: '600', textAlign: 'center' },
        });
