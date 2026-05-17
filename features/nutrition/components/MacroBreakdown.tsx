import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { DailyAggregates, MacroBarProps } from '../types';

function MacroBar({ label, value, goal, color }: MacroBarProps) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  return (
    <View style={mb.wrapper}>
      <View style={mb.labelRow}>
        <Text style={mb.label} maxFontSizeMultiplier={1.2}>{label}</Text>
        <Text style={mb.value} maxFontSizeMultiplier={1.2}>{value}<Text style={mb.goal}>/{goal}g</Text></Text>
      </View>
      <View style={mb.track}>
        <View style={[mb.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  wrapper: { marginBottom: T.spacing.px3 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: T.spacing.px1 },
  label: { fontSize: T.typography.sizes.bodyS, fontWeight: '500', color: T.colors.t2 },
  value: { fontSize: T.typography.sizes.bodyS, fontWeight: '700', color: T.colors.t1 },
  goal: { fontWeight: '400', color: T.colors.t3 },
  track: { height: 6, backgroundColor: T.colors.bg3, borderRadius: T.radii.sm, overflow: 'hidden' },
  fill: { height: 6, borderRadius: T.radii.sm },
});

export function MacroBreakdown({ aggregates }: { aggregates: DailyAggregates }) {
  const { totalProtein, totalCarbs, totalFat, goalProtein, goalCarbs, goalFat } = aggregates;

  return (
    <View style={s.section}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Macro Breakdown</Text>
      <View style={s.card}>
        <MacroBar label="Protein" value={totalProtein} goal={goalProtein} color={T.colors.green} />
        <MacroBar label="Carbs"   value={totalCarbs}   goal={goalCarbs}   color={T.colors.blue} />
        <MacroBar label="Fat"     value={totalFat}     goal={goalFat}     color={T.colors.gold} />
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
  card: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1, padding: T.spacing.px4,
  },
});
