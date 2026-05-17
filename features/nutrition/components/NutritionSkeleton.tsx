import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ForgeSkeleton, SkeletonHeroCard } from '../../../components/forge/ForgeSkeleton';
import { useForgeTheme } from "@/hooks/useForgeTheme";

export function NutritionSkeleton() {
    const { T } = useForgeTheme();
    const s = useS(T);
  return (
    <View style={useS.content}>
      <View style={[useS.header, { paddingBottom: T.spacing.px6 }]}>
        <View>
          <ForgeSkeleton width={120} height={14} radius={4} style={{ marginBottom: 6 }} />
          <ForgeSkeleton width={180} height={32} radius={8} />
        </View>
        <ForgeSkeleton circle size={40} />
      </View>
      <SkeletonHeroCard />
      <View style={useS.section}>
        <ForgeSkeleton width={140} height={14} radius={4} style={{ marginBottom: 10 }} />
        <View style={useS.card}>
           <ForgeSkeleton width="100%" height={24} radius={4} style={{ marginBottom: 12 }} />
           <ForgeSkeleton width="100%" height={24} radius={4} style={{ marginBottom: 12 }} />
           <ForgeSkeleton width="100%" height={24} radius={4} />
        </View>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
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
