import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useForgeTheme } from "@/hooks/useForgeTheme";

// ─────────────────────────────────────────────────────────────────────────────
// ForgeSkeleton — shimmer loading placeholder
//
// Usage:
//   <ForgeSkeleton width="60%" height={20} radius={8} />
//   <ForgeSkeleton circle size={48} />
//   <ForgeSkeleton width="100%" height={120} radius={16} />
// ─────────────────────────────────────────────────────────────────────────────

interface ForgeSkeletonProps {
  width?: number | string;
  height?: number;
  /** Shorthand for full circle: sets width = height = size, radius = size/2 */
  circle?: boolean;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function ForgeSkeleton({
  width = '100%',
  height = 16,
  circle = false,
  size = 48,
  radius,
  style,
}: ForgeSkeletonProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const sk = useSk(ForgeTheme);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const resolvedWidth  = circle ? size : width;
  const resolvedHeight = circle ? size : height;
  const resolvedRadius = circle ? size / 2 : (radius ?? ForgeTheme.radii.sm);

  return (
    <Animated.View
      style={[
        {
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
          backgroundColor: ForgeTheme.colors.bg3,
        },
        animStyle,
        style,
      ] as any}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

// ── Preset skeleton layouts ───────────────────────────────────────────────────

/** Full card skeleton matching the Today's Plan card */
export function SkeletonHeroCard() {
    const { T: ForgeTheme } = useForgeTheme();
    const sk = useSk(ForgeTheme);
  return (
    <View style={useSk.card}>
      <ForgeSkeleton width="40%" height={10} radius={4} style={{ marginBottom: 10 }} />
      <ForgeSkeleton width="70%" height={22} radius={6} style={{ marginBottom: 8 }} />
      <ForgeSkeleton width="55%" height={14} radius={4} style={{ marginBottom: 20 }} />
      <ForgeSkeleton width="100%" height={48} radius={12} />
    </View>
  );
}

/** Two-column metric card row (rings + streak) */
export function SkeletonMetricRow() {
    const { T: ForgeTheme } = useForgeTheme();
    const sk = useSk(ForgeTheme);
  return (
    <View style={useSk.row}>
      <View style={useSk.halfCard}>
        <ForgeSkeleton circle size={80} style={{ marginBottom: 12 }} />
        <ForgeSkeleton width="60%" height={10} radius={4} />
      </View>
      <View style={useSk.halfCard}>
        <ForgeSkeleton circle size={48} style={{ marginBottom: 8 }} />
        <ForgeSkeleton width="40%" height={28} radius={6} style={{ marginBottom: 6 }} />
        <ForgeSkeleton width="80%" height={10} radius={4} />
      </View>
    </View>
  );
}

/** Single list item row */
export function SkeletonListItem({ isLast = false }: { isLast?: boolean }) {
    const { T: ForgeTheme } = useForgeTheme();
    const sk = useSk(ForgeTheme);
  return (
    <View style={[useSk.listItem, !isLast && useSk.listItemBorder]}>
      <ForgeSkeleton circle size={40} />
      <View style={{ flex: 1, gap: 6 }}>
        <ForgeSkeleton width="55%" height={14} radius={4} />
        <ForgeSkeleton width="35%" height={10} radius={4} />
      </View>
      <ForgeSkeleton width={50} height={22} radius={ForgeTheme.radii.sm} />
    </View>
  );
}

const useSk = (T: any) => StyleSheet.create({
          card: {
            backgroundColor: ForgeTheme.colors.bg1,
            borderRadius: ForgeTheme.radii.xl,
            borderWidth: 0.5,
            borderColor: ForgeTheme.colors.b1,
            padding: ForgeTheme.spacing.lg,
            marginHorizontal: ForgeTheme.spacing.page,
            marginBottom: ForgeTheme.spacing.lg,
          },
          row: {
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: ForgeTheme.spacing.page,
            marginBottom: ForgeTheme.spacing.lg,
          },
          halfCard: {
            flex: 1,
            backgroundColor: ForgeTheme.colors.bg1,
            borderRadius: ForgeTheme.radii.xl,
            borderWidth: 0.5,
            borderColor: ForgeTheme.colors.b1,
            padding: ForgeTheme.spacing.lg,
            alignItems: 'center',
          },
          listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: ForgeTheme.spacing.lg,
          },
          listItemBorder: {
            borderBottomWidth: 0.5,
            borderBottomColor: ForgeTheme.colors.b0,
          },
        });
