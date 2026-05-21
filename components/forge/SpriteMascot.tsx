import React, { useEffect } from 'react';
import { Image, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing, withSpring } from 'react-native-reanimated';
import { spriteAssets } from '../../features/sprites/sprite-assets';
import { AnimationType, ScreenType } from '../../features/sprites/sprite-types';
import { screenToDefaultSpriteMap } from '../../features/sprites/sprite-map';

interface SpriteMascotProps {
  spriteId?: string;
  screen?: ScreenType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  animation?: AnimationType;
}

const SIZE_MAP = {
  sm:  64,
  md:  96,
  lg:  144,
  xl:  208,
};

export const SpriteMascot: React.FC<SpriteMascotProps> = ({
  spriteId,
  screen,
  size = 'md',
  style,
  imageStyle,
  animation = 'static',
}) => {
  const finalSpriteId = spriteId || (screen ? screenToDefaultSpriteMap[screen] : 'forge');
  const src = spriteAssets[finalSpriteId] || spriteAssets['forge'];
  const dimension = SIZE_MAP[size];

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  // Enforce zero-movement rules for certain screens
  const isStaticScreen = screen === 'home' || screen === 'workout_start' || screen === 'workout_active' || screen === 'workout_complete';
  const effectiveAnimation = isStaticScreen ? 'static' : animation;

  useEffect(() => {
    // Reset values
    translateY.value = 0;
    translateX.value = 0;
    opacity.value = 1;
    scale.value = 1;

    if (effectiveAnimation === 'fade-in') {
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 300 });
    } else if (effectiveAnimation === 'slide-in-right') {
      translateX.value = 50;
      opacity.value = 0;
      translateX.value = withSpring(0, { damping: 12 });
      opacity.value = withTiming(1, { duration: 300 });
    } else if (effectiveAnimation === 'bounce-in') {
      scale.value = 0;
      opacity.value = 0;
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
    } else if (effectiveAnimation === 'static') {
      opacity.value = 1;
    }
  }, [finalSpriteId, effectiveAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View style={[
      { width: dimension, height: dimension, maxWidth: 320 },
      animatedStyle,
      style
    ]}>
      <Image
        source={src}
        style={[{ width: '100%', height: '100%', resizeMode: 'contain' }, imageStyle]}
      />
    </Animated.View>
  );
};
