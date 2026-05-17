import { Flame } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useForgeTheme } from "@/hooks/useForgeTheme";

// ─────────────────────────────────────────────────────────────────────────────
// StreakWidget v2 — Animated flame + gold streak number + 7-day dots
// ─────────────────────────────────────────────────────────────────────────────

interface StreakWidgetProps {
  streak: number;
  /** 7 booleans — Mon → Sun. true = activity logged that day */
  weekActivity: boolean[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakWidget({ streak, weekActivity }: StreakWidgetProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const styles = useStyles(ForgeTheme);
  // Flame flicker — subtle scale + opacity pulse
  const flameScale   = useSharedValue(1);
  const flameOpacity = useSharedValue(0.85);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 600 }),
        withTiming(0.96, { duration: 500 }),
        withTiming(1.08, { duration: 400 }),
        withTiming(1.00, { duration: 500 }),
      ),
      -1,
      false
    );
    flameOpacity.value = withRepeat(
      withSequence(
        withTiming(1,    { duration: 600 }),
        withTiming(0.75, { duration: 500 }),
        withTiming(1,    { duration: 900 }),
      ),
      -1,
      false
    );
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
    opacity:   flameOpacity.value,
  }));

  const hasStreak = streak > 0;

  return (
    <View style={useStyles.wrapper}>
      {/* Flame icon with glow ring */}
      <View style={useStyles.flameRing}>
        <Animated.View style={flameStyle}>
          <Flame
            size={26}
            color={hasStreak ? ForgeTheme.colors.gold : ForgeTheme.colors.t3}
            fill={hasStreak ? ForgeTheme.colors.gold : 'transparent'}
            strokeWidth={1.2}
          />
        </Animated.View>
      </View>

      {/* Streak number */}
      <Text
        style={[useStyles.streakNum, hasStreak && useStyles.streakNumActive]}
        maxFontSizeMultiplier={1.2}
      >
        {streak}
      </Text>
      <Text style={useStyles.streakLabel} maxFontSizeMultiplier={1.2}>
        Day Streak
      </Text>

      {/* 7-day activity dots */}
      <View style={useStyles.weekRow}>
        {DAY_LABELS.map((label, i) => {
          const active = weekActivity[i] ?? false;
          return (
            <View key={i} style={useStyles.dayCol}>
              <Text style={useStyles.dayLabel}>{label}</Text>
              <View
                style={[
                  useStyles.dayDot,
                  active ? useStyles.dayDotActive : useStyles.dayDotEmpty,
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const { colors, radii, spacing } = ForgeTheme;

const useStyles = (T: any) => StyleSheet.create({
          wrapper: {
            alignItems: 'center',
            paddingVertical: spacing.px2,
          },

          // Flame
          flameRing: {
            width: 52,
            height: 52,
            borderRadius: radii.full,
            backgroundColor: colors.goldDim,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.px2,
            shadowColor: colors.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 14,
            elevation: 4,
          },

          // Streak number
          streakNum: {
            fontSize: 30,
            fontWeight: '800',
            color: colors.t3,         // grey when no streak
            lineHeight: 36,
            letterSpacing: -0.5,
          },
          streakNumActive: {
            color: colors.gold,        // gold when streak > 0
          },

          streakLabel: {
            fontSize: 10,
            fontWeight: '600',
            color: colors.t3,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginTop: 2,
            marginBottom: spacing.px3,
          },

          // 7-day row
          weekRow: {
            flexDirection: 'row',
            gap: 5,
          },
          dayCol: {
            alignItems: 'center',
            gap: 4,
          },
          dayLabel: {
            fontSize: 8,
            fontWeight: '600',
            color: colors.t3,
            textTransform: 'uppercase',
          },
          dayDot: {
            width: 7,
            height: 7,
            borderRadius: radii.full,
          },
          dayDotEmpty: {
            backgroundColor: colors.bg3,
            borderWidth: 0.5,
            borderColor: colors.b1,
          },
          dayDotActive: {
            backgroundColor: colors.gold,
            shadowColor: colors.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2,
          },
        });
