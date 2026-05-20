import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AiCoachCard } from '../../components/forge/AiCoachCard';
import { Camera } from 'lucide-react-native';

// Dashboard Feature Modules
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../../features/dashboard/components/DashboardHeader';
import { TodayPlanCard } from '../../features/dashboard/components/TodayPlanCard';
import { WeeklyProgressDots } from '../../features/dashboard/components/WeeklyProgressDots';
import { QuickStatsRow } from '../../features/dashboard/components/QuickStatsRow';
import { RecentWorkoutsList } from '../../features/dashboard/components/RecentWorkoutsList';
import { useForgeTheme } from "@/hooks/useForgeTheme";

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
      <RecentWorkoutsList recentWorkouts={data.recentWorkouts} />

    </ScrollView>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.bg0,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  section: {
    paddingHorizontal: T.spacing.page,
    marginBottom: T.spacing.px5,
  },
  transformCard: {
    flexDirection: 'row',
    backgroundColor: T.colors.bg1,
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
