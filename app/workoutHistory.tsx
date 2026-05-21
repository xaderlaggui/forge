import { BEAR } from '@/constants/bearAssets';
import { useAllNutritionLogs } from '@/hooks/useAllNutritionLogs';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import dayjs from 'dayjs';
import { formatDuration } from '../utils/format';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { BearMascot } from '../components/forge/BearMascot';
import { SpriteMascot } from '../components/forge/SpriteMascot';
import { EmptyStateSpriteMap } from '../features/sprites/EmptyStateSpriteMap';
import { useWorkouts } from '../hooks/useWorkouts';

// ── Activity Images (using Bear mascot assets) ──
const ACTIVITY_IMAGES: Record<string, any> = {
  strength: BEAR.LIFTING,
  run: BEAR.RUNNING,
  walk: BEAR.RUNNING,
  cardio: BEAR.RUNNING,
  meal: require('../assets/images/nutrition-removebg.png'),
};

// ── Unified Activity Item ──
interface ActivityItem {
  id: string;
  date: string;
  type: 'strength' | 'run' | 'walk' | 'cardio' | 'meal';
  title: string;
  subtitle?: string;
  photoUrl?: string | null;
  pills: { label: string; accent?: boolean }[];
  navigateTo?: { pathname: string; params?: Record<string, string> };
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function WorkoutHistoryScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { nutritionLogs, isLoading: isNutritionLogsLoading } = useAllNutritionLogs();
  
  const isLoading = isWorkoutsLoading || isNutritionLogsLoading;

  const activityFeed: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    // ── Map workouts ──
    for (const w of workouts) {
      const wType = (w.type || 'strength') as ActivityItem['type'];
      const isCardio = wType === 'run' || wType === 'walk' || wType === 'cardio';

      // Calculate volume for strength workouts
      let vol = 0;
      w.exercises?.forEach((ex: any) => {
        ex.sets?.forEach((s: any) => { vol += (s.weight || 0) * (s.reps || 0); });
      });

      const pills: ActivityItem['pills'] = [];
      if (w.durationMin) pills.push({ label: formatDuration(w.durationMin) });

      if (isCardio && w.distanceKm) {
        pills.push({ label: `${w.distanceKm} km`, accent: true });
      }
      if (isCardio && w.steps) {
        pills.push({ label: `${w.steps.toLocaleString()} steps` });
      }
      if (!isCardio && vol > 0) {
        pills.push({ label: `${vol.toLocaleString()} lbs` });
      }
      if (!isCardio && (w.exercises?.length ?? 0) > 0) {
        pills.push({ label: `${w.exercises!.length} exercises` });
      }
      if (w.calories) {
        pills.push({ label: `${w.calories} kcal` });
      }

      items.push({
        id: w.id || `workout-${w.date}`,
        date: w.date,
        type: wType,
        title: w.notes || (isCardio ? `${capitalize(wType)} Session` : 'Strength Workout'),
        subtitle: dayjs(w.date).format('ddd, MMM D YYYY'),
        photoUrl: w.photoUrl,
        pills,
        navigateTo: { pathname: '/workoutDetail', params: { id: w.id } },
      });
    }

    // ── Map nutrition logs (only those with actual food logged) ──
    for (const log of nutritionLogs) {
      const loggedMeals = (log.meals || []).filter((m: any) => m.calories > 0);
      if (loggedMeals.length === 0) continue;

      const totalCals = loggedMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
      const totalProtein = loggedMeals.reduce((sum: number, m: any) => sum + (m.protein || 0), 0);
      const totalCarbs = loggedMeals.reduce((sum: number, m: any) => sum + (m.carbs || 0), 0);
      const totalFat = loggedMeals.reduce((sum: number, m: any) => sum + (m.fat || 0), 0);

      const mealNames = loggedMeals.map((m: any) => m.name).join(', ');

      const pills: ActivityItem['pills'] = [
        { label: `${totalCals} kcal`, accent: true },
        { label: `P ${totalProtein}g` },
        { label: `C ${totalCarbs}g` },
        { label: `F ${totalFat}g` },
      ];

      if (log.waterMl && log.waterMl > 0) {
        pills.push({ label: `💧 ${log.waterMl}ml` });
      }

      items.push({
        id: `meal-${log.date}`,
        date: log.date,
        type: 'meal',
        title: `Nutrition — ${mealNames}`,
        subtitle: dayjs(log.date).format('ddd, MMM D YYYY'),
        pills,
      });
    }

