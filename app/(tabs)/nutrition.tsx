import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Plus, Droplets, ChevronRight } from 'lucide-react-native';
import { ForgeTheme as T } from '../../constants/ForgeTheme';
import { useNutrition } from '../../hooks/useNutrition';

// ─── Types ─────────────────────────────────────────────────
interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
}

interface MealDef {
  key: string;
  label: string;
  emoji: string;
}

const MEAL_DEFS: MealDef[] = [
  { key: 'Breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'Lunch',     label: 'Lunch',     emoji: '☀️' },
  { key: 'Dinner',    label: 'Dinner',    emoji: '🌙' },
  { key: 'Snacks',    label: 'Snacks',    emoji: '🍏' },
];

// ─── Subcomponents ─────────────────────────────────────────

function MacroBar({ label, value, goal, color }: MacroBarProps) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  return (
    <View style={mb.wrapper}>
      <View style={mb.labelRow}>
        <Text style={mb.label}>{label}</Text>
        <Text style={mb.value}>{value}<Text style={mb.goal}>/{goal}g</Text></Text>
      </View>
      <View style={mb.track}>
        <View style={[mb.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 12, fontWeight: '500', color: T.colors.t2 },
  value: { fontSize: 12, fontWeight: '700', color: T.colors.t1 },
  goal: { fontWeight: '400', color: T.colors.t3 },
  track: { height: 5, backgroundColor: T.colors.bg3, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
});

// ─── Main Screen ───────────────────────────────────────────

export default function NutritionScreen() {
  const router = useRouter();
  const { data: nutrition, isLoading } = useNutrition();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  if (isLoading || !nutrition) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.colors.forge} />
      </View>
    );
  }

  // ── Aggregate totals ──
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

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
          <Text style={s.headerTitle}>Nutrition</Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/addMeal')}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── Calorie Summary Card ── */}
      <View style={s.summaryCard}>
        <LinearGradient
          colors={['#1C1C20', '#141416']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Decorative blob */}
        <View style={s.blob} />

        {/* Top row: consumed / remaining */}
        <View style={s.calTopRow}>
          <View style={s.calBlock}>
            <Text style={s.calNum}>{totalCal}</Text>
            <Text style={s.calLabel}>Eaten</Text>
          </View>
          <View style={s.calRingWrap}>
            {/* Simple circular % indicator */}
            <Text style={s.calPct}>{Math.round(calPct)}%</Text>
            <Text style={s.calGoalLabel}>of {goalCal}</Text>
          </View>
          <View style={[s.calBlock, { alignItems: 'flex-end' }]}>
            <Text style={[s.calNum, { color: remaining === 0 ? T.colors.forge : T.colors.t1 }]}>{remaining}</Text>
            <Text style={s.calLabel}>Remaining</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={s.calBarTrack}>
          <LinearGradient
            colors={[T.colors.forge, T.colors.forgeHover]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.calBarFill, { width: `${calPct}%` as any }]}
          />
        </View>

        {/* Macro stat row */}
        <View style={s.macroStatRow}>
          {[
            { label: 'Protein', value: totalProtein, color: T.colors.green },
            { label: 'Carbs',   value: totalCarbs,   color: T.colors.blue  },
            { label: 'Fat',     value: totalFat,     color: '#FFD60A'      },
          ].map(m => (
            <View key={m.label} style={s.macroStat}>
              <View style={[s.macroDot, { backgroundColor: m.color }]} />
              <Text style={[s.macroVal, { color: m.color }]}>{m.value}g</Text>
              <Text style={s.macroLbl}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Macro Breakdown Bars ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Macro Breakdown</Text>
        <View style={s.card}>
          <MacroBar label="Protein" value={totalProtein} goal={goalProtein} color={T.colors.green} />
          <MacroBar label="Carbs"   value={totalCarbs}   goal={goalCarbs}   color={T.colors.blue} />
          <MacroBar label="Fat"     value={totalFat}     goal={goalFat}     color="#FFD60A" />
        </View>
      </View>

      {/* ── Water Tracker ── */}
      <View style={[s.section, { marginBottom: 0 }]}>
        <Text style={s.sectionLabel}>Hydration</Text>
        <View style={s.waterCard}>
          <View style={s.waterLeft}>
            <View style={s.waterIcon}>
              <Droplets size={20} color={T.colors.blue} />
            </View>
            <View>
              <Text style={s.waterVal}>{waterLiters.toFixed(1)} L</Text>
              <Text style={s.waterGoal}>Goal: {goalWater} L</Text>
            </View>
          </View>
          <View style={s.waterBarWrap}>
            <View style={s.waterBarTrack}>
              <View
                style={[
                  s.waterBarFill,
                  { width: `${Math.min((waterLiters / goalWater) * 100, 100)}%` as any },
                ]}
              />
            </View>
            <View style={s.waterDots}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    s.waterDot,
                    i < Math.round((waterLiters / goalWater) * 8) && s.waterDotFilled,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ── Meals ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Meals</Text>
        {MEAL_DEFS.map(({ key, label, emoji }) => {
          const meal = nutrition.meals.find(m => m.name === key)
            ?? { name: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
          const isExpanded = expandedMeal === key;
          const isEmpty = meal.calories === 0;

          return (
            <View key={key} style={[s.mealCard, { marginBottom: 10 }]}>
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
                  <Text style={s.mealLabel}>{label}</Text>
                  <Text style={s.mealCal}>{isEmpty ? 'Not logged yet' : `${meal.calories} kcal`}</Text>
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
                      { label: 'Fat',     value: meal.fat,     color: '#FFD60A' },
                    ].map(m => (
                      <View key={m.label} style={s.mealDetailStat}>
                        <Text style={[s.mealDetailVal, { color: m.color }]}>{m.value}g</Text>
                        <Text style={s.mealDetailLbl}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { paddingBottom: 110 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  headerSub: { fontSize: 12, color: T.colors.t2, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: T.colors.t1 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: T.colors.forge,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },

  // Calorie summary
  summaryCard: {
    marginHorizontal: 20, marginBottom: 20,
    borderRadius: 20, borderWidth: 1, borderColor: T.colors.b1,
    overflow: 'hidden', padding: 20,
  },
  blob: {
    position: 'absolute', top: -40, right: -20,
    width: 120, height: 120,
    backgroundColor: 'rgba(255,92,46,0.08)',
    borderRadius: 60,
  },
  calTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  calBlock: {},
  calNum: { fontSize: 24, fontWeight: '800', color: T.colors.t1 },
  calLabel: { fontSize: 11, color: T.colors.t3, marginTop: 2, fontWeight: '500' },
  calRingWrap: { alignItems: 'center' },
  calPct: { fontSize: 22, fontWeight: '800', color: T.colors.forge },
  calGoalLabel: { fontSize: 10, color: T.colors.t3, marginTop: 1 },

  calBarTrack: { height: 6, backgroundColor: T.colors.bg3, borderRadius: 3, overflow: 'hidden', marginBottom: 20 },
  calBarFill: { height: 6, borderRadius: 3 },

  macroStatRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroStat: { alignItems: 'center', gap: 3 },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  macroVal: { fontSize: 15, fontWeight: '700' },
  macroLbl: { fontSize: 10, color: T.colors.t3, fontWeight: '500' },

  // Sections
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10,
  },
  card: {
    backgroundColor: T.colors.bg1, borderRadius: 16,
    borderWidth: 0.5, borderColor: T.colors.b1, padding: 16,
  },

  // Water
  waterCard: {
    backgroundColor: T.colors.bg1, borderRadius: 16,
    borderWidth: 0.5, borderColor: T.colors.b1,
    padding: 16, gap: 14,
  },
  waterLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waterIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(10,132,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  waterVal: { fontSize: 20, fontWeight: '700', color: T.colors.t1 },
  waterGoal: { fontSize: 11, color: T.colors.t3, marginTop: 1 },
  waterBarWrap: { gap: 8 },
  waterBarTrack: { height: 5, backgroundColor: T.colors.bg3, borderRadius: 3, overflow: 'hidden' },
  waterBarFill: { height: 5, backgroundColor: T.colors.blue, borderRadius: 3 },
  waterDots: { flexDirection: 'row', gap: 6 },
  waterDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.colors.bg3 },
  waterDotFilled: { backgroundColor: T.colors.blue },

  // Meals
  mealCard: { backgroundColor: T.colors.bg1, borderRadius: 16, borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden' },
  mealRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  mealIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: T.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  mealLabel: { fontSize: 14, fontWeight: '600', color: T.colors.t1 },
  mealCal: { fontSize: 12, color: T.colors.t3, marginTop: 1 },
  mealAddBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,92,46,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 4,
  },
  mealDetail: {
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: T.colors.bg0,
  },
  mealDetailRow: { flexDirection: 'row', justifyContent: 'space-around' },
  mealDetailStat: { alignItems: 'center' },
  mealDetailVal: { fontSize: 16, fontWeight: '700' },
  mealDetailLbl: { fontSize: 10, color: T.colors.t3, marginTop: 2, fontWeight: '500' },
});
