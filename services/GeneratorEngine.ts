/**
 * GeneratorEngine.ts — Hybrid AI Workout & Meal Plan Generator
 *
 * Strategy:
 *  1. Hardcoded math → calculate target calories, macros, workout volume
 *  2. Groq AI     → select exercises / generate meal menu in JSON
 *  3. Firestore   → persist the generated plan to the user's document
 */

import { supabase } from './supabase';
import { groqComplete } from './groq';
import dayjs from 'dayjs';
import { generateExercisesPrompt, generateMealPlanPrompt } from '../constants/prompts';

// ─── Types ──────────────────────────────────────────────────────────────────

export type FitnessGoal      = 'cut' | 'maintain' | 'bulk';
export type DietPreference   = 'anything' | 'vegan' | 'keto';
export type EquipmentAccess  = 'full' | 'dumbbells' | 'bodyweight';

export interface UserMetrics {
  uid: string;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  fitnessGoal: FitnessGoal;
  dietPreference: DietPreference;
  equipmentAccess: EquipmentAccess;
  experienceLevel?: string;
  daysPerWeek?: number;
  sessionMin?: number;
  customGoals?: string[];
}

export interface GeneratedWorkoutDay {
  day: string;            // e.g. "Monday"
  focus: string;          // e.g. "Push (Chest / Shoulders / Triceps)"
  exercises: {
    name: string;
    sets: number;
    reps: string;         // e.g. "8-12" or "AMRAP"
    restSec: number;
  }[];
}

