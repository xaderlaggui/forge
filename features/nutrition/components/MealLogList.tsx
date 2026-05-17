import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { MealDef } from '../types';

const MEAL_DEFS: MealDef[] = [
  { key: 'Breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'Lunch',     label: 'Lunch',     emoji: '☀️' },
  { key: 'Dinner',    label: 'Dinner',    emoji: '🌙' },
  { key: 'Snacks',    label: 'Snacks',    emoji: '🍏' },
];

interface MealLogListProps {
  meals: any[]; // Depending on your DB schema, normally an array of Meal objects
  expandedMeal: string | null;
  setExpandedMeal: (key: string | null) => void;
}

export function MealLogList({ meals, expandedMeal, setExpandedMeal }: MealLogListProps) {
  const router = useRouter();

  return (
    <View style={[s.section, { marginTop: T.spacing.px5 }]}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Meals</Text>
      {MEAL_DEFS.map(({ key, label, emoji }) => {
        const meal = meals.find(m => m.name === key)
          ?? { name: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
        const isExpanded = expandedMeal === key;
        const isEmpty = meal.calories === 0;

        return (
          <View key={key} style={[s.mealCard, { marginBottom: T.spacing.px3 }]}>
            {/* Meal Row */}
            <TouchableOpacity
              style={s.mealRow}
              onPress={() => setExpandedMeal(isExpanded ? null : key)}
              activeOpacity={0.75}
            >
              <View style={s.mealIconWrap}>
                <Text style={{ fontSize: 18 }}>{emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.mealLabel} maxFontSizeMultiplier={1.2}>{label}</Text>
                <Text style={s.mealCal} maxFontSizeMultiplier={1.2}>{isEmpty ? 'Not logged yet' : `${meal.calories} kcal`}</Text>
              </View>
              <TouchableOpacity
                style={s.mealAddBtn}
                onPress={() => router.push({ pathname: '/addMeal', params: { mealName: key } })}
              >
                <Plus size={14} color={T.colors.forge} strokeWidth={2.5} />
              </TouchableOpacity>
              <ChevronRight
                size={16}
                color={T.colors.t3}
                style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {/* Expanded Macro Detail */}
            {isExpanded && !isEmpty && (
              <View style={s.mealDetail}>
                <View style={s.mealDetailRow}>
                  {[
                    { label: 'Protein', value: meal.protein, color: T.colors.green },
                    { label: 'Carbs',   value: meal.carbs,   color: T.colors.blue },
                    { label: 'Fat',     value: meal.fat,     color: T.colors.gold },
                  ].map(m => (
                    <View key={m.label} style={s.mealDetailStat}>
                      <Text style={[s.mealDetailVal, { color: m.color }]} maxFontSizeMultiplier={1.2}>{m.value}g</Text>
                      <Text style={s.mealDetailLbl} maxFontSizeMultiplier={1.2}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: T.spacing.px2,
  },
  mealCard: { backgroundColor: T.colors.bg1, borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden' },
  mealRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  mealIconWrap: {
    width: 40, height: 40, borderRadius: T.radii.md,
    backgroundColor: T.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  mealLabel: { fontSize: T.typography.sizes.body, fontWeight: '600', color: T.colors.t1 },
  mealCal: { fontSize: T.typography.sizes.bodyS, color: T.colors.t3, marginTop: 1 },
  mealAddBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 4,
  },
  mealDetail: {
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
    paddingHorizontal: T.spacing.px4, paddingVertical: T.spacing.px3,
    backgroundColor: T.colors.bg0,
  },
  mealDetailRow: { flexDirection: 'row', justifyContent: 'space-around' },
  mealDetailStat: { alignItems: 'center' },
  mealDetailVal: { fontSize: T.typography.sizes.body, fontWeight: '700' },
  mealDetailLbl: { fontSize: T.typography.sizes.caption, color: T.colors.t3, marginTop: 2, fontWeight: '500' },
});
