import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ForgeTheme as T } from '../constants/ForgeTheme';

/**
 * Splash screen — shown on first app load.
 * Fades in the FORGE wordmark with a glow, then navigates to login.
 *
 * Route: app/splash.tsx
 * The root _layout.tsx should redirect here before checking auth state.
 */
export default function SplashScreen() {
  const router = useRouter();

  const opacity   = useSharedValue(0);
  const scale     = useSharedValue(0.92);
  const glowOpacity = useSharedValue(0);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const navigate = () => router.replace('/(auth)/login');

  useEffect(() => {
    // Animate in
    opacity.value   = withTiming(1, { duration: 900, easing: Easing.out(Easing.exp) });
    scale.value     = withTiming(1,   { duration: 900, easing: Easing.out(Easing.exp) });
    glowOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    // Navigate out after 2.2s
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) runOnJS(navigate)();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      {/* Radial glow blob behind the wordmark */}
      <Animated.View style={[s.glow, glowStyle]} />

      <Animated.View style={[s.wordmarkWrap, wordmarkStyle]}>
        <Text style={s.wordmark}>FORGE</Text>
        <Text style={s.tagline}>Build your best self.</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.bg0,  // #0A0A0B — deep off-black from ZIP
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,92,46,0.12)',
    // simulate radial blur via nested scaling
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
    elevation: 0,
  },
  wordmarkWrap: { alignItems: 'center', gap: 12 },
  wordmark: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 6,
    color: T.colors.forge,
    // Glow effect via text shadow
    textShadowColor: 'rgba(255,92,46,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: T.colors.t3,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
