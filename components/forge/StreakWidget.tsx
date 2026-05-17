import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { ForgeTheme } from '../../constants/ForgeTheme';

interface StreakWidgetProps {
  streak: number;
  /** Array of 7 booleans representing Mon–Sun completion */
  weekActivity: boolean[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakWidget({ streak, weekActivity }: StreakWidgetProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.flameWrap}>
        <Flame size={24} color={ForgeTheme.colors.forge} fill={ForgeTheme.colors.forge} strokeWidth={1} />
      </View>
      <Text style={styles.streakNum}>{streak}</Text>
      <Text style={styles.streakLabel}>Day Streak</Text>

      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={styles.dayCol}>
            <Text style={styles.dayLabel}>{label}</Text>
            <View style={[styles.dayDot, weekActivity[i] && styles.dayDotActive]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  flameWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,92,46,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: ForgeTheme.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  streakNum: { fontSize: 28, fontWeight: '800', color: ForgeTheme.colors.t1, lineHeight: 34 },
  streakLabel: { fontSize: 10, color: ForgeTheme.colors.t2, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2, fontWeight: '600' },
  weekRow: { flexDirection: 'row', gap: 4, marginTop: 12 },
  dayCol: { alignItems: 'center', gap: 4 },
  dayLabel: { fontSize: 8, color: ForgeTheme.colors.t3 },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ForgeTheme.colors.bg3 },
  dayDotActive: { backgroundColor: ForgeTheme.colors.forge },
});
