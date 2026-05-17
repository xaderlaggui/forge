import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Body from 'react-native-body-highlighter';
import { ForgeSkeleton } from '../../../components/forge/ForgeSkeleton';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import type { Exercise } from '../../../types';

function SkeletonLibrary() {
  return (
    <View style={{ gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={s.card}>
          <ForgeSkeleton width="50%" height={16} radius={4} style={{ marginBottom: 8 }} />
          <ForgeSkeleton width="30%" height={12} radius={4} />
        </View>
      ))}
    </View>
  );
}

export const mapMusclesToSlugs = (groups: string[]): { slug: string; intensity: number }[] => {
  const map: Record<string, string[]> = {
    chest: ['chest'],
    shoulders: ['deltoids'],
    triceps: ['triceps'],
    back: ['upper-back', 'lower-back', 'trapezius'],
    biceps: ['biceps'],
    legs: ['quadriceps', 'hamstring', 'calves', 'gluteal'],
    core: ['abs', 'obliques'],
    abs: ['abs'],
    calves: ['calves'],
    glutes: ['gluteal'],
    hamstrings: ['hamstring'],
    quads: ['quadriceps']
  };

  const slugs = new Set<string>();
  groups.forEach(g => {
    const arr = map[g.toLowerCase()];
    if (arr) arr.forEach(s => slugs.add(s));
  });

  return Array.from(slugs).map(slug => ({ slug: slug as any, intensity: 1 }));
};

interface ExerciseLibraryProps {
  exercises?: Exercise[];
  isLoading: boolean;
}

export function ExerciseLibrary({ exercises, isLoading }: ExerciseLibraryProps) {
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const renderBodyModal = () => {
    if (!selectedEx) return null;
    const slugs = mapMusclesToSlugs(selectedEx.muscleGroups);

    return (
      <Modal visible={!!selectedEx} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedEx(null)}>
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{selectedEx.name}</Text>
            <TouchableOpacity onPress={() => setSelectedEx(null)} style={s.closeBtn}>
              <X size={24} color={T.colors.t1} />
            </TouchableOpacity>
          </View>

          <Text style={s.modalSub}>
            {selectedEx.muscleGroups.join(', ')} • {selectedEx.equipment}
          </Text>

          <View style={s.bodyRow}>
            <View style={s.bodyWrapper}>
              <Body
                data={slugs}
                gender="male"
                side="front"
                scale={1.2}
                colors={['#FF5C2E', '#FF5C2E']}
                border={T.colors.b1}
              />
              <Text style={s.bodyLabel}>FRONT</Text>
            </View>
            <View style={s.bodyWrapper}>
              <Body
                data={slugs}
                gender="male"
                side="back"
                scale={1.2}
                colors={['#FF5C2E', '#FF5C2E']}
                border={T.colors.b1}
              />
              <Text style={s.bodyLabel}>BACK</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: T.spacing.page, paddingTop: 16, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {['All', 'Push', 'Pull', 'Legs', 'Chest', 'Back', 'Arms', 'Core'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.filterChip, cat === 'All' && s.filterChipActive]}
            >
              <Text style={[s.filterChipText, cat === 'All' && { color: '#000' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <SkeletonLibrary />
        ) : exercises?.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText} maxFontSizeMultiplier={1.2}>
              No exercises found. Go to Settings and click Seed!
            </Text>
          </View>
        ) : (
          exercises?.map((item) => (
            <TouchableOpacity key={item.id} style={s.card} onPress={() => setSelectedEx(item)} activeOpacity={0.7}>
              <Text style={s.cardTitle} maxFontSizeMultiplier={1.2}>{item.name}</Text>
              <Text style={s.cardSub} maxFontSizeMultiplier={1.2}>
                {item.muscleGroups.join(', ')} • {item.equipment}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {renderBodyModal()}
    </View>
  );
}

const s = StyleSheet.create({
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
  }
});
