import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MascotImage } from '../../../components/common/MascotImage';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { SkeletonHeroCard } from '../../../components/forge/ForgeSkeleton';
import { MuscleTagChip } from '../../../components/forge/WorkoutAtoms';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface TodayPlanCardProps {
  isLoading: boolean;
  plannedWorkout: any;
  loggedWorkout: any;
  muscleTags: string[];
}

export function TodayPlanCard({ isLoading, plannedWorkout, loggedWorkout, muscleTags }: TodayPlanCardProps) {
    const { T } = useForgeTheme();
    const s = useS(T);
  const router = useRouter();

  if (isLoading) {
    return <SkeletonHeroCard />;
  }

  const isRestDay = !plannedWorkout || plannedWorkout.dayType === 'Rest';
  const isCompleted = !!loggedWorkout;

  return (
    <View style={{ position: 'relative', overflow: 'visible', marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5 }}>
      <View style={[s.todayCard, { marginHorizontal: 0, marginBottom: 0 }]}>
        <LinearGradient
          colors={[T.colors.bg1, T.colors.bg2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={s.blobDecor} />

        <View style={s.todayCardContent}>
          <Text style={s.todayTag} maxFontSizeMultiplier={1.2}>
            {isCompleted ? '✅ COMPLETED TODAY' : '📅 Today\'s Plan'}
          </Text>
          <Text style={s.todayWorkoutName} maxFontSizeMultiplier={1.2}>
            {isRestDay ? 'Active Recovery' : plannedWorkout.title}
          </Text>
          <Text style={s.todayMeta} maxFontSizeMultiplier={1.2}>
            {isRestDay
              ? 'Time to recover and hydrate.'
              : isCompleted
                ? 'Great job crushing your session!'
                : `${plannedWorkout.exercises?.length ?? 0} exercises prescribed · Ready?`}
          </Text>

          {/* Muscle chips */}
          {muscleTags.length > 0 && !isRestDay && (
            <View style={s.chipRow}>
              {muscleTags.slice(0, 4).map(tag => (
                <MuscleTagChip key={tag} label={tag} />
              ))}
            </View>
          )}

          {/* CTA */}
          {!isCompleted && !isRestDay && (
            <ForgeButton
              label="▶  Start Workout"
              onPress={() => router.push({
                pathname: '/activeWorkout',
                params: { title: plannedWorkout?.title || 'Today\'s Workout' },
              })}
              variant="primary"
              size="md"
              pulse
              accessibilityLabel="Start today's workout"
            />
          )}
        </View>
      </View>
      <MascotImage
        mascot="hero"
        width={130}
        height={165}
        animation="breathe"
        decorative={true}
        accessibilityLabel="Forge the bear hero pose"
        style={{
          position: 'absolute',
          right: -8,
          bottom: -15, // Overflow bottom slightly
        }}
      />
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
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
