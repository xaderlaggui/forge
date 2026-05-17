import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ImageStyle } from 'react-native';
import { MascotImages, MascotKey } from '../../constants/mascotImages';

interface MascotImageProps {
  mascot: MascotKey;
  width: number;
  height: number;
  animation?: 'none' | 'slideUp' | 'breathe';
  style?: StyleProp<ImageStyle>;
  accessibilityLabel: string;
  decorative?: boolean;
}

export const MascotImage: React.FC<MascotImageProps> = ({
  mascot,
  width,
  height,
  animation = 'none',
  style,
  accessibilityLabel,
  decorative = false,
}) => {
  const animValue = useRef(
    new Animated.Value(animation === 'slideUp' ? 60 : 1)
  ).current;

  useEffect(() => {
    if (animation === 'slideUp') {
      Animated.spring(animValue, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }

    if (animation === 'breathe') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.04,
            duration: 1250,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1.0,
            duration: 1250,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => animValue.stopAnimation();
  }, []);

  const animatedStyle =
    animation === 'slideUp'
      ? { transform: [{ translateY: animValue }] }
      : animation === 'breathe'
      ? { transform: [{ scale: animValue }] }
      : {};

  return (
    <Animated.Image
      source={MascotImages[mascot]}
      style={[{ width, height }, animatedStyle, style] as any}
      resizeMode="contain"
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
    />
  );
};
