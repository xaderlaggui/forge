import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Flame } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { ForgeTheme } from '../../constants/ForgeTheme';
import { useAiCoach } from '../../hooks/useAiCoach';
import { useNutrition } from '../../hooks/useNutrition';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useAuthStore } from '../../stores/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: nutrition, isLoading } = useNutrition();
  const { workouts } = useWorkouts();
  const { data: aiTip, isLoading: isAiLoading } = useAiCoach();

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1.05, { duration: 1500 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={ForgeTheme.colors.forge} />
      </View>
    );
  }

  const waterLiters = ((nutrition?.waterMl || 0) / 1000).toFixed(1);
  const activeCals = nutrition?.totalCalories || 0;

  const waterGoal = 2.4;
  const calGoal = 2500;

  // SVG Ring Calculations
  const r = 44;
  const c = 2 * Math.PI * r;
  const waterPercent = Math.min(parseFloat(waterLiters) / waterGoal, 1);
  const calPercent = Math.min(activeCals / calGoal, 1);

  const waterOffset = c - (waterPercent * c);

  const r2 = 32;
  const c2 = 2 * Math.PI * r2;
  const calOffset = c2 - (calPercent * c2);

  // Get today's scheduled workout if any
  const todayDate = dayjs().format('YYYY-MM-DD');
  const todayWorkout = workouts?.find(w => w.date === todayDate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>FORGE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={ForgeTheme.colors.t2} strokeWidth="1.8" strokeLinecap="round">
            <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </Svg>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'A'}</Text>
          </View>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.px}>
        <Text style={styles.greetingSub}>Good morning · {dayjs().format('dddd')}</Text>
        <Text style={styles.greetingName}>{user?.displayName || 'Athlete'}</Text>
      </View>

      {/* Today Card */}
      <View style={styles.todayCard}>
        <LinearGradient colors={['#1C1C20', '#0A0A0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
        <View style={styles.todayCardContent}>
          <Text style={styles.todayTag}>📅 TODAY'S PLAN</Text>
          <Text style={styles.todayWorkout}>{todayWorkout ? (todayWorkout.notes || 'Custom Workout') : 'Rest Day'}</Text>
          <Text style={styles.todayMeta}>{todayWorkout ? `${todayWorkout.exercises.length} exercises · Ready to train?` : 'Time to recover and hydrate.'}</Text>

          <Animated.View style={[{ borderRadius: 100, backgroundColor: 'rgba(255, 92, 46, 0.4)' }, pulseStyle]}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => router.push(todayWorkout ? '/activeWorkout' : '/(tabs)/workout')}
            >
              <Text style={styles.btnPrimaryText}>{todayWorkout ? '▶ Start Workout' : '+ Add Workout'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Rings & Streak */}
      <View style={styles.ringsRow}>
        <View style={styles.cardRings}>
          <View style={{ position: 'relative', width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width="96" height="96" viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx="50" cy="50" r="44" stroke="#1A2035" strokeWidth="8" fill="none" />
              <Circle cx="50" cy="50" r="32" stroke="#251614" strokeWidth="8" fill="none" />
              <Circle cx="50" cy="50" r="44" stroke={ForgeTheme.colors.blue} strokeWidth="8" fill="none" strokeDasharray={c} strokeDashoffset={waterOffset} strokeLinecap="round" />
              <Circle cx="50" cy="50" r="32" stroke={ForgeTheme.colors.forge} strokeWidth="8" fill="none" strokeDasharray={c2} strokeDashoffset={calOffset} strokeLinecap="round" />
            </Svg>
            <View style={{ position: 'absolute' }}>
              <Text style={{ fontSize: 10, color: ForgeTheme.colors.t2, fontWeight: '600' }}>{Math.round(calPercent * 100)}%</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ForgeTheme.colors.forge, marginBottom: 4 }} />
              <Text style={{ fontSize: 10, color: ForgeTheme.colors.t2 }}>{activeCals} cal</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ForgeTheme.colors.blue, marginBottom: 4 }} />
              <Text style={{ fontSize: 10, color: ForgeTheme.colors.t2 }}>{waterLiters} L</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardStreak}>
          <View style={styles.flameWrap}>
            <Flame size={24} color={ForgeTheme.colors.forge} />
          </View>
          <Text style={styles.streakNum}>{user?.streak || 0}</Text>
          <Text style={{ fontSize: 10, color: ForgeTheme.colors.t2, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, fontWeight: '600' }}>Day Streak</Text>
        </View>
      </View>

      {/* AI Coach Card */}
      <View style={styles.coachWrap}>
        <View style={[styles.card, styles.leftAccent, styles.halo]}>
          <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
            <View style={styles.coachAvatar}>
              <Bot size={18} color={ForgeTheme.colors.forge} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: ForgeTheme.colors.forge, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Personalized</Text>

              {isAiLoading ? (
                <ActivityIndicator size="small" color={ForgeTheme.colors.forge} style={{ alignSelf: 'flex-start' }} />
              ) : (
                <Text style={{ fontSize: 13, color: ForgeTheme.colors.t1, lineHeight: 20 }}>
                  {aiTip?.split(/(\*.*?\*|`.*?`)/g).map((chunk: string, i: number) => {
                    if (chunk.startsWith('*') && chunk.endsWith('*')) {
                      return <Text key={i} style={{ color: '#fff', fontWeight: 'bold' }}>{chunk.slice(1, -1)}</Text>;
                    }
                    return chunk;
                  })}
                </Text>
              )}

              <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/chat')}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: ForgeTheme.colors.forge }}>Chat with Coach ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

