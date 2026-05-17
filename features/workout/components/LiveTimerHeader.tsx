import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';

interface LiveTimerHeaderProps {
  timerLabel: string;
  totalExercises: number;
  doneExercises: number;
  onBack: () => void;
}

export function LiveTimerHeader({ timerLabel, totalExercises, doneExercises, onBack }: LiveTimerHeaderProps) {
  // Generate an array representing each exercise pip
  const pips = Array.from({ length: totalExercises });

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <ChevronLeft size={20} color={T.colors.t2} />
      </TouchableOpacity>

      {/* Exercise progress pips */}
      <View style={styles.pips}>
        {pips.map((_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              i === doneExercises ? styles.pipActive : i < doneExercises ? styles.pipDone : styles.pipInactive,
            ]}
          />
        ))}
      </View>

      {/* Live timer */}
      <View style={styles.timerBadge}>
        <View style={styles.timerDot} />
        <Text style={styles.timerText} maxFontSizeMultiplier={1.2}>{timerLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: T.spacing.px3, paddingHorizontal: T.spacing.page,
    backgroundColor: 'rgba(10,10,12,0.95)',
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: T.radii.full,
    backgroundColor: T.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  pips: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  pip: { height: 5, borderRadius: T.radii.full },
  pipInactive: { width: 14, backgroundColor: T.colors.bg3 },
  pipActive: { width: 22, backgroundColor: T.colors.forge },
  pipDone: { width: 14, backgroundColor: T.colors.forgeDim },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: T.spacing.px3, paddingVertical: 6,
    backgroundColor: T.colors.forgeDim,
    borderRadius: T.radii.xl,
  },
  timerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.colors.forge },
  timerText: { fontSize: T.typography.sizes.bodyS, fontWeight: '700', color: T.colors.forge, fontFamily: T.typography.families.mono },
});
