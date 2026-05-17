import React, { useEffect } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface ForgeSegmentProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export function ForgeSegment({ options, value, onChange }: ForgeSegmentProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const styles = useStyles(ForgeTheme);
  const activeIdx = Math.max(0, options.indexOf(value));
  const translateX = useSharedValue(0);
  const [tabWidth, setTabWidth] = React.useState(0);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(activeIdx * tabWidth, ForgeTheme.motion.spring);
    }
  }, [activeIdx, tabWidth]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setTabWidth(width / Math.max(1, options.length));
  };

  return (
    <View style={useStyles.container} onLayout={handleLayout}>
      {tabWidth > 0 && (
        <Animated.View
          style={[
            useStyles.activeBg,
            animStyle,
            { width: tabWidth - 8 }, // subtract 4px padding on each side
          ]}
        />
      )}
      {options.map((opt) => {
        const isActive = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={useStyles.tab}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[useStyles.text, isActive && useStyles.textActive]}
              maxFontSizeMultiplier={1.2}
            >
              {opt.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const { colors, radii, typography } = ForgeTheme;

const useStyles = (T: any) => StyleSheet.create({
          container: {
            flexDirection: 'row',
            backgroundColor: colors.bg1,
            borderRadius: radii.md,
            padding: 4,
            borderWidth: 0.5,
            borderColor: colors.b1,
            position: 'relative',
          },
          activeBg: {
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            backgroundColor: colors.bg3,
            borderRadius: radii.sm,
            borderWidth: 0.5,
            borderColor: colors.b2,
          },
          tab: {
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          },
          text: {
            fontSize: typography.sizes.label,
            fontWeight: '600',
            color: colors.t3,
            letterSpacing: 0.8,
          },
          textActive: {
            color: colors.t1,
          },
        });
