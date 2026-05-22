import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { Calendar, ChevronLeft, Flame } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GeneratedPlan } from '../services/GeneratorEngine';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyMealPlanScreen() {
  const router = useRouter();
  const { T } = useForgeTheme();
  const s = useStyles(T);
  const { user } = useAuthStore();

  const currentDayStr = dayjs().format('dddd');
  const [selectedDay, setSelectedDay] = useState(currentDayStr);

  const { data: plan, isLoading } = useQuery({
    queryKey: ['activePlan', user?.uid],
    queryFn: async () => {
      const { data, error } = await supabase.from('generated_plans')
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

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color={T.colors.forge} />
          <Text style={s.headerTitle}>Weekly Meal Plan</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Calendar Strip */}
      <View style={s.calendarStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.calendarScroll}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[s.dayTab, isSelected && s.dayTabSelected]}
                activeOpacity={0.7}
              >
                <Text style={[s.dayTabText, isSelected && s.dayTabTextSelected]}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
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
                <Text style={s.mealInitial}>{meal.name.substring(0, 3).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={s.mealName}>{meal.name}</Text>
                  <Text style={s.mealCals}>{meal.calories} kcal</Text>
                </View>
                <Text style={s.mealDesc}>{meal.description}</Text>
                <Text style={s.mealMacros}>
                  {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                </Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: T.colors.t1, paddingBottom: 8 },
  
  calendarStrip: {
    backgroundColor: T.colors.bg1, ...T.shadows.lift,
    borderBottomWidth: 0.5,
    borderBottomColor: T.colors.b1,
  },
  calendarScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: T.colors.bg2,
  },
  dayTabSelected: {
    backgroundColor: T.colors.forge,
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.colors.t2,
  },
  dayTabTextSelected: {
    color: '#000',
    fontWeight: '800',
  },

  content: { padding: 16 },
  summaryCard: {
    backgroundColor: T.colors.forgeDim,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,92,46,0.3)',
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
    backgroundColor: T.colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
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
