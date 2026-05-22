-- ==============================================================================================
-- ANTIGRAVITY FITNESS APP: SUPABASE SCHEMA (MASTER)
-- ==============================================================================================
-- Use this script in your Supabase SQL Editor to verify or update your complete database schema.
-- This schema perfectly matches every query and table required by our codebase.

-- --------------------------------------------------------
-- 1. PROFILES (Stores user preferences, macros, and goals)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  email text,
  age numeric,
  weight numeric,
  weight_unit text DEFAULT 'kg',
  height numeric,
  height_unit text DEFAULT 'cm',
  targets_nutrition jsonb,
  targets_workout_split text,
  plan_weekly_schedule jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
CREATE POLICY "Users can view and update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- --------------------------------------------------------
-- 2. EXERCISES (Global Library)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercises (
  id text PRIMARY KEY,
  name text NOT NULL,
  target_muscle_group text,
  equipment text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Read-only for all authenticated users)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read exercises" ON public.exercises;
CREATE POLICY "Anyone can read exercises" ON public.exercises FOR SELECT USING (auth.role() = 'authenticated');

-- --------------------------------------------------------
-- 3. WORKOUTS (User Logged Workouts)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date text NOT NULL,
  title text,
  duration numeric,
  volume numeric,
  exercises jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own workouts" ON public.workouts;
CREATE POLICY "Users can manage own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 4. NUTRITION LOGS (User Daily Nutrition Tracking)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date text NOT NULL,
  meals jsonb,
  waterMl numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own nutrition logs" ON public.nutrition_logs;
CREATE POLICY "Users can manage own nutrition logs" ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 5. AI MEAL PLANS (Weekly Generated Diet)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_meal_plan_weekly (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  plan jsonb NOT NULL,
  saved_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.generated_meal_plan_weekly ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own meal plans" ON public.generated_meal_plan_weekly;
CREATE POLICY "Users can manage own meal plans" ON public.generated_meal_plan_weekly FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 6. AI WORKOUT PLANS (Weekly Generated Routine)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_workout_plan_weekly (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  plan jsonb NOT NULL,
  saved_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.generated_workout_plan_weekly ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own workout plans" ON public.generated_workout_plan_weekly;
CREATE POLICY "Users can manage own workout plans" ON public.generated_workout_plan_weekly FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 7. CLEANUP (Drop the old conflicted table)
-- --------------------------------------------------------
-- WARNING: Only run this if you don't care about old generated plans.
-- DROP TABLE IF EXISTS public.generated_plans;
