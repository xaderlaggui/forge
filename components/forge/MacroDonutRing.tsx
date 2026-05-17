import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ForgeTheme } from '../../constants/ForgeTheme';

interface MacroDonutRingProps {
  /** Calories consumed */
  calories: number;
  /** Calorie goal */
  calorieGoal: number;
  /** Water consumed in liters */
  waterLiters: number;
  /** Water goal in liters */
  waterGoal: number;
}

export function MacroDonutRing({ calories, calorieGoal, waterLiters, waterGoal }: MacroDonutRingProps) {
  const SIZE = 96;
  const OUTER_R = 44;
  const INNER_R = 32;
  const STROKE = 8;

  const outerCircumference = 2 * Math.PI * OUTER_R;
  const innerCircumference = 2 * Math.PI * INNER_R;

  const waterPercent = Math.min(waterLiters / waterGoal, 1);
  const calPercent = Math.min(calories / calorieGoal, 1);

  const waterOffset = outerCircumference - waterPercent * outerCircumference;
  const calOffset = innerCircumference - calPercent * innerCircumference;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Track rings */}
          <Circle cx="50" cy="50" r={OUTER_R} stroke="#1A2035" strokeWidth={STROKE} fill="none" />
          <Circle cx="50" cy="50" r={INNER_R} stroke="#251614" strokeWidth={STROKE} fill="none" />
          {/* Water ring (outer, blue) */}
          <Circle
            cx="50" cy="50" r={OUTER_R}
            stroke={ForgeTheme.colors.blue}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={outerCircumference}
            strokeDashoffset={waterOffset}
            strokeLinecap="round"
          />
          {/* Calorie ring (inner, forge) */}
          <Circle
            cx="50" cy="50" r={INNER_R}
            stroke={ForgeTheme.colors.forge}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={innerCircumference}
            strokeDashoffset={calOffset}
            strokeLinecap="round"
          />
        </Svg>
        {/* Center label */}
        <View style={StyleSheet.absoluteFillObject as any} pointerEvents="none">
          <View style={styles.center}>
            <Text style={styles.centerText}>{Math.round(calPercent * 100)}%</Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: ForgeTheme.colors.forge }]} />
          <Text style={styles.legendLabel}>{calories} cal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: ForgeTheme.colors.blue }]} />
          <Text style={styles.legendLabel}>{waterLiters.toFixed(1)} L</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { fontSize: 11, fontWeight: '700', color: ForgeTheme.colors.t1 },
  legend: { flexDirection: 'row', gap: 12, marginTop: 12 },
  legendItem: { alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, color: ForgeTheme.colors.t2 },
});
