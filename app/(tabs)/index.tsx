import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ForgeTheme } from '../../constants/ForgeTheme';
import { AiCoachCard } from '../../components/forge/AiCoachCard';

// Dashboard Feature Modules
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../../features/dashboard/components/DashboardHeader';
import { TodayPlanCard } from '../../features/dashboard/components/TodayPlanCard';
import { MetricRingsRow } from '../../features/dashboard/components/MetricRingsRow';
import { RecentWorkoutsList } from '../../features/dashboard/components/RecentWorkoutsList';

export default function HomeScreen() {
  const router = useRouter();
  
  // Clean Architecture: Fetch all state/aggregates via a unified hook
  const data = useDashboardData();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Composition: Header & Greeting ── */}
      <DashboardHeader displayName={data.user?.displayName} />

      {/* ── Composition: Hero Card ── */}
      <TodayPlanCard 
        isLoading={data.isLoading} 
        todayWorkout={data.todayWorkout} 
        muscleTags={data.muscleTags} 
      />

      {/* ── Composition: Quick Metrics ── */}
      <MetricRingsRow 
        isLoading={data.isLoading}
        activeCals={data.activeCals}
        calGoal={data.calGoal}
        waterLiters={data.waterLiters}
        waterGoal={data.waterGoal}
        streak={(data.user as any)?.streak ?? 0}
        weekActivity={data.weekActivity}
      />

      {/* ── Composition: AI Coach (Shared Component) ── */}
      <View style={styles.section}>
        <AiCoachCard
          tip={data.aiTip}
          isLoading={data.isAiLoading}
          onChatPress={() => router.push('/chat')}
        />
      </View>

      {/* ── Composition: List ── */}
      <RecentWorkoutsList recentWorkouts={data.recentWorkouts} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForgeTheme.colors.bg0,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  section: {
    paddingHorizontal: ForgeTheme.spacing.page,
    marginBottom: ForgeTheme.spacing.px5,
  },
});