export interface GeneratedMealDay {
  dayOfWeek: string;
  meals: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export interface GeneratedMealPlan {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  days: GeneratedMealDay[];
  meals?: any[]; // Keep for backwards compatibility
}

export interface GeneratedPlan {
  generatedAt: string;
  workoutWeek: GeneratedWorkoutDay[];
  mealPlan: GeneratedMealPlan;
  coachMessage: string;
}

// ─── Macro Calculator (Hardcoded Math) ──────────────────────────────────────

function calculateTargetMacros(metrics: UserMetrics) {
  // Mifflin-St Jeor BMR (male default)
  const bmr = 10 * metrics.weightKg + 6.25 * metrics.heightCm - 5 * metrics.ageYears + 5;
  // Moderately active TDEE
  const tdee = Math.round(bmr * 1.55);

  let targetCalories: number;
  switch (metrics.fitnessGoal) {
    case 'cut':      targetCalories = Math.round(tdee * 0.82); break; // ~18% deficit
    case 'bulk':     targetCalories = Math.round(tdee * 1.12); break; // ~12% surplus
    default:         targetCalories = tdee;
  }

  // Protein: 2g/kg (high protein across all goals)
  const targetProtein = Math.round(metrics.weightKg * 2);
  const proteinCal    = targetProtein * 4;

  // Fat: 25% of total calories
  const targetFat  = Math.round((targetCalories * 0.25) / 9);
  const fatCal     = targetFat * 9;

  // Carbs: fill remainder
  const targetCarbs = Math.round((targetCalories - proteinCal - fatCal) / 4);

  return { targetCalories, targetProtein, targetCarbs, targetFat };
}

// ─── Workout Split Selector (Hardcoded) ──────────────────────────────────────

function getWorkoutSplit(goal: FitnessGoal): { day: string; focus: string; muscleGroups: string[] }[] {
  // PPL (Push/Pull/Legs) is best for bulk/maintain; high-freq full-body for cut
  if (goal === 'cut') {
    return [
      { day: 'Monday',    focus: 'Full Body A',            muscleGroups: ['chest', 'back', 'quads', 'shoulders'] },
      { day: 'Wednesday', focus: 'Full Body B',            muscleGroups: ['hamstrings', 'biceps', 'triceps', 'core'] },
      { day: 'Friday',    focus: 'Full Body C (Cardio-Strength)', muscleGroups: ['chest', 'back', 'legs', 'cardio'] },
      { day: 'Tuesday',   focus: 'Rest / Light Cardio',   muscleGroups: [] },
      { day: 'Thursday',  focus: 'Rest / Light Cardio',   muscleGroups: [] },
      { day: 'Saturday',  focus: 'Active Recovery',        muscleGroups: [] },
      { day: 'Sunday',    focus: 'Rest',                   muscleGroups: [] },
    ];
  }
  return [
    { day: 'Monday',    focus: 'Push (Chest / Shoulders / Triceps)', muscleGroups: ['chest', 'shoulders', 'triceps'] },
    { day: 'Tuesday',   focus: 'Pull (Back / Biceps)',               muscleGroups: ['back', 'biceps', 'rear delts'] },
    { day: 'Wednesday', focus: 'Legs (Quads / Hamstrings / Glutes)', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
    { day: 'Thursday',  focus: 'Push (Strength Focus)',              muscleGroups: ['chest', 'shoulders', 'triceps'] },
    { day: 'Friday',    focus: 'Pull (Hypertrophy Focus)',           muscleGroups: ['back', 'biceps'] },
    { day: 'Saturday',  focus: 'Legs + Core',                        muscleGroups: ['quads', 'hamstrings', 'glutes', 'core'] },
    { day: 'Sunday',    focus: 'Rest',                               muscleGroups: [] },
  ];
}

// ─── AI: Generate Exercises for a Day ────────────────────────────────────────

async function generateExercisesForDay(
  focus: string,
  muscleGroups: string[],
  equipment: EquipmentAccess,
  goal: FitnessGoal,
  metrics?: UserMetrics
): Promise<GeneratedWorkoutDay['exercises']> {
  if (muscleGroups.length === 0) return []; // rest day

  const equipmentDesc = {
    full:       'a full commercial gym (barbells, dumbbells, cables, machines)',
    dumbbells:  'only dumbbells and a flat bench',
    bodyweight: 'no equipment, bodyweight only',
  }[equipment];

  const repScheme = goal === 'cut'
    ? '12-15 reps (higher reps for fat burn)'
    : goal === 'bulk'
      ? '6-10 reps (heavy compound focus)'
      : '8-12 reps (hypertrophy focus)';

  const prompt = generateExercisesPrompt(
    focus,
    muscleGroups,
    equipmentDesc,
    repScheme,
    metrics?.experienceLevel,
    metrics?.sessionMin,
    metrics?.customGoals
  );

  const content = await groqComplete(
    [{ role: 'user', content: prompt }],
    { model: 'llama-3.3-70b-versatile', max_tokens: 800, temperature: 0.4, response_format: { type: 'json_object' } }
  );

  try {
    const parsed = JSON.parse(content);
    // The model may return { exercises: [...] } or a raw array
    const arr = Array.isArray(parsed) ? parsed : (parsed.exercises ?? []);
    return arr.slice(0, 5);
  } catch {
    return [];
  }
}

// ─── AI: Generate Meal Plan ───────────────────────────────────────────────────

async function generateMealPlan(
  macros: ReturnType<typeof calculateTargetMacros>,
  diet: DietPreference,
  goal: FitnessGoal,
  metrics: UserMetrics,
  split: ReturnType<typeof getWorkoutSplit>
): Promise<GeneratedMealPlan & { coachMessage: string }> {
  const dietDesc = {
    anything: 'no dietary restrictions — include meat, fish, eggs, dairy',
    vegan:    'strictly vegan — no meat, fish, eggs, or dairy',
    keto:     'ketogenic — very low carb, high fat, moderate protein',
  }[diet];

  const goalDesc = {
    cut:      'cutting (fat loss) — high satiety, low calorie density foods',
    maintain: 'maintenance — balanced, sustainable everyday meals',
    bulk:     'bulking (muscle gain) — calorie-dense, easy to eat in volume',
  }[goal];

  const prompt = generateMealPlanPrompt(
    macros,
    dietDesc,
    goalDesc,
    metrics.experienceLevel || 'Beginner',
    metrics.customGoals || [],
    split.map(s => s.focus)
  );

  const content = await groqComplete(
    [{ role: 'user', content: prompt }],
    { model: 'llama-3.3-70b-versatile', max_tokens: 3000, temperature: 0.5, response_format: { type: 'json_object' } }
  );

  let parsed: any = {};
  try {
    parsed = JSON.parse(content);
  } catch(e) {
    console.error("Failed to parse JSON", e);
  }

  let days: GeneratedMealDay[] = [];
  
  if (Array.isArray(parsed.days) && parsed.days.length > 0) {
    days = parsed.days;
  } else if (Array.isArray(parsed.weeklyPlan) && parsed.weeklyPlan.length > 0) {
    days = parsed.weeklyPlan;
  } else if (Array.isArray(parsed.mealPlan) && parsed.mealPlan.length > 0) {
    days = parsed.mealPlan;
  } else if (Array.isArray(parsed.meals) && parsed.meals.length > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days = dayNames.map(dayOfWeek => ({
      dayOfWeek,
      meals: parsed.meals
    }));
  } else {
    throw new Error("AI did not return a valid meal plan array.");
  }

  // Safety net: if AI returned fewer than 7 days, pad the missing days
  if (days.length > 0 && days.length < 7) {
    const fullWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayNames = days.map(d => d.dayOfWeek);
    for (const name of fullWeek) {
      if (!currentDayNames.some(d => d.toLowerCase().includes(name.toLowerCase()))) {
        // Copy the first day's meals as a fallback for missing days
        days.push({ dayOfWeek: name, meals: days[0].meals });
      }
    }
    // Sort them correctly
    days.sort((a, b) => {
      const aIdx = fullWeek.findIndex(d => a.dayOfWeek.toLowerCase().includes(d.toLowerCase()));
      const bIdx = fullWeek.findIndex(d => b.dayOfWeek.toLowerCase().includes(d.toLowerCase()));
      return aIdx - bIdx;
    });
  }

  const coachMessage = parsed.coachMessage || "Here is your personalized plan, let's crush it!";

  return { ...macros, days, coachMessage };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates a full 7-day workout week + daily meal plan for the given user.
 * Saves the result to `users/{uid}/generatedPlans/{date}` in Firestore.
 * Returns the full plan so the UI can display a preview before confirming.
 */
export async function generateFullPlan(metrics: UserMetrics): Promise<GeneratedPlan> {
  const macros = calculateTargetMacros(metrics);
  const split   = getWorkoutSplit(metrics.fitnessGoal);

  // Generate all workout days in parallel for speed
  const workoutWeek: GeneratedWorkoutDay[] = await Promise.all(
    split.map(async ({ day, focus, muscleGroups }) => {
      const exercises = await generateExercisesForDay(
        focus,
        muscleGroups,
        metrics.equipmentAccess,
        metrics.fitnessGoal,
        metrics
      );
      return { day, focus, exercises };
    })
  );

  const mealPlanResult = await generateMealPlan(macros, metrics.dietPreference, metrics.fitnessGoal, metrics, split);
  
  const { coachMessage, ...mealPlan } = mealPlanResult;

  const plan: GeneratedPlan = {
    generatedAt: new Date().toISOString(),
    workoutWeek,
    mealPlan,
    coachMessage,
  };

  // Persist to Supabase under generated_plans
  const dateKey = dayjs().format('YYYY-MM-DD');
  await supabase.from('generated_plans').upsert({
    user_id: metrics.uid,
    date: dateKey,
    plan: plan,
    saved_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date' });

  return plan;
}

/**
 * Generates only a daily meal plan.
 * Saves the result to `users/{uid}/generatedPlans/{date}` in Firestore/Supabase.
 */
export async function generateMealPlanOnly(metrics: UserMetrics): Promise<GeneratedPlan> {
  const macros = calculateTargetMacros(metrics);
  const split = getWorkoutSplit(metrics.fitnessGoal); // Just used for context in meal prompt

  const mealPlanResult = await generateMealPlan(macros, metrics.dietPreference, metrics.fitnessGoal, metrics, split);
  const { coachMessage, ...mealPlan } = mealPlanResult;

  const plan: GeneratedPlan = {
    generatedAt: new Date().toISOString(),
    workoutWeek: [], // Empty workout week for meal-only plan
    mealPlan,
    coachMessage,
  };

  const dateKey = dayjs().format('YYYY-MM-DD');
  await supabase.from('generated_plans').upsert({
    user_id: metrics.uid,
    date: dateKey,
    plan: plan,
    saved_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date' });

  return plan;
}

