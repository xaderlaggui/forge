import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
// Feature dependencies
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { TopFog } from '../../components/forge/TopFog';
import { DailyCalorieSummary } from '../../features/nutrition/components/DailyCalorieSummary';
import { HydrationTracker } from '../../features/nutrition/components/HydrationTracker';
import { MacroBreakdown } from '../../features/nutrition/components/MacroBreakdown';
import { MealLogList } from '../../features/nutrition/components/MealLogList';
import { NutritionCoachBubble } from '../../features/nutrition/components/NutritionCoachBubble';
import { NutritionSkeleton } from '../../features/nutrition/components/NutritionSkeleton';
import { useDailyNutrition } from '../../features/nutrition/hooks/useDailyNutrition';

import { useRouter } from 'expo-router';
import { useScrollToHideNav } from '../../hooks/useScrollToHideNav';

export default function NutritionScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { onScroll } = useScrollToHideNav();

  // Clean Architecture: Logic and data fetching are handled by the hook
  const { isLoading, nutrition, aggregates, expandedMeal, setExpandedMeal, activePlan, updateNutrition } = useDailyNutrition();

  if (isLoading || !nutrition || !aggregates) {
    return (
      <View style={s.container}>
        <NutritionSkeleton />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      bounces={false}
    >
      {/* ── Composition: Header ── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View>
            <Text style={s.headerSub} maxFontSizeMultiplier={1.2}>
              Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={s.headerTitle} maxFontSizeMultiplier={1.2}>Nutrition</Text>
          </View>
        </View>
      </View>

      {/* ── Composition: Daily Stats ── */}
      <DailyCalorieSummary aggregates={aggregates} />
      <MacroBreakdown aggregates={aggregates} />
      <HydrationTracker
        aggregates={aggregates}
        waterMl={nutrition.waterMl || 0}
        updateNutrition={updateNutrition}
      />

      {/* ── Composition: Meals ── */}
      <NutritionCoachBubble 
        activePlanExists={!!activePlan}
        onGeneratePress={() => router.push(activePlan ? '/weeklyMealPlan' : '/aiPlan')} 
      />

      {nutrition.totalCalories === 0 && (
        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: -16, zIndex: 10 }}>
        </View>
      )}

      <MealLogList
        meals={nutrition.meals}
        expandedMeal={null}
        setExpandedMeal={() => { }}
        activePlan={activePlan}
        updateNutrition={updateNutrition}
      />

    </ScrollView>
      <TopFog top={0} height={40} />
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { paddingBottom: 24 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
  },
  headerSub: { fontSize: T.typography.sizes.bodyS, color: T.colors.t2, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1 },
});