import { Bot } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ForgeTheme.colors.bg0 },
  scrollContent: { paddingBottom: 100 },
  px: { paddingHorizontal: 20, marginBottom: 16 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  wordmark: { fontSize: 18, fontWeight: '800', letterSpacing: 1, color: ForgeTheme.colors.forge },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: ForgeTheme.colors.forge, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  greetingSub: { fontSize: 12, color: ForgeTheme.colors.t2, fontWeight: '500' },
  greetingName: { fontSize: 22, fontWeight: '700', color: ForgeTheme.colors.t1, marginTop: 4 },

  todayCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: ForgeTheme.colors.b1, overflow: 'hidden', marginBottom: 20 },
  todayCardContent: { padding: 20, position: 'relative', zIndex: 1 },
  todayTag: { fontSize: 10, fontWeight: '700', color: ForgeTheme.colors.forge, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  todayWorkout: { fontSize: 20, fontWeight: '700', color: ForgeTheme.colors.t1, marginBottom: 4 },
  todayMeta: { fontSize: 13, color: ForgeTheme.colors.t2, marginBottom: 20 },
  btnPrimary: { backgroundColor: ForgeTheme.colors.forge, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  ringsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  cardRings: { flex: 1, backgroundColor: ForgeTheme.colors.bg1, borderRadius: 16, borderWidth: 1, borderColor: ForgeTheme.colors.b1, padding: 16, alignItems: 'center' },
  cardStreak: { flex: 1, backgroundColor: ForgeTheme.colors.bg1, borderRadius: 16, borderWidth: 1, borderColor: ForgeTheme.colors.b1, padding: 16, alignItems: 'center', justifyContent: 'center' },

  flameWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,92,46,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  streakNum: { fontSize: 28, fontWeight: '800', color: ForgeTheme.colors.t1 },

  coachWrap: { marginHorizontal: 20, marginBottom: 24 },
  card: { backgroundColor: ForgeTheme.colors.bg1, borderRadius: 16, borderWidth: 1, borderColor: ForgeTheme.colors.b1, overflow: 'hidden' },
  leftAccent: { borderLeftWidth: 3, borderLeftColor: ForgeTheme.colors.forge },
  halo: { shadowColor: ForgeTheme.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  coachAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: ForgeTheme.colors.bg2, alignItems: 'center', justifyContent: 'center' },
  chatBtn: { alignSelf: 'flex-start', backgroundColor: ForgeTheme.colors.bg2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
});