    // Sort by date descending
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts, nutritionLogs]);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={T.colors.t1} />
        </TouchableOpacity>
        <View>
          <Text style={s.headerSub}>Activity</Text>
          <Text style={s.headerTitle}>History</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={[s.emptyState, { marginTop: 100 }]}>
            <ActivityIndicator size="large" color={T.colors.forge} />
          </View>
        ) : activityFeed.length === 0 ? (
          <View style={s.emptyState}>
            <SpriteMascot spriteId={EmptyStateSpriteMap.no_workouts.spriteId} animation="bounce-in" size="xl" style={{ marginBottom: 20 }} />
            <Text style={s.emptyTitle}>No activity yet</Text>
            <Text style={s.emptySub}>{EmptyStateSpriteMap.no_workouts.message}</Text>
          </View>
        ) : (
          activityFeed.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={s.card}
              activeOpacity={0.75}
              onPress={() => item.navigateTo && router.push(item.navigateTo as any)}
              disabled={!item.navigateTo}
            >
              {/* Activity Image */}
              <View style={s.imageWrap}>
                <Image
                  source={item.photoUrl ? { uri: item.photoUrl } : (ACTIVITY_IMAGES[item.type] || ACTIVITY_IMAGES.strength)}
                  style={item.photoUrl ? { width: '100%', height: '100%' } : s.activityImage}
                  resizeMode={item.photoUrl ? 'cover' : 'contain'}
                />
              </View>

              {/* Content */}
              <View style={s.cardBody}>
                {/* Type Badge */}
                <View style={s.typeBadgeRow}>
                  <View style={[s.typeBadge, item.type === 'meal' && { backgroundColor: T.colors.greenDim || 'rgba(76,175,80,0.15)' }]}>
                    <Text style={[
                      s.typeBadgeText,
                      item.type === 'meal' && { color: '#4CAF50' }
                    ]}>
                      {capitalize(item.type)}
                    </Text>
                  </View>
                </View>

                <Text style={s.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={s.cardDate}>
                  {item.subtitle}
                </Text>

                {/* Pills */}
                <View style={s.pillRow}>
                  {item.pills.map((pill, pidx) => (
                    <View key={pidx} style={[s.pill, pill.accent && s.pillAccent]}>
                      <Text style={[s.pillText, pill.accent && s.pillTextAccent]}>{pill.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Chevron for navigable items */}
              {item.navigateTo && (
                <ChevronRight size={18} color={T.colors.t3} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },

  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: T.spacing.page,
    backgroundColor: T.colors.bg0, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: T.colors.bg2, alignItems: 'center', justifyContent: 'center',
  },
  headerSub: { fontSize: 12, fontWeight: '500', color: T.colors.t3, marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: T.colors.t1 },

  content: { padding: T.spacing.page, paddingBottom: 60 },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: T.colors.t1, marginBottom: 8 },
  emptySub: { fontSize: 14, color: T.colors.t3, textAlign: 'center' },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.colors.bg1, borderRadius: T.radii.xl,
    borderWidth: 0.5, borderColor: T.colors.b1,
    padding: 14, marginBottom: 12,
    gap: 12,
  },
  imageWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  activityImage: {
    width: 44, height: 44,
  },
  cardBody: { flex: 1 },

  typeBadgeRow: { flexDirection: 'row', marginBottom: 4 },
  typeBadge: {
    backgroundColor: T.colors.forgeDim,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: T.radii.full,
  },
  typeBadgeText: {
    fontSize: 10, fontWeight: '800', color: T.colors.forge,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },

  cardTitle: { fontSize: 14, fontWeight: '700', color: T.colors.t1, marginBottom: 2 },
  cardDate: { fontSize: 11, fontWeight: '500', color: T.colors.t3, marginBottom: 8 },

  pillRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  pill: {
    backgroundColor: T.colors.bg2, borderRadius: T.radii.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: T.colors.b1,
  },
  pillAccent: {
    backgroundColor: T.colors.forgeDim,
    borderColor: T.colors.forge + '30',
  },
  pillText: { fontSize: 10, fontWeight: '600', color: T.colors.t2 },
  pillTextAccent: { color: T.colors.forge, fontWeight: '700' },
});
