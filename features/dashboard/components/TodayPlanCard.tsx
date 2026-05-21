import { useForgeTheme } from "@/hooks/useForgeTheme";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CalendarDays, CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BearMascot } from '../../../components/forge/BearMascot';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { SkeletonHeroCard } from '../../../components/forge/ForgeSkeleton';
import { MuscleTagChip } from '../../../components/forge/WorkoutAtoms';
import { useBearMood } from '../../../hooks/useBearMood';

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

  const bearMood = useBearMood(isCompleted ? 'workout_complete' : isRestDay ? 'rest_day' : 'accountability');

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
          <View style={s.todayTagRow}>
            {isCompleted
              ? <CheckCircle2 size={13} color={T.colors.forge} />
              : <CalendarDays size={13} color={T.colors.forge} />
            }
            <Text style={s.todayTag} maxFontSizeMultiplier={1.2}>
              {isCompleted ? 'COMPLETED TODAY' : "Today's Plan"}
            </Text>
          </View>
          <Text style={s.todayWorkoutName} maxFontSizeMultiplier={1.2}>
            {(() => {
              if (isRestDay) return 'Recovery Day';
              switch (plannedWorkout?.dayType) {
                case 'Push': return 'Push Day';
                case 'Pull': return 'Pull Day';
                case 'Legs': return 'Leg Day';
                default: return 'Push Day';
              }
            })()}
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
                params: {
                  title: (() => {
                    switch (plannedWorkout?.dayType) {
                      case 'Push': return 'Push Day';
                      case 'Pull': return 'Pull Day';
                      case 'Legs': return 'Leg Day';
                      default: return 'Push Day';
                    }
                  })()
                },
              })}
              variant="primary"
              size="md"
              accessibilityLabel="Start today's workout"
            />
          )}
        </View>
      </View>
      <BearMascot
        variant={bearMood}
        size="lg"
        style={{
          position: 'absolute',
          ...(() => {
            switch (bearMood) {
              case 'HYPED': // workout_complete (No CTA)
                return { right: -25, bottom: -43, width: 170, height: 220 };
              case 'THINKING': // rest_day (No CTA)
                return { right: -16, bottom: -20, width: 160, height: 200 };
              case 'STERN': // home_idle (Has CTA Button)
              default:
                return { right: -34, bottom: 72.7, width: 193, height: 135 }; // Sticky above the button
            }
          })()
        }}
        imageStyle={{
          width: '100%',
          height: '100%'
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
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  todayTagRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8,
  },
  todayWorkoutName: { fontSize: T.typography.sizes.h3, fontWeight: '700', color: T.colors.t1, marginBottom: 4 },
  todayMeta: {
    fontSize: T.typography.sizes.h4, color: T.colors.t2, marginBottom: T.spacing.px4,
    lineHeight: T.typography.sizes.bodyS * 1.5,
  },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: T.spacing.px4 },
});
