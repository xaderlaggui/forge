import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNutrition } from '../../../hooks/useNutrition';
import type { GeneratedPlan } from '../../../services/GeneratorEngine';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../stores/authStore';
import { DailyAggregates } from '../types';

export function useDailyNutrition() {
  const { user } = useAuthStore();
  const { data: nutrition, isLoading: isLoadingNutrition, updateNutrition } = useNutrition();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  // Fetch active AI plan to get target macros
  const { data: activePlan } = useQuery({
    queryKey: ['activeMealPlan', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const { data } = await supabase
        .from('generated_meal_plan_weekly')
        .select('plan')
        .eq('user_id', user.uid)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return null;
      return data.plan as GeneratedPlan;
    },
    enabled: !!user?.uid,
  });

  if (isLoadingNutrition || !nutrition) {
    return { isLoading: true, nutrition: null, aggregates: null, expandedMeal, setExpandedMeal, activePlan: null, updateNutrition: async () => { } };
  }

  const totalProtein = nutrition.meals.reduce((sum, m) => sum + (m.protein ?? 0), 0);
  const totalCarbs = nutrition.meals.reduce((sum, m) => sum + (m.carbs ?? 0), 0);
  const totalFat = nutrition.meals.reduce((sum, m) => sum + (m.fat ?? 0), 0);
  const totalFiber = nutrition.meals.reduce((sum, m) => sum + (m.fiber ?? 0), 0);
  const totalSugar = nutrition.meals.reduce((sum, m) => sum + (m.sugar ?? 0), 0);
  const totalCal = nutrition.meals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const waterMl = nutrition.waterMl ?? 0;
  const waterLiters = waterMl / 1000;

  // Goals from AI Plan or User Profile Fallback
  const targets = (user as any)?.targets_nutrition || (user as any)?.targets?.nutrition;
  const goalCal = activePlan?.mealPlan?.targetCalories ?? targets?.calories ?? 2500;
  const goalProtein = activePlan?.mealPlan?.targetProtein ?? targets?.protein ?? 180;
  const goalCarbs = activePlan?.mealPlan?.targetCarbs ?? targets?.carbs ?? 250;
  const goalFat = activePlan?.mealPlan?.targetFat ?? targets?.fat ?? 70;
  const goalWater = 2.4;

  const calPct = Math.min((totalCal / goalCal) * 100, 100);
  const remaining = Math.max(goalCal - totalCal, 0);

  const aggregates: DailyAggregates = {
    totalProtein, totalCarbs, totalFat, totalCal, waterMl, waterLiters, totalFiber, totalSugar,
    calPct, remaining, goalCal, goalProtein, goalCarbs, goalFat, goalWater
  };

  return { isLoading: false, nutrition, aggregates, expandedMeal, setExpandedMeal, activePlan, updateNutrition };
}
