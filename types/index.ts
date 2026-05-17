// Shared TypeScript interfaces for FitApp

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  height: number;       // cm
  weight: number;       // kg
  weightHistory: { value: number; date: string }[];
  progressPhotos: { url: string; date: string }[];
  measurements?: { chest?: number; waist?: number; arms?: number; legs?: number; date: string }[];
  age: number;
  bmi: number;
  bmiHistory: { value: number; date: string }[];
  streak: number;
  lastActiveDate: string;
  waterGoalMl: number;
  goals: string[];       // e.g. ['weight_loss', 'muscle_gain']
  fitnessGoal?: 'cut' | 'maintain' | 'bulk';
  dietPreference?: 'anything' | 'vegan' | 'keto';
  equipmentAccess?: 'full' | 'dumbbells' | 'bodyweight';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  isOnboarded?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;      // e.g. 'chest', 'legs', 'cardio'
  muscleGroups: string[];
  equipment: string;     // e.g. 'barbell', 'bodyweight'
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  purpose?: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  instructions: string[];
  videoUrl?: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;       // kg, 0 for bodyweight
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: string;           // ISO date string
  exercises: WorkoutExercise[];
  durationMin: number;
  calories: number;
  notes?: string;
}

export interface FoodItem {
  name: string;
  serving?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  isAiParsed?: boolean;
  items?: FoodItem[];
}

export interface NutritionLog {
  date: string;           // YYYY-MM-DD
  meals: Meal[];
  waterMl: number;
  totalCalories: number;
}
