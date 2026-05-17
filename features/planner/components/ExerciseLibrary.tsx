import { X, Search } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import Body from 'react-native-body-highlighter';
import { ForgeSkeleton } from '../../../components/forge/ForgeSkeleton';
import type { Exercise } from '../../../types';
import { useForgeTheme } from "@/hooks/useForgeTheme";

function SkeletonLibrary() {
    const { T } = useForgeTheme();
    const s = useS(T);
  return (
    <View style={{ gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={useS.card}>
          <ForgeSkeleton width="50%" height={16} radius={4} style={{ marginBottom: 8 }} />
          <ForgeSkeleton width="30%" height={12} radius={4} />
        </View>
      ))}
    </View>
  );
}

export const mapMusclesToSlugs = (groups: string[]): { slug: string; intensity: number }[] => {
  // Maps every muscle group name used in seedData to react-native-body-highlighter slugs
  const map: Record<string, string[]> = {
    // Chest
    chest:          ['chest'],
    'lower chest':  ['chest'],
    'upper chest':  ['chest'],

    // Shoulders / Delts
    shoulders:      ['deltoids'],
    deltoids:       ['deltoids'],
    'front delts':  ['deltoids'],
    'side delts':   ['deltoids'],
    'rear delts':   ['deltoids'],

    // Arms
    triceps:        ['triceps'],
    biceps:         ['biceps'],
    forearms:       ['biceps'],          // no forearm slug; closest is biceps

    // Back
    back:           ['upper-back', 'trapezius'],
    lats:           ['upper-back'],
    'upper back':   ['upper-back'],
    'upper-back':   ['upper-back'],
    'lower back':   ['lower-back'],
    'lower-back':   ['lower-back'],
    trapezius:      ['trapezius'],
    traps:          ['trapezius'],
    rhomboids:      ['upper-back'],

    // Core
    core:           ['abs', 'obliques'],
    abs:            ['abs'],
    obliques:       ['obliques'],

    // Legs
    legs:           ['quadriceps', 'hamstring', 'calves', 'gluteal'],
    quads:          ['quadriceps'],
    quadriceps:     ['quadriceps'],
    hamstrings:     ['hamstring'],
    hamstring:      ['hamstring'],
    glutes:         ['gluteal'],
    gluteal:        ['gluteal'],
    calves:         ['calves'],
    adductors:      ['adductors'],
  };

  const slugs = new Set<string>();
  groups.forEach(g => {
    const arr = map[g.toLowerCase()];
    if (arr) arr.forEach(s => slugs.add(s));
  });

  return Array.from(slugs).map(slug => ({ slug: slug as any, intensity: 1 }));
};

