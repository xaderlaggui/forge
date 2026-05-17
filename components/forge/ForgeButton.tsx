import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useForgeTheme } from "@/hooks/useForgeTheme";

// ─────────────────────────────────────────────────────────────────────────────
// ForgeButton — Primary reusable button component
//
// Variants:
//   primary   → forge orange fill — ONE per screen section
//   secondary → ghost with forge border
//   ghost     → text-only, low emphasis
//   danger    → red fill — destructive actions
//
// Sizes: sm | md | lg
// ─────────────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ForgeButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show breathing pulse animation — only use on lone primary CTAs */
  pulse?: boolean;
  /** Show loading spinner, disables tap */
  loading?: boolean;
  /** Disable all interaction */
  disabled?: boolean;
  /** Optional left icon node */
  leftIcon?: React.ReactNode;
  /** Optional right icon node */
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export function ForgeButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  pulse = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  accessibilityLabel,
  testID,
}: ForgeButtonProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const styles = useStyles(ForgeTheme);
  const scale = useSharedValue(1);

  // Breathing pulse — only animate when requested and not disabled/loading
  React.useEffect(() => {
    if (pulse && !disabled && !loading) {
      scale.value = withRepeat(
        withTiming(1.04, { duration: ForgeTheme.motion.duration.pulse }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: ForgeTheme.motion.duration.fast });
    }
  }, [pulse, disabled, loading]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[pulseStyle, style]}>
      <TouchableOpacity
        style={[
          useStyles.base,
          useStyles[`size_${size}`],
          useStyles[`variant_${variant}`],
          isDisabled && useStyles.disabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.82}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#000' : variant === 'danger' ? '#fff' : ForgeTheme.colors.forge}
          />
        ) : (
          <View style={useStyles.inner}>
            {leftIcon && <View style={useStyles.iconLeft}>{leftIcon}</View>}
            <Text
              style={[
                useStyles.label,
                useStyles[`label_${size}`],
                useStyles[`labelColor_${variant}`],
                isDisabled && useStyles.labelDisabled,
              ]}
              maxFontSizeMultiplier={1.2}
            >
              {label}
            </Text>
            {rightIcon && <View style={useStyles.iconRight}>{rightIcon}</View>}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const { colors, radii, motion } = ForgeTheme;

const useStyles = (T: any) => StyleSheet.create({
          // ── Base ────────────────────────────────────────────────────────────────
          base: {
            borderRadius: radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          },
          inner: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          },

          // ── Sizes ────────────────────────────────────────────────────────────────
          size_sm: { height: 40, paddingHorizontal: 16 },
          size_md: { height: 52, paddingHorizontal: 24 },
          size_lg: { height: 60, paddingHorizontal: 32 },

          // ── Variants (background / border) ───────────────────────────────────────
          variant_primary: {
            backgroundColor: colors.forge,
            shadowColor: colors.forge,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.28,
            shadowRadius: 14,
            elevation: 6,
          },
          variant_secondary: {
            backgroundColor: colors.forgeDim,
            borderWidth: 1,
            borderColor: colors.forge,
          },
          variant_ghost: {
            backgroundColor: 'transparent',
          },
          variant_danger: {
            backgroundColor: colors.red,
            shadowColor: colors.red,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 4,
          },

          // ── Label colors ─────────────────────────────────────────────────────────
          label: {
            fontWeight: '700',
            letterSpacing: 0.2,
          },
          label_sm: { fontSize: 13 },
          label_md: { fontSize: 15 },
          label_lg: { fontSize: 17 },

          labelColor_primary:   { color: '#000000' },
          labelColor_secondary: { color: colors.forge },
          labelColor_ghost:     { color: colors.forge },
          labelColor_danger:    { color: '#fff' },

          // ── Disabled ─────────────────────────────────────────────────────────────
          disabled: { opacity: 0.45 },
          labelDisabled: {},

          // ── Icon spacing ─────────────────────────────────────────────────────────
          iconLeft:  {},
          iconRight: {},
        });
