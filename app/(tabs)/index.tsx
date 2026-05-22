import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AiCoachCard } from '../../components/forge/AiCoachCard';

// Dashboard Feature Modules
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { DashboardHeader } from '../../features/dashboard/components/DashboardHeader';
import { QuickStatsRow } from '../../features/dashboard/components/QuickStatsRow';
import { RecentWorkoutsList } from '../../features/dashboard/components/RecentWorkoutsList';
import { TodayPlanCard } from '../../features/dashboard/components/TodayPlanCard';
import { WeeklyProgressDots } from '../../features/dashboard/components/WeeklyProgressDots';
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';

import { useScrollToHideNav } from '../../hooks/useScrollToHideNav';

export default function HomeScreen() {
  const { T } = useForgeTheme();
  const styles = useStyles(T);
  const router = useRouter();
  const { onScroll } = useScrollToHideNav();

  // Clean Architecture: Fetch all state/aggregates via a unified hook
  const data = useDashboardData();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      bounces={false}
    >
      {/* ── Composition: Header & Greeting ── */}
      <DashboardHeader
        displayName={data.user?.displayName}
        photoUrl={data.user?.photoURL || (data.user as any)?.photo_url}
      />

      {/* ── Composition: Hero Card ── */}
      <TodayPlanCard
        isLoading={data.isLoading}
        plannedWorkout={data.plannedWorkout}
        loggedWorkout={data.loggedWorkout}
        muscleTags={data.muscleTags}
      />

      {/* ── Composition: Transformation Teaser ── */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.transformCard} onPress={() => router.push('/progress')}>
          <View>
            <Text style={styles.transformTitle}>Transformation</Text>
            <Text style={styles.transformSub}>Track your physical progress</Text>
          </View>
          <Camera size={24} color={T.colors.forge} />
        </TouchableOpacity>
      </View>

      {/* ── Composition: Weekly Progress Dots ── */}
      <WeeklyProgressDots
        weekActivity={data.weekActivity}
        streak={data.streak}
        restDayIndices={data.restDayIndices}
      />

      {/* ── Composition: Quick Stats ── */}
      <QuickStatsRow
        volumeLbs={data.totalVolumeLbs}
        volumeChangePct={data.volumeChangePct}
        streak={data.streak}
        workoutsThisWeek={data.workoutsThisWeek}
      />

      {/* ── Composition: AI Coach (Shared Component) ── */}
      <View style={styles.section}>
        <AiCoachCard
          tip={data.aiTip}
          isLoading={data.isAiLoading}
          onChatPress={() => router.push('/chat')}
        />
      </View>

      {/* ── Composition: Recent Activity ── */}
      <RecentWorkoutsList recentActivity={data.recentActivity} />

    </ScrollView>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.bg0,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: T.spacing.page,
    marginBottom: T.spacing.px5,
  },
  transformCard: {
    flexDirection: 'row',
    backgroundColor: T.colors.bg1,
    ...T.shadows.lift,
    borderRadius: T.radii.lg,
    padding: T.spacing.px4,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: T.colors.b1,
  },
  transformTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.colors.t1,
  },
  transformSub: {
    fontSize: 13,
    color: T.colors.t3,
    marginTop: 2,
  },
});
