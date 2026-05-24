import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Search, X, ChevronLeft } from 'lucide-react-native';
import { useExercises } from '../../features/workout/hooks/useExercises';
import type { Exercise } from '../../types';
import { useForgeTheme } from "@/hooks/useForgeTheme";

export interface ExercisePreset {
  sets: number;
  reps: number;
}

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise, preset?: ExercisePreset) => void;
}

const PRESETS = [
  { label: '3 × 8', sets: 3, reps: 8 },
  { label: '3 × 10', sets: 3, reps: 10 },
  { label: '3 × 12', sets: 3, reps: 12 },
  { label: '4 × 6', sets: 4, reps: 6 },
  { label: '5 × 5', sets: 5, reps: 5 },
];

export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
    const { T } = useForgeTheme();
    const s = useS(T);
  const { data: exercises, isLoading } = useExercises();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [step, setStep] = useState<'pick_exercise' | 'pick_preset'>('pick_exercise');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const muscles = useMemo(() => {
    if (!exercises) return [];
    const all = exercises.flatMap(e => e.muscleGroups);
    return Array.from(new Set(all)).sort();
  }, [exercises]);

  const filtered = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = selectedMuscle ? e.muscleGroups.includes(selectedMuscle) : true;
      return matchSearch && matchMuscle;
    });
  }, [exercises, search, selectedMuscle]);

  const handleSelectExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    setStep('pick_preset');
  };

  const handleSelectPreset = (preset?: ExercisePreset) => {
    if (selectedExercise) {
      onSelect(selectedExercise, preset);
    }
    closeModal();
  };

  const closeModal = () => {
    setStep('pick_exercise');
    setSelectedExercise(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={s.container}>
        <View style={s.header}>
          {step === 'pick_preset' ? (
            <TouchableOpacity onPress={() => setStep('pick_exercise')} style={s.closeBtn}>
              <ChevronLeft size={20} color={T.colors.t1} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} /> // Spacer
          )}
          
          <Text style={s.title}>{step === 'pick_exercise' ? 'Select Exercise' : 'Select Preset'}</Text>
          
          <TouchableOpacity onPress={closeModal} style={s.closeBtn}>
            <X size={20} color={T.colors.t1} />
          </TouchableOpacity>
        </View>

        {step === 'pick_exercise' ? (
          <>
            <View style={s.searchWrap}>
              <Search size={18} color={T.colors.t3} style={s.searchIcon} />
              <TextInput
                style={s.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={T.colors.t3}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View>
              <FlatList
                data={muscles}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterScroll}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.filterChip, selectedMuscle === item && s.filterChipActive]}
                    onPress={() => setSelectedMuscle(prev => prev === item ? null : item)}
                  >
                    <Text style={[s.filterText, selectedMuscle === item && s.filterTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {isLoading ? (
              <View style={s.loadingWrap}>
                <ActivityIndicator size="large" color={T.colors.forge} />
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                contentContainerStyle={s.list}
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.card} onPress={() => handleSelectExercise(item)}>
                    <Text style={s.cardTitle}>{item.name}</Text>
                    <Text style={s.cardSub}>
                      {item.muscleGroups.join(', ')} • {item.equipment}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <Text style={s.empty}>No exercises found.</Text>
                )}
              />
            )}
          </>
        ) : (
          <View style={s.presetWrap}>
            <Text style={s.presetTarget}>{selectedExercise?.name}</Text>
            <Text style={s.presetSub}>Choose a sets and reps scheme</Text>
            
            <View style={s.presetGrid}>
              {PRESETS.map((p, i) => (
                <TouchableOpacity key={i} style={s.presetBtn} onPress={() => handleSelectPreset({ sets: p.sets, reps: p.reps })}>
                  <Text style={s.presetBtnText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[s.presetBtn, s.presetBtnCustom]} onPress={() => handleSelectPreset()}>
                <Text style={s.presetBtnText}>Custom / Blank</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const useS = (T: any) => StyleSheet.create({
          container: { flex: 1, backgroundColor: T.colors.bg0 },
          header: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            padding: T.spacing.px5, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
          },
          title: { fontSize: T.typography.sizes.h2, fontWeight: '700', color: T.colors.t1 },
          closeBtn: {
            width: 32, height: 32, borderRadius: 16, backgroundColor: T.colors.bg2,
            alignItems: 'center', justifyContent: 'center',
          },
          searchWrap: {
            flexDirection: 'row', alignItems: 'center',
            marginHorizontal: T.spacing.page, marginTop: T.spacing.px4,
            backgroundColor: T.colors.bg1, borderRadius: T.radii.md,
            borderWidth: 0.5, borderColor: T.colors.b1,
            paddingHorizontal: 12, height: 44,
          },
          searchIcon: { marginRight: 8 },
          searchInput: { flex: 1, color: T.colors.t1, fontSize: 16 },
          filterScroll: { paddingHorizontal: T.spacing.page, paddingVertical: T.spacing.px4, gap: 8 },
          filterChip: {
            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
            backgroundColor: T.colors.bg2, borderWidth: 1, borderColor: 'transparent',
          },
          filterChipActive: { backgroundColor: 'rgba(178, 255, 36, 0.1)', borderColor: T.colors.forge },
          filterText: { color: T.colors.t2, fontSize: 13, fontWeight: '600' },
          filterTextActive: { color: T.colors.forge },
          loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
          list: { padding: T.spacing.page, paddingBottom: 60 },
          card: {
            backgroundColor: T.colors.bg1, padding: T.spacing.px4,
            borderRadius: T.radii.lg, marginBottom: T.spacing.px3,
            borderWidth: 0.5, borderColor: T.colors.b1,
          },
          cardTitle: { fontSize: T.typography.sizes.body, fontWeight: '600', color: T.colors.t1, marginBottom: 4 },
          cardSub: { fontSize: T.typography.sizes.caption, color: T.colors.t3, textTransform: 'uppercase' },
          empty: { color: T.colors.t3, textAlign: 'center', marginTop: 40 },
          
          presetWrap: { padding: T.spacing.page, alignItems: 'center', marginTop: 20 },
          presetTarget: { fontSize: 24, fontWeight: '700', color: T.colors.forge, textAlign: 'center', marginBottom: 8 },
          presetSub: { fontSize: 16, color: T.colors.t2, marginBottom: 32 },
          presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
          presetBtn: {
            width: '45%', height: 60, backgroundColor: T.colors.bg2,
            borderRadius: T.radii.md, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: T.colors.b1,
          },
          presetBtnCustom: { width: '90%', marginTop: 12 },
          presetBtnText: { fontSize: 18, fontWeight: '700', color: T.colors.t1 },
        });
