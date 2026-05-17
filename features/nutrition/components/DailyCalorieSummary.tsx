import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { DailyAggregates } from '../types';

interface DailyCalorieSummaryProps {
  aggregates: DailyAggregates;
}

export function DailyCalorieSummary({ aggregates }: DailyCalorieSummaryProps) {
  const { totalCal, calPct, remaining, goalCal, totalProtein, totalCarbs, totalFat } = aggregates;

  return (
    <View style={s.summaryCard}>
      <LinearGradient
        colors={['#1C1C22', '#0E0E11']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Decorative blob */}
      <View style={s.blob} />

      {/* Top row: consumed / remaining */}
      <View style={s.calTopRow}>
        <View style={s.calBlock}>
          <Text style={s.calNum} maxFontSizeMultiplier={1.2}>{totalCal}</Text>
          <Text style={s.calLabel} maxFontSizeMultiplier={1.2}>Eaten</Text>
        </View>
        <View style={s.calRingWrap}>
          {/* Simple circular % indicator */}
          <Text style={s.calPct} maxFontSizeMultiplier={1.2}>{Math.round(calPct)}%</Text>
          <Text style={s.calGoalLabel} maxFontSizeMultiplier={1.2}>of {goalCal}</Text>
        </View>
        <View style={[s.calBlock, { alignItems: 'flex-end' }]}>
          <Text style={[s.calNum, { color: remaining === 0 ? T.colors.forge : T.colors.t1 }]} maxFontSizeMultiplier={1.2}>{remaining}</Text>
          <Text style={s.calLabel} maxFontSizeMultiplier={1.2}>Remaining</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.calBarTrack}>
        <LinearGradient
          colors={[T.colors.forge, T.colors.forgeMid]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[s.calBarFill, { width: `${calPct}%` }]}
        />
      </View>

      {/* Macro stat row */}
      <View style={s.macroStatRow}>
        {[
          { label: 'Protein', value: totalProtein, color: T.colors.green },
          { label: 'Carbs',   value: totalCarbs,   color: T.colors.blue  },
          { label: 'Fat',     value: totalFat,     color: T.colors.gold  },
        ].map(m => (
          <View key={m.label} style={s.macroStat}>
            <View style={[s.macroDot, { backgroundColor: m.color }]} />
            <Text style={[s.macroVal, { color: m.color }]} maxFontSizeMultiplier={1.2}>{m.value}g</Text>
            <Text style={s.macroLbl} maxFontSizeMultiplier={1.2}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  summaryCard: {
    marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5,
    borderRadius: T.radii.xl, borderWidth: 0.5, borderColor: T.colors.b1,
    overflow: 'hidden', padding: T.spacing.px5,
  },
  blob: {
    position: 'absolute', top: -40, right: -20,
    width: 120, height: 120,
    backgroundColor: T.colors.forgeDim,
    borderRadius: 60,
  },
  calTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: T.spacing.px4 },
  calBlock: {},
  calNum: { fontSize: 24, fontWeight: '800', color: T.colors.t1 },
  calLabel: { fontSize: T.typography.sizes.label, color: T.colors.t3, marginTop: 2, fontWeight: '500' },
  calRingWrap: { alignItems: 'center' },
  calPct: { fontSize: 22, fontWeight: '800', color: T.colors.forge },
  calGoalLabel: { fontSize: T.typography.sizes.caption, color: T.colors.t3, marginTop: 1 },

  calBarTrack: { height: 6, backgroundColor: T.colors.bg3, borderRadius: T.radii.sm, overflow: 'hidden', marginBottom: T.spacing.px5 },
  calBarFill: { height: 6, borderRadius: T.radii.sm },

  macroStatRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroStat: { alignItems: 'center', gap: 3 },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  macroVal: { fontSize: T.typography.sizes.body, fontWeight: '700' },
  macroLbl: { fontSize: T.typography.sizes.caption, color: T.colors.t3, fontWeight: '500' },
});
