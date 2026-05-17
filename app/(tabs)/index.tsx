import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AiCoachCard } from '../../components/forge/AiCoachCard';

// Dashboard Feature Modules
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../../features/dashboard/components/DashboardHeader';
import { TodayPlanCard } from '../../features/dashboard/components/TodayPlanCard';
import { MetricRingsRow } from '../../features/dashboard/components/MetricRingsRow';
import { RecentWorkoutsList } from '../../features/dashboard/components/RecentWorkoutsList';
import { useForgeTheme } from "@/hooks/useForgeTheme";

export default function HomeScreen() {
    const { T: ForgeTheme } = useForgeTheme();
    const styles = useStyles(ForgeTheme);
  const router = useRouter();
  
  // Clean Architecture: Fetch all state/aggregates via a unified hook
  const data = useDashboardData();

  return (
    <ScrollView
      style={useStyles.container}
      contentContainerStyle={useStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Composition: Header & Greeting ── */}
      <DashboardHeader displayName={data.user?.displayName} />

      {/* ── Composition: Hero Card ── */}
      <TodayPlanCard 
        isLoading={data.isLoading} 
        plannedWorkout={data.plannedWorkout} 
        loggedWorkout={data.loggedWorkout}
        muscleTags={data.muscleTags} 
      />

      {/* ── Composition: Quick Metrics ── */}
      <MetricRingsRow 
        isLoading={data.isLoading}
        activeCals={data.activeCals}
        calGoal={data.calGoal}
        waterLiters={data.waterLiters}
        waterGoal={data.waterGoal}
        streak={data.streak}
        weekActivity={data.weekActivity}
      />

      {/* ── Composition: AI Coach (Shared Component) ── */}
      <View style={useStyles.section}>
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

const useStyles = (T: any) => StyleSheet.create({
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
