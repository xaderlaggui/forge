import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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

interface ExerciseLibraryProps {
  exercises?: Exercise[];
  isLoading: boolean;
}

export function ExerciseLibrary({ exercises, isLoading }: ExerciseLibraryProps) {
  return (
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
          <View key={item.id} style={s.card}>
            <Text style={s.cardTitle} maxFontSizeMultiplier={1.2}>{item.name}</Text>
            <Text style={s.cardSub} maxFontSizeMultiplier={1.2}>
              {item.muscleGroups.join(', ')} • {item.equipment}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
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
});
