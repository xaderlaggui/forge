import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyAggregates } from '../types';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface DailyCalorieSummaryProps {
  aggregates: DailyAggregates;
}

export function DailyCalorieSummary({ aggregates }: DailyCalorieSummaryProps) {
    const { T } = useForgeTheme();
    const s = useS(T);
  const { totalCal, calPct, remaining, goalCal, totalProtein, totalCarbs, totalFat } = aggregates;

  return (
    <View style={useS.summaryCard}>
      <LinearGradient
        colors={['#1C1C22', '#0E0E11']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Decorative blob */}
      <View style={useS.blob} />

      {/* Top row: consumed / remaining */}
      <View style={useS.calTopRow}>
        <View style={useS.calBlock}>
          <Text style={useS.calNum} maxFontSizeMultiplier={1.2}>{totalCal}</Text>
          <Text style={useS.calLabel} maxFontSizeMultiplier={1.2}>Eaten</Text>
        </View>
        <View style={useS.calRingWrap}>
          {/* Simple circular % indicator */}
          <Text style={useS.calPct} maxFontSizeMultiplier={1.2}>{Math.round(calPct)}%</Text>
          <Text style={useS.calGoalLabel} maxFontSizeMultiplier={1.2}>of {goalCal}</Text>
        </View>
        <View style={[useS.calBlock, { alignItems: 'flex-end' }]}>
          <Text style={[useS.calNum, { color: remaining === 0 ? T.colors.forge : T.colors.t1 }]} maxFontSizeMultiplier={1.2}>{remaining}</Text>
          <Text style={useS.calLabel} maxFontSizeMultiplier={1.2}>Remaining</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={useS.calBarTrack}>
        <LinearGradient
          colors={[T.colors.forge, T.colors.forgeMid]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[useS.calBarFill, { width: `${calPct}%` }]}
        />
      </View>

      {/* Macro stat row */}
      <View style={useS.macroStatRow}>
        {[
          { label: 'Protein', value: totalProtein, color: T.colors.green },
          { label: 'Carbs',   value: totalCarbs,   color: T.colors.blue  },
          { label: 'Fat',     value: totalFat,     color: T.colors.gold  },
        ].map(m => (
          <View key={m.label} style={useS.macroStat}>
            <View style={[useS.macroDot, { backgroundColor: m.color }]} />
            <Text style={[useS.macroVal, { color: m.color }]} maxFontSizeMultiplier={1.2}>{m.value}g</Text>
            <Text style={useS.macroLbl} maxFontSizeMultiplier={1.2}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
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
