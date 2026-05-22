import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronLeft, Flame, RefreshCw, Sunrise, Sun, Moon, Apple } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GeneratedPlan } from '../services/GeneratorEngine';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

import { WeeklyCalendar } from '../features/planner/components/WeeklyCalendar';
import { usePlannerData } from '../features/planner/hooks/usePlannerData';

export default function WeeklyMealPlanScreen() {
  const router = useRouter();
  const { T } = useForgeTheme();
  const s = useStyles(T);
  const { user } = useAuthStore();

  const { days, todayIdx } = usePlannerData();
  const [activeDayIdx, setActiveDayIdx] = useState(todayIdx);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDay = dayNames[activeDayIdx];

  const { data: plan, isLoading } = useQuery({
    queryKey: ['activeMealPlan', user?.uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_meal_plan_weekly')
        .select('plan')
        .eq('user_id', user!.uid)
        .order('saved_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) return null;
      return data.plan as GeneratedPlan;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.colors.forge} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: T.colors.t2 }}>No active meal plan found.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.replace('/aiPlan')}>
          <Text style={{ color: T.colors.forge, fontWeight: '700' }}>Generate Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle backward compatibility if the plan only has one day of meals
  const isWeekly = Array.isArray(plan.mealPlan.days) && plan.mealPlan.days.length > 0;
  const dayData = isWeekly
    ? plan.mealPlan.days?.find((d: any) => d.dayOfWeek === selectedDay)
    : { meals: plan.mealPlan.meals };

  const meals = dayData?.meals || [];

  const handleRegeneratePlan = () => {
    Alert.alert(
      'Generate New Weekly Meal Plan?',
      'This will replace your current meal plan with a new one.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', style: 'destructive', onPress: () => router.push('/aiPlan') },
      ]
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={s.headerTitle}>Weekly Meal Plan</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={handleRegeneratePlan}>
          <RefreshCw size={20} color={T.colors.t1} />
        </TouchableOpacity>
      </View>

      {/* Calendar Strip */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, backgroundColor: T.colors.bg0 }}>
        <WeeklyCalendar
          days={days}
          activeDayIdx={activeDayIdx}
          onSelectDay={setActiveDayIdx}
        />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Daily Summary */}
        <View style={s.summaryCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Flame size={16} color={T.colors.forge} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: T.colors.t1 }}>Daily Targets</Text>
          </View>
          <Text style={{ fontSize: 13, color: T.colors.t2, fontWeight: '500' }}>
            {plan.mealPlan.targetCalories} kcal • {plan.mealPlan.targetProtein}g P • {plan.mealPlan.targetCarbs}g C • {plan.mealPlan.targetFat}g F
          </Text>
        </View>

        {/* Meals */}
        {meals.length === 0 ? (
          <Text style={{ color: T.colors.t3, textAlign: 'center', marginTop: 40 }}>
            No meals planned for {selectedDay}.
          </Text>
        ) : (
          meals.map((meal: any, i: number) => (
            <View key={i} style={s.mealCard}>
              <View style={s.mealIconWrap}>
                {i === 0 ? <Sunrise size={20} color={T.colors.forge} /> :
                 i === 1 ? <Sun size={20} color={T.colors.forge} /> :
                 i === 2 ? <Moon size={20} color={T.colors.forge} /> :
                 <Apple size={20} color={T.colors.forge} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <Text style={[s.mealName, { flexShrink: 1 }]} numberOfLines={2}>{meal.name}</Text>
                  <Text style={s.mealCals}>{meal.calories} kcal</Text>
                </View>
                <Text style={s.mealDesc}>{meal.description}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF5C2E' }}>{meal.protein}g P</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: T.colors.t3 }}>•</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4DA6FF' }}>{meal.carbs}g C</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: T.colors.t3 }}>•</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#F2C94C' }}>{meal.fat}g F</Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: T.colors.bg1, ...T.shadows.lift, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  refreshBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: T.colors.t1, paddingBottom: 8 },

  content: { padding: 16 },
  summaryCard: {
    backgroundColor: T.colors.forgeDim,
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,92,46,0.3)',
    marginTop: -16,
  },

  mealCard: {
    backgroundColor: T.colors.bg1, ...T.shadows.lift,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: T.colors.b1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  mealIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: T.colors.b1,
  },
  mealInitial: {
    fontSize: 12,
    fontWeight: '800',
    color: T.colors.t2,
    letterSpacing: 0.5,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '700',
    color: T.colors.t1,
  },
  mealCals: {
    fontSize: 13,
    fontWeight: '700',
    color: T.colors.forge,
  },
  mealDesc: {
    fontSize: 13,
    color: T.colors.t2,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 8,
  },
  mealMacros: {
    fontSize: 12,
    fontWeight: '600',
    color: T.colors.t3,
  },
});
