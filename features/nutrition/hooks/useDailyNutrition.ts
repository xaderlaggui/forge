import { useState } from 'react';
import { useNutrition } from '../../../hooks/useNutrition';
import { DailyAggregates } from '../types';

export function useDailyNutrition() {
  const { data: nutrition, isLoading } = useNutrition();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  if (isLoading || !nutrition) {
    return { isLoading: true, nutrition: null, aggregates: null, expandedMeal, setExpandedMeal };
  }

  const totalProtein = nutrition.meals.reduce((sum, m) => sum + (m.protein ?? 0), 0);
  const totalCarbs   = nutrition.meals.reduce((sum, m) => sum + (m.carbs   ?? 0), 0);
  const totalFat     = nutrition.meals.reduce((sum, m) => sum + (m.fat     ?? 0), 0);
  const totalCal     = nutrition.meals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const waterMl      = nutrition.waterMl ?? 0;
  const waterLiters  = waterMl / 1000;

  // Goals (ideally from user profile; using sensible defaults)
  const goalCal = 2500;
  const goalProtein = 180;
  const goalCarbs   = 250;
  const goalFat     = 70;
  const goalWater   = 2.4;

  const calPct = Math.min((totalCal / goalCal) * 100, 100);
  const remaining = Math.max(goalCal - totalCal, 0);

  const aggregates: DailyAggregates = {
    totalProtein, totalCarbs, totalFat, totalCal, waterMl, waterLiters,
    calPct, remaining, goalCal, goalProtein, goalCarbs, goalFat, goalWater
  };

  return { isLoading: false, nutrition, aggregates, expandedMeal, setExpandedMeal };
}
