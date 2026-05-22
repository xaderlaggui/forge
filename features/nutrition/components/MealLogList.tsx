import { useRouter } from 'expo-router';
import { Apple, Moon, Sparkles, Sun, Sunrise } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { MealDef } from '../types';

const MEAL_DEFS: MealDef[] = [
  { key: 'Breakfast', label: 'Breakfast', emoji: 'Breakfast' },
  { key: 'Lunch', label: 'Lunch', emoji: 'Lunch' },
  { key: 'Dinner', label: 'Dinner', emoji: 'Dinner' },
  { key: 'Snacks', label: 'Snacks', emoji: 'Snacks' },
];

const MEAL_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  Breakfast: { icon: <Sunrise size={16} color="#FF9500" />, color: '#FF9500' },
  Lunch: { icon: <Sun size={16} color="#FFCC00" />, color: '#FFCC00' },
  Dinner: { icon: <Moon size={16} color="#7B68EE" />, color: '#7B68EE' },
  Snacks: { icon: <Apple size={16} color="#30D158" />, color: '#30D158' },
};

import { useForgeTheme } from "@/hooks/useForgeTheme";
import type { GeneratedPlan } from '../../../services/GeneratorEngine';

interface MealLogListProps {
  meals: any[]; // Depending on your DB schema, normally an array of Meal objects
  expandedMeal: string | null;
  setExpandedMeal: (key: string | null) => void;
  activePlan?: GeneratedPlan | null;
  updateNutrition?: (newData: any) => Promise<void>;
}

export function MealLogList({ meals, activePlan, updateNutrition }: MealLogListProps) {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();

  return (
    <View style={s.section}>
      {MEAL_DEFS.map(({ key, label, emoji }, index) => {
        const meal = meals.find(m => m.name === key)
          ?? { name: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
        const isEmpty = meal.calories === 0;

        return (
          <View key={key}>
            <View style={[s.sectionHeader, { marginTop: index === 0 ? 6 : 14 }]}>
              <View style={s.sectionTitleRow}>
                <View style={[s.mealIconWrap, { backgroundColor: MEAL_ICONS[emoji].color + '20', borderColor: MEAL_ICONS[emoji].color + '60' }]}>
                  {MEAL_ICONS[emoji].icon}
                </View>
                <Text style={s.sectionTitle}>{label}</Text>
              </View>
              <Text style={[s.sectionCals, isEmpty && { color: T.colors.red }]}>
                {isEmpty ? 'Not Logged' : `${meal.calories} kcal`}
              </Text>
            </View>

            {isEmpty ? (
              <View style={s.emptyActions}>
                <PulseAnimatedView style={{ flex: 1 }}>
                  <View style={[s.mealCardWrapper, { flex: 1, marginBottom: 0 }]}>
                    <TouchableOpacity
                      style={[s.mealCard, s.mealCardEmpty]}
                      activeOpacity={0.7}
                      onPress={() => router.push({ pathname: '/addMeal', params: { mealName: key } })}
                    >
                      <View style={s.foodRowCenter}>
                        <Text style={s.emptyTapText}>Tap + to log {label.toLowerCase()}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </PulseAnimatedView>

                {activePlan && updateNutrition && (
                  <TouchableOpacity
                    style={s.autoFillBtn}
                    activeOpacity={0.8}
                    onPress={async () => {
                      const currentDayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                      const isWeekly = Array.isArray(activePlan.mealPlan.days) && activePlan.mealPlan.days.length > 0;
                      const dayMeals = isWeekly 
                        ? activePlan.mealPlan.days.find((d: any) => d.dayOfWeek === currentDayStr)?.meals || []
                        : activePlan.mealPlan.meals || [];
                        
                      const aiMeal = dayMeals.find((m: any) => m.name === key);
                      if (aiMeal) {
                        const newMeals = meals.map(m => m.name === key ? {
                          ...m,
                          calories: aiMeal.calories,
                          protein: aiMeal.protein,
                          carbs: aiMeal.carbs,
                          fat: aiMeal.fat,
                          isAiParsed: true,
                          items: [{
                            name: aiMeal.description,
                            calories: aiMeal.calories,
                            protein: aiMeal.protein,
                            carbs: aiMeal.carbs,
                            fat: aiMeal.fat
                          }]
                        } : m);
                        await updateNutrition({ meals: newMeals });
                      }
                    }}
                  >
                    <Sparkles size={16} color={T.colors.bg0} />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={s.mealCardWrapper}>
                <View style={s.mealCard}>
                {/* Assuming isAiParsed or if the backend passes some flag, we check here. We'll show it if it exists */}
                {meal.isAiParsed && (
                  <View style={s.parsedBadgeRow}>
                    <View style={s.parsedBadge}>
                      <Sparkles size={11} color={T.colors.green} />
                      <Text style={s.parsedBadgeText}>AI PARSED</Text>
                    </View>
                  </View>
                )}
                {meal.items && meal.items.length > 0 ? (
                  meal.items.map((item: any, i: number) => (
                    <View key={i} style={[s.foodRow, i > 0 && s.foodRowBorder]}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={s.foodName}>{item.name}</Text>
                        {item.serving && <Text style={s.foodServing}>{item.serving}</Text>}
                      </View>
                      <View style={s.foodMacros}>
                        <Text style={s.foodCal}>{item.calories} kcal</Text>
                        <Text style={s.foodPfc}>P {item.protein}g · C {item.carbs}g · F {item.fat}g</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={s.foodRowCenter}>
                    <Text style={s.emptyTapText}>Aggregated macros only</Text>
                  </View>
                )}
              </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function PulseAnimatedView({ children, style }: { children: React.ReactNode, style?: any }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const useS = (T: any) => StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: T.colors.b1,
    overflow: 'hidden',
  },
  sectionTitle: { color: T.colors.t1, fontSize: 15, fontWeight: '700' },
  sectionCals: { color: T.colors.t3, fontSize: 12 },

  mealCardWrapper: { ...T.shadows.lift, borderRadius: 16, marginBottom: 8, backgroundColor: T.colors.bg1 },
  mealCard: { backgroundColor: T.colors.bg1, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: T.colors.b1, flex: 1 },
  mealCardEmpty: { borderStyle: 'dashed', opacity: 0.5 },

  parsedBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4 },
  parsedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.colors.greenDim, borderWidth: 0.5, borderColor: T.colors.green, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  parsedBadgeText: { color: T.colors.green, fontSize: 10, fontWeight: '600' },

  foodRowCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  emptyTapText: { color: T.colors.t3, fontSize: 12 },

  foodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 14 },
  foodRowBorder: { borderTopWidth: 0.5, borderTopColor: T.colors.b0 },
  foodName: { color: T.colors.t1, fontSize: 13, fontWeight: '500' },
  foodServing: { color: T.colors.t2, fontSize: 11, marginTop: 2 },
  foodMacros: { alignItems: 'flex-end' },
  foodCal: { color: T.colors.t1, fontSize: 13, fontWeight: '600' },
  foodPfc: { color: T.colors.t3, fontSize: 10, marginTop: 2 },

  emptyActions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  autoFillBtn: {
    backgroundColor: T.colors.forge,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  autoFillText: { color: T.colors.bg0, fontSize: 13, fontWeight: '700' },
});
