import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';

interface WeeklyCalendarProps {
  days: { label: string; date: number; fullDate: string }[];
  activeDayIdx: number;
  onSelectDay: (idx: number) => void;
}

export function WeeklyCalendar({ days, activeDayIdx, onSelectDay }: WeeklyCalendarProps) {
  const dotOpacity = useSharedValue(0.6);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withTiming(1, { duration: T.motion.duration.pulse, easing: T.motion.easing.standard }),
      -1,
      true
    );
  }, []);

  const dotOpacityStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View style={s.weekRow}>
      {days.map((day, idx) => {
        const isActive = idx === activeDayIdx;
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => onSelectDay(idx)}
            style={s.weekDotCol}
            activeOpacity={0.7}
          >
            <Text style={s.dayLabel} maxFontSizeMultiplier={1.2}>{day.label}</Text>
            {isActive ? (
              <Animated.View style={[s.weekDot, s.weekDotActive, dotOpacityStyle]} />
            ) : (
              <View style={s.weekDot} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  weekRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: T.spacing.px6,
    backgroundColor: T.colors.bg1, padding: T.spacing.px4, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1,
  },
  weekDotCol: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: T.typography.sizes.caption, color: T.colors.t3, fontWeight: '600' },
  weekDot: { width: 8, height: 8, borderRadius: T.radii.xs, backgroundColor: T.colors.bg3 },
  weekDotActive: {
    backgroundColor: T.colors.forge,
    shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 3,
  },
});
