import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MacroDonutRing } from '../../../components/forge/MacroDonutRing';
import { StreakWidget } from '../../../components/forge/StreakWidget';
import { SkeletonMetricRow } from '../../../components/forge/ForgeSkeleton';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';

interface MetricRingsRowProps {
  isLoading: boolean;
  activeCals: number;
  calGoal: number;
  waterLiters: number;
  waterGoal: number;
  streak: number;
  weekActivity: boolean[];
}

export function MetricRingsRow({
  isLoading,
  activeCals,
  calGoal,
  waterLiters,
  waterGoal,
  streak,
  weekActivity,
}: MetricRingsRowProps) {
  if (isLoading) {
    return <SkeletonMetricRow />;
  }

  return (
    <View style={s.metricsRow}>
      <View style={s.metricCard}>
        <MacroDonutRing
          calories={activeCals}
          calorieGoal={calGoal}
          waterLiters={waterLiters}
          waterGoal={waterGoal}
        />
      </View>
      <View style={s.metricCard}>
        <StreakWidget streak={streak} weekActivity={weekActivity} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: T.spacing.page, marginBottom: T.spacing.px5,
  },
  metricCard: {
    flex: 1, backgroundColor: T.colors.bg1, borderRadius: T.radii.xl,
    borderWidth: 0.5, borderColor: T.colors.b1, padding: T.spacing.px4,
    alignItems: 'center', justifyContent: 'center',
  },
});
