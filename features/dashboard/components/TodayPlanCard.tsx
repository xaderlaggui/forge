import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { MuscleTagChip } from '../../../components/forge/WorkoutAtoms';
import { SkeletonHeroCard } from '../../../components/forge/ForgeSkeleton';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';

interface TodayPlanCardProps {
  isLoading: boolean;
  todayWorkout: any;
  muscleTags: string[];
}

export function TodayPlanCard({ isLoading, todayWorkout, muscleTags }: TodayPlanCardProps) {
  const router = useRouter();

  if (isLoading) {
    return <SkeletonHeroCard />;
  }

  return (
    <View style={s.todayCard}>
      <LinearGradient
        colors={['#1C1C22', '#0E0E11']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Decorative accent blob */}
      <View style={s.blobDecor} />

      <View style={s.todayCardContent}>
        <Text style={s.todayTag} maxFontSizeMultiplier={1.2}>📅 Today's Plan</Text>
        <Text style={s.todayWorkoutName} maxFontSizeMultiplier={1.2}>
          {todayWorkout ? (todayWorkout.notes ?? 'Custom Workout') : 'Rest Day'}
        </Text>
        <Text style={s.todayMeta} maxFontSizeMultiplier={1.2}>
          {todayWorkout
            ? `${todayWorkout.exercises.length} exercises · Ready to train?`
            : 'Time to recover and hydrate.'}
        </Text>

        {/* Muscle chips */}
        {muscleTags.length > 0 && (
          <View style={s.chipRow}>
            {muscleTags.slice(0, 4).map(tag => (
              <MuscleTagChip key={tag} label={tag} />
            ))}
          </View>
        )}

        {/* CTA */}
        <ForgeButton
          label={todayWorkout ? '▶  Start Workout' : '+  Add Workout'}
          onPress={() => router.push(todayWorkout ? '/activeWorkout' : '/(tabs)/workout')}
          variant="primary"
          size="md"
          pulse
          accessibilityLabel={todayWorkout ? "Start today's workout" : "Add a new workout"}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  todayCard: {
    marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5,
    borderRadius: T.radii.xl, borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden',
  },
  blobDecor: {
    position: 'absolute', top: -24, right: -20,
    width: 110, height: 110, borderRadius: 55, backgroundColor: T.colors.forgeDim,
  },
  todayCardContent: { padding: T.spacing.px5, zIndex: 1 },
  todayTag: {
    fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.forge,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },
  todayWorkoutName: { fontSize: T.typography.sizes.h2, fontWeight: '700', color: T.colors.t1, marginBottom: 4 },
  todayMeta: {
    fontSize: T.typography.sizes.bodyS, color: T.colors.t2, marginBottom: T.spacing.px4,
    lineHeight: T.typography.sizes.bodyS * 1.5,
  },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: T.spacing.px4 },
});