export function ExercisePreviewModal({ 
  exercise, 
  onClose,
  onAdd
}: { 
  exercise: Exercise | null, 
  onClose: () => void,
  onAdd?: (ex: Exercise) => void 
}) {
    const { T } = useForgeTheme();
    const s = useS(T);
  if (!exercise) return null;
  const slugs = mapMusclesToSlugs(exercise.muscleGroups);

  return (
    <Modal visible={!!exercise} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={useS.modalContainer}>
        <View style={useS.modalHeader}>
          <Text style={useS.modalTitle}>{exercise.name}</Text>
          <TouchableOpacity onPress={onClose} style={useS.closeBtn}>
            <X size={24} color={T.colors.t1} />
          </TouchableOpacity>
        </View>

        <Text style={useS.modalSub}>
          {exercise.muscleGroups.join(', ')} • {exercise.equipment}
        </Text>

        <View style={useS.bodyRow}>
          <View style={useS.bodyWrapper}>
            <Body data={slugs as any} gender="male" side="front" scale={0.9} colors={['#FF5C2E', '#FF5C2E']} border={T.colors.b1} />
            <Text style={useS.bodyLabel}>FRONT</Text>
          </View>
          <View style={useS.bodyWrapper}>
            <Body data={slugs as any} gender="male" side="back" scale={0.9} colors={['#FF5C2E', '#FF5C2E']} border={T.colors.b1} />
            <Text style={useS.bodyLabel}>BACK</Text>
          </View>
        </View>

        {onAdd && (
          <View style={{ padding: T.spacing.page, marginTop: 'auto', marginBottom: 20 }}>
            <TouchableOpacity style={useS.addBtn} onPress={() => { onAdd(exercise); onClose(); }}>
              <Text style={useS.addBtnText}>Add to Routine</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

interface ExerciseLibraryProps {
  exercises?: Exercise[];
  isLoading: boolean;
  onSelect?: (ex: Exercise) => void;
}

export function ExerciseLibrary({ exercises, isLoading, onSelect }: ExerciseLibraryProps) {
    const { T } = useForgeTheme();
    const s = useS(T);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filteredExercises = useMemo(() => {
    if (!exercises) return [];
    let list = exercises;
    
    // Category Filter
    if (activeCat !== 'All') {
      const lowerCat = activeCat.toLowerCase();
      if (['push', 'pull', 'legs'].includes(lowerCat)) {
        list = list.filter(e => e.category === lowerCat);
      } else if (lowerCat === 'arms') {
        list = list.filter(e => e.muscleGroups.includes('biceps') || e.muscleGroups.includes('triceps'));
      } else if (lowerCat === 'core') {
        list = list.filter(e => e.muscleGroups.includes('abs') || e.muscleGroups.includes('core'));
      } else {
        list = list.filter(e => e.muscleGroups.includes(lowerCat));
      }
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.muscleGroups.some(m => m.toLowerCase().includes(q))
      );
    }
    return list;
  }, [exercises, activeCat, searchQuery]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: T.spacing.page, paddingTop: 16, paddingBottom: 8 }}>
        <View style={useS.searchBar}>
          <Search size={18} color={T.colors.t3} />
          <TextInput
            style={useS.searchInput}
            placeholder="Search exercises or muscles..."
            placeholderTextColor={T.colors.t3}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {['All', 'Push', 'Pull', 'Legs', 'Chest', 'Back', 'Arms', 'Core'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[useS.filterChip, activeCat === cat && useS.filterChipActive]}
              onPress={() => setActiveCat(cat)}
            >
              <Text style={[useS.filterChipText, activeCat === cat && { color: '#000' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={useS.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <SkeletonLibrary />
        ) : filteredExercises.length === 0 ? (
          <View style={useS.emptyState}>
            <Text style={useS.emptyText} maxFontSizeMultiplier={1.2}>
              No exercises found matching your criteria.
            </Text>
          </View>
        ) : (
          filteredExercises.map((item) => (
            <TouchableOpacity key={item.id} style={useS.card} onPress={() => setSelectedEx(item)} activeOpacity={0.7}>
              <Text style={useS.cardTitle} maxFontSizeMultiplier={1.2}>{item.name}</Text>
              <Text style={useS.cardSub} maxFontSizeMultiplier={1.2}>
                {item.muscleGroups.join(', ')} • {item.equipment}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <ExercisePreviewModal 
        exercise={selectedEx} 
        onClose={() => setSelectedEx(null)} 
        onAdd={onSelect}
      />
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
          filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: T.colors.bg1, borderWidth: 1, borderColor: T.colors.b1 },
          filterChipActive: { backgroundColor: T.colors.forge, borderColor: T.colors.forge },
          filterChipText: { color: T.colors.t2, fontSize: 13, fontWeight: '600' },

          list: { padding: T.spacing.page, paddingBottom: 100 },
          card: {
            backgroundColor: T.colors.bg1, padding: T.spacing.px4,
            borderRadius: T.radii.lg, marginBottom: T.spacing.px3,
            borderWidth: 0.5, borderColor: T.colors.b1,
          },
          cardTitle: { fontSize: T.typography.sizes.body, fontWeight: '600', color: T.colors.t1, letterSpacing: 0.2 },
          cardSub: {
            fontSize: T.typography.sizes.label, color: T.colors.t3, marginTop: T.spacing.px1,
            textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.8,
          },
          emptyState: { padding: T.spacing.px7, alignItems: 'center' },
          emptyText: {
            textAlign: 'center', color: T.colors.t3, fontWeight: '500',
            fontSize: T.typography.sizes.bodyS, lineHeight: T.typography.sizes.bodyS * 1.5,
          },

          modalContainer: { flex: 1, backgroundColor: T.colors.bg0 },
          modalHeader: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: T.spacing.page, paddingTop: 20, paddingBottom: 8,
          },
          modalTitle: { fontSize: 22, fontWeight: '800', color: T.colors.t1, flex: 1 },
          closeBtn: { padding: 4 },
          modalSub: {
            fontSize: 14, color: T.colors.forge, fontWeight: '700',
            paddingHorizontal: T.spacing.page, marginBottom: 40, textTransform: 'uppercase', letterSpacing: 0.5
          },
          bodyRow: {
            flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
            gap: 20, paddingHorizontal: 20,
          },
          bodyWrapper: { alignItems: 'center' },
          bodyLabel: {
            marginTop: 20, fontSize: 12, fontWeight: '800', color: T.colors.t3, letterSpacing: 1
          },
          searchBar: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: T.colors.bg1,
            borderWidth: 1, borderColor: T.colors.b1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
            marginBottom: 16, gap: 10
          },
          searchInput: { flex: 1, color: T.colors.t1, fontSize: 15, fontWeight: '500' },
          addBtn: { backgroundColor: T.colors.forge, padding: 16, borderRadius: 12, alignItems: 'center' },
          addBtnText: { color: '#000', fontSize: 16, fontWeight: '800' }
        });
