import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { WorkoutListItem } from '../../../components/forge/WorkoutAtoms';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';

interface RecentWorkoutsListProps {
  recentWorkouts: any[];
}

export function RecentWorkoutsList({ recentWorkouts }: RecentWorkoutsListProps) {
  const router = useRouter();

  return (
    <View style={s.section}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Recent Workouts</Text>
      <View style={s.card}>
        {recentWorkouts.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon} maxFontSizeMultiplier={1.2}>🏋️</Text>
            <Text style={s.emptyTitle} maxFontSizeMultiplier={1.2}>No workouts yet</Text>
            <Text style={s.emptyBody} maxFontSizeMultiplier={1.2}>
              Log your first session to start tracking progress.
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
          recentWorkouts.map((workout, idx) => {
            const daysAgo = dayjs().diff(dayjs(workout.date), 'day');
            const dateLabel =
              daysAgo === 0 ? 'Today' :
              daysAgo === 1 ? 'Yesterday' :
              dayjs(workout.date).format('ddd, MMM D');
            return (
              <WorkoutListItem
                key={workout.id ?? `workout-${idx}`}
                title={workout.notes ?? 'Custom Workout'}
                date={dateLabel}
                icon={idx === 0 ? '🦵' : '🔥'}
                stat={
                  workout.exercises.length > 3
                    ? `${workout.exercises.length} exercises`
                    : undefined
                }
                isLast={idx === recentWorkouts.length - 1}
                onPress={() =>
                  router.push({
                    pathname: '/activeWorkout',
                    params: { id: workout.id },
                  })
                }
              />
            );
          })
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
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
  emptyIcon: { fontSize: 36, marginBottom: T.spacing.px3 },
  emptyTitle: { fontSize: T.typography.sizes.h3, fontWeight: '700', color: T.colors.t1, marginBottom: 6 },
  emptyBody: { fontSize: T.typography.sizes.bodyS, color: T.colors.t3, textAlign: 'center', lineHeight: T.typography.sizes.bodyS * 1.5 },
});
