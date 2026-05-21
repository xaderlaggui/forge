import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ForgeButton } from '../../components/forge/ForgeButton';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { SpriteMascot } from '../../components/forge/SpriteMascot';
import { onboardingSpriteSequence } from '../../features/sprites/OnboardingSpriteSequence';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const { T } = useForgeTheme();
    const s = useS(T);

  const SLIDES = [
    {
      id: '1',
      index: 0,
      title: 'Train Like A Pro',
      description: 'Dynamic PPL splits constructed mathematically for your specific body and frequency.',
    },
    {
      id: '2',
      index: 1,
      title: 'Macro Precision',
      description: 'Calculates your exact TDEE to give you perfect caloric targets whether you want to shred or bulk.',
    },
    {
      id: '3',
      index: 2,
      title: 'Progressive Overload',
      description: 'The app remembers your reps and automatically increments your weights every week.',
    }
  ];

  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={s.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const config = onboardingSpriteSequence.getSpriteForStep(item.index);
          return (
            <View style={s.slide}>
              <TouchableOpacity style={s.iconWrap} activeOpacity={0.8} onPress={() => alert(config.messageSuggestion)}>
                <SpriteMascot 
                  spriteId={config.spriteId} 
                  animation={config.animation} 
                  size="xl" 
                />
              </TouchableOpacity>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.description}>{item.description}</Text>
            </View>
          );
        }}
      />

      <View style={s.footer}>
        <View style={s.pagination}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, currentIndex === i && s.dotActive]} />
          ))}
        </View>

        <ForgeButton
          label={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          onPress={nextSlide}
          pulse={currentIndex === SLIDES.length - 1}
        />
        
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity style={s.skipBtn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={s.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
          container: { flex: 1, backgroundColor: T.colors.bg0 },
          slide: {
            width,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: T.spacing.page * 2,
            paddingBottom: 100, // Make room for footer
          },
          iconWrap: {
            width: 220, height: 220, borderRadius: 110,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 40,
          },
          title: {
            fontSize: 32, fontWeight: '800', color: T.colors.t1,
            marginBottom: 16, textAlign: 'center',
          },
          description: {
            fontSize: 16, color: T.colors.t2, textAlign: 'center',
            lineHeight: 24,
          },
          footer: {
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingHorizontal: T.spacing.page,
            paddingBottom: 60,
            paddingTop: 20,
            backgroundColor: T.colors.bg0,
          },
          pagination: {
            flexDirection: 'row', justifyContent: 'center', gap: 8,
            marginBottom: 32,
          },
          dot: {
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: T.colors.b1,
          },
          dotActive: {
            width: 24,
            backgroundColor: T.colors.forge,
          },
          skipBtn: {
            marginTop: 20, alignItems: 'center'
          },
          skipText: {
            color: T.colors.t3, fontSize: 14, fontWeight: '600', textTransform: 'uppercase'
          }
        });
