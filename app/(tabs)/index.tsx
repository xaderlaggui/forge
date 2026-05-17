import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AiCoachCard } from '../../components/forge/AiCoachCard';
import { MacroDonutRing } from '../../components/forge/MacroDonutRing';
import { StreakWidget } from '../../components/forge/StreakWidget';
import { MuscleTagChip, WorkoutListItem } from '../../components/forge/WorkoutAtoms';
import { ForgeTheme } from '../../constants/ForgeTheme';
import { useAiCoach } from '../../hooks/useAiCoach';
import { useNutrition } from '../../hooks/useNutrition';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useAuthStore } from '../../stores/authStore';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: nutrition, isLoading } = useNutrition();
  const { workouts } = useWorkouts();
  const { data: aiTip, isLoading: isAiLoading } = useAiCoach();

  // CTA pulse
  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1.05, { duration: 1500 }), -1, true);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={ForgeTheme.colors.forge} />
      </View>
    );
  }

  const waterLiters = (nutrition?.waterMl || 0) / 1000;
  const activeCals = nutrition?.totalCalories || 0;
  const waterGoal = 2.4;
  const calGoal = 2500;

  // Today's scheduled workout
  const todayDate = dayjs().format('YYYY-MM-DD');
  const todayWorkout = workouts?.find(w => w.date === todayDate);

  // Muscle group chips from today's workout
  const muscleTags: string[] = todayWorkout
    ? [...new Set(todayWorkout.exercises.flatMap(ex => (ex as any).muscleGroups || []))]
    : [];

  // Recent workouts (last 2)
  const recentWorkouts = [...(workouts || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);

  // Weekly activity (Mon–Sun: did user work out on each day this week?)
  const startOfWeek = dayjs().startOf('week').add(1, 'day');
  const weekActivity = Array.from({ length: 7 }).map((_, i) => {
    const d = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
    return !!(workouts || []).find(w => w.date === d);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>FORGE</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0)?.toUpperCase() || 'A'}</Text>
        </View>
      </View>

      {/* ── Greeting ── */}
      <View style={styles.px}>
        <Text style={styles.greetingSub}>{getGreeting()} · {dayjs().format('dddd')}</Text>
        <Text style={styles.greetingName}>{user?.displayName || 'Athlete'}</Text>
      </View>

      {/* ── Today's Plan Card ── */}
      <View style={styles.todayCard}>
        <LinearGradient
          colors={['#1C1C20', '#0A0A0B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Decorative blob */}
        <View style={styles.blobDecor} />

        <View style={styles.todayCardContent}>
          <Text style={styles.todayTag}>📅 Today's Plan</Text>
          <Text style={styles.todayWorkout}>
            {todayWorkout ? (todayWorkout.notes || 'Custom Workout') : 'Rest Day'}
          </Text>
          <Text style={styles.todayMeta}>
            {todayWorkout
              ? `${todayWorkout.exercises.length} exercises · Ready to train?`
              : 'Time to recover and hydrate.'}
          </Text>

          {/* Muscle tag chips */}
          {muscleTags.length > 0 && (
            <View style={styles.chipRow}>
              {muscleTags.slice(0, 4).map(tag => (
                <MuscleTagChip key={tag} label={tag} />
              ))}
            </View>
          )}

          {/* CTA Button with pulse */}
          <Animated.View style={[{ borderRadius: 14, backgroundColor: 'rgba(255,92,46,0.25)' }, pulseStyle]}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => router.push(todayWorkout ? '/activeWorkout' : '/(tabs)/workout')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>
                {todayWorkout ? '▶  Start Workout' : '+  Add Workout'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* ── Rings & Streak Row ── */}
      <View style={styles.ringsRow}>
        <View style={styles.card}>
          <MacroDonutRing
            calories={activeCals}
            calorieGoal={calGoal}
            waterLiters={waterLiters}
            waterGoal={waterGoal}
          />
        </View>
        <View style={styles.card}>
          <StreakWidget streak={(user as any)?.streak || 0} weekActivity={weekActivity} />
        </View>
      </View>

      {/* ── AI Coach Card ── */}
      <View style={styles.px}>
        <AiCoachCard
          tip={aiTip}
          isLoading={isAiLoading}
          onChatPress={() => router.push('/chat')}
        />
      </View>

      {/* ── Recent Workouts ── */}
      <View style={styles.px}>
        <Text style={styles.sectionLabel}>Recent Workouts</Text>
        <View style={styles.card}>
          {recentWorkouts.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: ForgeTheme.colors.t3, fontSize: 13 }}>No workouts logged yet.</Text>
            </View>
          ) : (
            recentWorkouts.map((workout, idx) => (
              <WorkoutListItem
                key={workout.id ?? `workout-${idx}`}
                title={workout.notes || 'Custom Workout'}
                date={dayjs().diff(dayjs(workout.date), 'day') === 0 ? 'Today' : dayjs().diff(dayjs(workout.date), 'day') === 1 ? 'Yesterday' : dayjs(workout.date).format('ddd, MMM D')}
                icon={idx === 0 ? '🦵' : '🔥'}
                stat={workout.exercises.length > 3 ? `${workout.exercises.length} exercises` : undefined}
                isLast={idx === recentWorkouts.length - 1}
                onPress={() => router.push({ pathname: '/activeWorkout', params: { id: workout.id } })}
              />
            ))
          )}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ForgeTheme.colors.bg0 },
  scrollContent: { paddingBottom: 110 },
  px: { paddingHorizontal: 20, marginBottom: 20 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  wordmark: { fontSize: 18, fontWeight: '800', letterSpacing: 2, color: ForgeTheme.colors.forge },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: ForgeTheme.colors.forge,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: ForgeTheme.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  greetingSub: { fontSize: 12, color: ForgeTheme.colors.t2, fontWeight: '500' },
  greetingName: { fontSize: 22, fontWeight: '700', color: ForgeTheme.colors.t1, marginTop: 2 },

  // Today card
  todayCard: {
    marginHorizontal: 20, marginBottom: 20,
    borderRadius: 20, borderWidth: 1, borderColor: ForgeTheme.colors.b1,
    overflow: 'hidden',
  },
  blobDecor: {
    position: 'absolute', top: -30, right: -20,
    width: 100, height: 100,
    backgroundColor: 'rgba(255,92,46,0.10)',
    borderRadius: 50,
    // blur via opacity layering (no blurRadius needed)
  },
  todayCardContent: { padding: 18, zIndex: 1 },
  todayTag: {
    fontSize: 10, fontWeight: '600', color: ForgeTheme.colors.forge,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
  },
  todayWorkout: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  todayMeta: { fontSize: 12, color: '#9B9BA8', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16 },
  btnPrimary: {
    backgroundColor: ForgeTheme.colors.forge,
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Cards
  ringsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: ForgeTheme.colors.bg1,
    borderRadius: 20, borderWidth: 1, borderColor: ForgeTheme.colors.b1,
    padding: 16, alignItems: 'center', justifyContent: 'center',
  },

  sectionLabel: {
    fontSize: 11, fontWeight: '500', color: ForgeTheme.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8,
  },
});
