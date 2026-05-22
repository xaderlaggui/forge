import { useRouter } from 'expo-router';
import { Apple, Moon, Sparkles, Sun, Sunrise } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { MealDef } from '../types';

const MEAL_DEFS: MealDef[] = [
  { key: 'Breakfast', label: 'Breakfast', emoji: 'Breakfast' },
  { key: 'Lunch', label: 'Lunch', emoji: 'Lunch' },
  { key: 'Dinner', label: 'Dinner', emoji: 'Dinner' },
  { key: 'Snacks', label: 'Snacks', emoji: 'Snacks' },
];

const getMealIcon = (emoji: string, color: string) => {
  switch (emoji) {
    case 'Breakfast': return <Sunrise size={16} color={color} />;
    case 'Lunch': return <Sun size={16} color={color} />;
    case 'Dinner': return <Moon size={16} color={color} />;
    case 'Snacks': return <Apple size={16} color={color} />;
    default: return <Apple size={16} color={color} />;
  }
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
                  <View style={s.mealIconWrap}>
                    {getMealIcon(emoji, T.colors.forge)}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.sectionTitle}>{label}</Text>
                    {meal.isAiParsed && <Sparkles size={14} color={T.colors.green} />}
                  </View>
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

                      // Robust matching: find by name containing the key, or fallback to standard index map
                      const mealTypeIndexMap: Record<string, number> = { 'Breakfast': 0, 'Lunch': 1, 'Dinner': 2, 'Snack': 3, 'Snacks': 3 };
                      const aiMeal = dayMeals.find((m: any) =>
                        (m.type && m.type.toLowerCase().includes(key.toLowerCase())) ||
                        (m.name && m.name.toLowerCase().includes(key.toLowerCase())) ||
                        (m.name && (key === 'Snack' || key === 'Snacks') && m.name.toLowerCase().includes('snack'))
                      ) || dayMeals[mealTypeIndexMap[key]];

                      if (aiMeal) {
                        const existingMeal = meals.find((m: any) => m.name === key);
                        const mealData = {
                          name: key,
                          calories: aiMeal.calories,
                          protein: aiMeal.protein,
                          carbs: aiMeal.carbs,
                          fat: aiMeal.fat,
                          isAiParsed: true,
                          items: [{
                            name: aiMeal.name,
                            serving: aiMeal.description,
                            calories: aiMeal.calories,
                            protein: aiMeal.protein,
                            carbs: aiMeal.carbs,
                            fat: aiMeal.fat
                          }]
                        };

                        let newMeals;
                        if (existingMeal) {
                          newMeals = meals.map(m => m.name === key ? { ...m, ...mealData } : m);
                        } else {
                          newMeals = [...meals, mealData];
                        }
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
                  {meal.items && meal.items.length > 0 ? (
                    meal.items.map((item: any, i: number) => (
                      <Swipeable
                        key={i}
                        renderRightActions={() => (
                          <TouchableOpacity
                            style={[s.deleteBtn, { borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                            onPress={async () => {
                              if (!updateNutrition) return;
                              const newItems = meal.items.filter((_: any, idx: number) => idx !== i);
                              const newMeal = {
                                ...meal,
                                items: newItems,
                                calories: Math.max(0, (meal.calories || 0) - (item.calories || 0)),
                                protein: Math.max(0, (meal.protein || 0) - (item.protein || 0)),
                                carbs: Math.max(0, (meal.carbs || 0) - (item.carbs || 0)),
                                fat: Math.max(0, (meal.fat || 0) - (item.fat || 0)),
                              };
                              const newMeals = meals.map(m => m.name === key ? newMeal : m);
                              await updateNutrition({ meals: newMeals });
                            }}
                          >
                            <Text style={s.deleteBtnText}>Clear</Text>
                          </TouchableOpacity>
                        )}
                        containerStyle={i > 0 ? s.foodRowBorder : {}}
                      >
                        <View style={[s.foodRow, { backgroundColor: T.colors.bg1 }]}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={s.foodName}>{item.name}</Text>
                            {item.serving && <Text style={s.foodServing}>{item.serving}</Text>}
                          </View>
                          <View style={s.foodMacros}>
                            <Text style={s.foodCal}>{item.calories} kcal</Text>
                            <Text style={s.foodPfc}>P {item.protein}g · C {item.carbs}g · F {item.fat}g</Text>
                          </View>
                        </View>
                      </Swipeable>
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
  section: { marginHorizontal: T.spacing.page, marginBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: T.colors.b1,
    overflow: 'hidden',
  },
  sectionTitle: { color: T.colors.t1, fontSize: 16, fontWeight: '700' },
  sectionCals: { color: T.colors.t3, fontSize: 12, fontWeight: '600' },

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
  foodName: { color: T.colors.t1, fontSize: 13, fontWeight: '600' },
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
  deleteBtn: {
    backgroundColor: T.colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    height: '100%',
  },
  deleteBtnText: {
    color: T.colors.bg0,
    fontWeight: '700',
    fontSize: 14,
  },
});
