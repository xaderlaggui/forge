import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SpriteMascot } from '../../components/forge/SpriteMascot';
import { useForgeTheme } from '../../hooks/useForgeTheme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Forge Your Body',
    subtitle: 'Track your workouts, log your meals, and watch yourself grow stronger every day.',
    spriteId: 'welcome',
    animation: 'idle',
  },
  {
    id: '2',
    title: 'AI-Powered Plans',
    subtitle: 'Let our intelligent AI coach build the perfect routine tailored specifically to your goals.',
    spriteId: 'idea',
    animation: 'popIn',
  },
  {
    id: '3',
    title: 'Achieve Greatness',
    subtitle: 'Stay consistent, hit your targets, and unlock your true physical potential.',
    spriteId: 'cheer',
    animation: 'jump',
  },
];

export default function OnboardingScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('onboarding_seen', 'true');
      router.replace('/(auth)/signup');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    router.replace('/(auth)/signup');
  };

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
        <Text style={s.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={s.slide}>
            <View style={s.imageContainer}>
              <SpriteMascot spriteId={item.spriteId} animation={item.animation} size="xl" />
            </View>
            <View style={s.textContainer}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={s.footer}>
        {/* Dots */}
        <View style={s.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                s.dot,
                currentIndex === index && s.dotActive
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={s.btnText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.bg0,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: T.colors.t3,
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    width,
    height: height * 0.75,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: height * 0.15,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    height: 120,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: T.colors.t1,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: T.colors.t2,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.colors.b1,
    marginHorizontal: 6,
  },
  dotActive: {
    width: 24,
    backgroundColor: T.colors.forge,
  },
  btn: {
    width: '100%',
    height: 56,
    backgroundColor: T.colors.forge,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
