import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { MascotImage } from '../../components/common/MascotImage';

export default function HoorayScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();

  // Entrance animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  React.useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) }));
    translateY.value = withDelay(100, withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) }));
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleContinue = () => {
    // This triggers a navigation to tabs.
    // The root layout will automatically push the /personalize modal since BMI is missing.
    router.replace('/(tabs)');
  };

  return (
    <View style={s.container}>
      <View style={s.innerWrapper}>
        <Animated.View style={[s.inner, animStyle]}>

          {/* Title and Mascot */}
          <MascotImage
            mascot="welcome"
            width={180}
            height={180}
            animation="slideUp"
            accessibilityLabel="Forge the bear cheering"
            style={{ alignSelf: 'center', marginBottom: 24 }}
          />
          <Text style={s.title}>You're all set!</Text>
          <Text style={s.subtitle}>Your account has been created successfully. Let's get to work.</Text>

          {/* CTA */}
          <TouchableOpacity
            style={s.btn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>Continue</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  innerWrapper: { flex: 1 },
  inner: {
    flex: 1, paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingBottom: 24,
    alignItems: 'center', justifyContent: 'center'
  },

  title: { fontSize: 28, fontWeight: '800', color: T.colors.t1, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: T.colors.t2, textAlign: 'center', marginBottom: 40, lineHeight: 24, paddingHorizontal: 20 },

  // Button
  btn: {
    width: '100%', height: 56,
    backgroundColor: T.colors.forge,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
