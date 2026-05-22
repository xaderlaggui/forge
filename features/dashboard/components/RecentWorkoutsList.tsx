import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { WorkoutListItem } from '../../../components/forge/WorkoutAtoms';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { MascotImages } from '../../../constants/mascotImages';
import { SpriteMascot } from '../../../components/forge/SpriteMascot';
import { EmptyStateSpriteMap } from '../../sprites/EmptyStateSpriteMap';
import { getSpriteForActivity } from '../../sprites/activity-sprite-map';

interface RecentWorkoutsListProps {
  recentActivity: any[];
}

export function RecentWorkoutsList({ recentActivity }: RecentWorkoutsListProps) {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();

  return (
    <View style={s.section}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Recent Workouts</Text>
      <View style={{ ...T.shadows.lift, borderRadius: T.radii.xl }}>
        <View style={s.card}>
        {recentActivity.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconWrap}>
              <SpriteMascot spriteId={EmptyStateSpriteMap.no_workouts.spriteId} animation="static" size="sm" />
            </View>
            <Text style={s.emptyTitle} maxFontSizeMultiplier={1.2}>No activity yet</Text>
            <Text style={s.emptyBody} maxFontSizeMultiplier={1.2}>
              {EmptyStateSpriteMap.no_workouts.message}
            </Text>
            <ForgeButton
              label="+ Add Workout"
              onPress={() => router.push('/(tabs)/workout')}
              variant="secondary"
              size="sm"
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          recentActivity.map((item, idx) => {
            const daysAgo = dayjs().diff(dayjs(item.date), 'day');
            const dateLabel =
              daysAgo === 0 ? 'Today' :
              daysAgo === 1 ? 'Yesterday' :
              dayjs(item.date).format('ddd, MMM D');
            
            if (item._type === 'meal') {
              const totalCals = item.loggedMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
              return (
                <WorkoutListItem
                  key={item.id ?? `meal-${idx}`}
                  title="Nutrition Log"
                  date={dateLabel}
                  icon={
                    <Image
                      source={require('../../../assets/images/nutrition-removebg.png')}
                      style={{ width: 38, height: 38, resizeMode: 'contain' }}
                    />
                  }
                  stat={`${totalCals} kcal`}
                  isLast={idx === recentActivity.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: '/addMeal',
                      params: { date: item.date },
                    })
                  }
                />
              );
            }

            return (
              <WorkoutListItem
                key={item.id ?? `workout-${idx}`}
                title={item.notes ?? 'Custom Workout'}
                date={dateLabel}
                icon={
                  <View style={{ width: 38, height: 38, justifyContent: 'center', alignItems: 'center' }}>
                    <SpriteMascot spriteId={getSpriteForActivity(item.notes, item.type)} size="sm" />
                  </View>
                }
                stat={
                  item.exercises?.length > 3
                    ? `${item.exercises.length} exercises`
                    : undefined
                }
                isLast={idx === recentActivity.length - 1}
                onPress={() =>
                  router.push({
                    pathname: '/workoutDetail',
                    params: { id: item.id },
                  })
                }
              />
            );
          })
        )}
      </View>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  section: { paddingHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: T.spacing.px2,
  },
  card: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.xl,
    borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden',
  },
  emptyState: { alignItems: 'center', paddingVertical: T.spacing.px7, paddingHorizontal: T.spacing.px6 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: T.spacing.px3,
    overflow: 'hidden',
  },
  emptyTitle: { fontSize: T.typography.sizes.h3, fontWeight: '700', color: T.colors.t1, marginBottom: 6 },
  emptyBody: { fontSize: T.typography.sizes.bodyS, color: T.colors.t3, textAlign: 'center', lineHeight: T.typography.sizes.bodyS * 1.5 },
});
