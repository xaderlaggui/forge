import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MealDef } from '../types';

const MEAL_DEFS: MealDef[] = [
  { key: 'Breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'Lunch',     label: 'Lunch',     emoji: '☀️' },
  { key: 'Dinner',    label: 'Dinner',    emoji: '🌙' },
  { key: 'Snacks',    label: 'Snacks',    emoji: '🍏' },
];

import type { GeneratedPlan } from '../../../services/GeneratorEngine';
import { useForgeTheme } from "@/hooks/useForgeTheme";

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
    <View style={useS.section}>
      {MEAL_DEFS.map(({ key, label }, index) => {
        const meal = meals.find(m => m.name === key)
          ?? { name: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
        const isEmpty = meal.calories === 0;

        return (
          <View key={key}>
            <View style={[useS.sectionHeader, { marginTop: index === 0 ? 6 : 14 }]}>
              <Text style={useS.sectionTitle}>{label}</Text>
              <Text style={[useS.sectionCals, isEmpty && { color: T.colors.red }]}>
                {isEmpty ? 'not logged' : `${meal.calories} kcal`}
              </Text>
            </View>

            {isEmpty ? (
              <View style={useS.emptyActions}>
                <TouchableOpacity
                  style={[useS.mealCard, useS.mealCardEmpty, { flex: 1, marginBottom: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/addMeal', params: { mealName: key } })}
                >
                  <View style={useS.foodRowCenter}>
                    <Text style={useS.emptyTapText}>Tap + to log {label.toLowerCase()}</Text>
                  </View>
                </TouchableOpacity>

                {activePlan && updateNutrition && (
                  <TouchableOpacity
                    style={useS.autoFillBtn}
                    activeOpacity={0.8}
                    onPress={async () => {
                      const aiMeal = activePlan.mealPlan.meals.find((m: any) => m.name === key);
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
                    <Text style={useS.autoFillText}>Auto-Fill</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={useS.mealCard}>
                {/* Assuming isAiParsed or if the backend passes some flag, we check here. We'll show it if it exists */}
                {meal.isAiParsed && (
                  <View style={useS.parsedBadgeRow}>
                    <View style={useS.parsedBadge}>
                      <Sparkles size={11} color={T.colors.green} />
                      <Text style={useS.parsedBadgeText}>AI PARSED</Text>
                    </View>
                  </View>
                )}
                {meal.items && meal.items.length > 0 ? (
                  meal.items.map((item: any, i: number) => (
                    <View key={i} style={[useS.foodRow, i > 0 && useS.foodRowBorder]}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={useS.foodName}>{item.name}</Text>
                        {item.serving && <Text style={useS.foodServing}>{item.serving}</Text>}
                      </View>
                      <View style={useS.foodMacros}>
                        <Text style={useS.foodCal}>{item.calories} kcal</Text>
                        <Text style={useS.foodPfc}>P {item.protein}g · C {item.carbs}g · F {item.fat}g</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={useS.foodRowCenter}>
                    <Text style={useS.emptyTapText}>Aggregated macros only</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
          section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
          sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
          sectionTitle: { color: T.colors.t1, fontSize: 15, fontWeight: '700' },
          sectionCals: { color: T.colors.t3, fontSize: 12 },
          
          mealCard: { backgroundColor: T.colors.bg1, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: T.colors.b1, marginBottom: 8 },
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
