import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplets } from 'lucide-react-native';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { DailyAggregates } from '../types';

export function HydrationTracker({ aggregates }: { aggregates: DailyAggregates }) {
  const { waterLiters, goalWater } = aggregates;
  
  return (
    <View style={[s.section, { marginBottom: 0 }]}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Hydration</Text>
      <View style={s.waterCard}>
        <View style={s.waterLeft}>
          <View style={s.waterIcon}>
            <Droplets size={20} color={T.colors.blue} />
          </View>
          <View>
            <Text style={s.waterVal} maxFontSizeMultiplier={1.2}>{waterLiters.toFixed(1)} L</Text>
            <Text style={s.waterGoal} maxFontSizeMultiplier={1.2}>Goal: {goalWater} L</Text>
          </View>
        </View>
        <View style={s.waterBarWrap}>
          <View style={s.waterBarTrack}>
            <View
              style={[
                s.waterBarFill,
                { width: `${Math.min((waterLiters / goalWater) * 100, 100)}%` },
              ]}
            />
          </View>
          <View style={s.waterDots}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={[
                  s.waterDot,
                  i < Math.round((waterLiters / goalWater) * 8) && s.waterDotFilled,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: T.spacing.px2,
  },
  waterCard: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1,
    padding: T.spacing.px4, gap: 14,
  },
  waterLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waterIcon: {
    width: 40, height: 40, borderRadius: T.radii.md,
    backgroundColor: T.colors.blueDim,
    alignItems: 'center', justifyContent: 'center',
  },
  waterVal: { fontSize: T.typography.sizes.h2, fontWeight: '700', color: T.colors.t1 },
  waterGoal: { fontSize: T.typography.sizes.label, color: T.colors.t3, marginTop: 1 },
  waterBarWrap: { gap: 8 },
  waterBarTrack: { height: 6, backgroundColor: T.colors.bg3, borderRadius: T.radii.sm, overflow: 'hidden' },
  waterBarFill: { height: 6, backgroundColor: T.colors.blue, borderRadius: T.radii.sm },
  waterDots: { flexDirection: 'row', gap: 6 },
  waterDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.colors.bg3 },
  waterDotFilled: { backgroundColor: T.colors.blue },
});
