import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { ForgeSkeleton, SkeletonHeroCard } from '../../../components/forge/ForgeSkeleton';

export function NutritionSkeleton() {
  return (
    <View style={s.content}>
      <View style={[s.header, { paddingBottom: T.spacing.px6 }]}>
        <View>
          <ForgeSkeleton width={120} height={14} radius={4} style={{ marginBottom: 6 }} />
          <ForgeSkeleton width={180} height={32} radius={8} />
        </View>
        <ForgeSkeleton circle size={40} />
      </View>
      <SkeletonHeroCard />
      <View style={s.section}>
        <ForgeSkeleton width={140} height={14} radius={4} style={{ marginBottom: 10 }} />
        <View style={s.card}>
           <ForgeSkeleton width="100%" height={24} radius={4} style={{ marginBottom: 12 }} />
           <ForgeSkeleton width="100%" height={24} radius={4} style={{ marginBottom: 12 }} />
           <ForgeSkeleton width="100%" height={24} radius={4} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  content: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
  },
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  card: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1, padding: T.spacing.px4,
  },
});
