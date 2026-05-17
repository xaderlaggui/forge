import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { ForgeTheme as T } from '../../constants/ForgeTheme';

// Feature dependencies
import { useDailyNutrition } from '../../features/nutrition/hooks/useDailyNutrition';
import { NutritionSkeleton } from '../../features/nutrition/components/NutritionSkeleton';
import { DailyCalorieSummary } from '../../features/nutrition/components/DailyCalorieSummary';
import { MacroBreakdown } from '../../features/nutrition/components/MacroBreakdown';
import { HydrationTracker } from '../../features/nutrition/components/HydrationTracker';
import { MealLogList } from '../../features/nutrition/components/MealLogList';

export default function NutritionScreen() {
  const router = useRouter();
  
  // Clean Architecture: Logic and data fetching are handled by the hook
  const { isLoading, nutrition, aggregates, expandedMeal, setExpandedMeal } = useDailyNutrition();

  if (isLoading || !nutrition || !aggregates) {
    return (
      <View style={s.container}>
        <NutritionSkeleton />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Composition: Header ── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={require('../../assets/images/mascot_meal.png')} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
          <View>
            <Text style={s.headerSub} maxFontSizeMultiplier={1.2}>
              Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={s.headerTitle} maxFontSizeMultiplier={1.2}>Nutrition</Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/addMeal')}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── Composition: Daily Stats ── */}
      <DailyCalorieSummary aggregates={aggregates} />
      <MacroBreakdown aggregates={aggregates} />
      <HydrationTracker aggregates={aggregates} />

      {/* ── Composition: Meals ── */}
      <MealLogList 
        meals={nutrition.meals} 
        expandedMeal={expandedMeal} 
        setExpandedMeal={setExpandedMeal} 
      />

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { paddingBottom: 110 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
  },
  headerSub: { fontSize: T.typography.sizes.bodyS, color: T.colors.t2, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1 },
  addBtn: {
    width: 40, height: 40, borderRadius: T.radii.full,
    backgroundColor: T.colors.forge,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
});
