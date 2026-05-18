import { supabase } from '../services/supabase';
import type { Exercise } from '../types';

const SAMPLE_EXERCISES: Omit<Exercise, 'id'>[] = [
  // ── PUSH ───────────────────────────────────────────────────
  { name: 'Barbell Bench Press',           category: 'push', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'barbell',    difficulty: 'intermediate', purpose: 'strength',    instructions: [] },
  { name: 'Incline Dumbbell Press',        category: 'push', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'dumbbell',   difficulty: 'intermediate', purpose: 'hypertrophy', instructions: [] },
  { name: 'Decline Bench Press',           category: 'push', muscleGroups: ['chest', 'triceps'],              equipment: 'barbell',    difficulty: 'intermediate', purpose: 'strength',    instructions: [] },
  { name: 'Dumbbell Shoulder Press',       category: 'push', muscleGroups: ['shoulders', 'triceps'],          equipment: 'dumbbell',   difficulty: 'intermediate', purpose: 'hypertrophy', instructions: [] },
  { name: 'Arnold Press',                  category: 'push', muscleGroups: ['shoulders', 'triceps'],          equipment: 'dumbbell',   difficulty: 'intermediate', purpose: 'hypertrophy', instructions: [] },
  { name: 'Lateral Raises',               category: 'push', muscleGroups: ['shoulders'],                    equipment: 'dumbbell',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Front Raises',                 category: 'push', muscleGroups: ['shoulders'],                    equipment: 'dumbbell',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Cable Chest Fly',              category: 'push', muscleGroups: ['chest'],                        equipment: 'cable',      difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Pec Deck Machine',             category: 'push', muscleGroups: ['chest'],                        equipment: 'machine',    difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Push-Ups',                     category: 'push', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'bodyweight', difficulty: 'beginner',     purpose: 'endurance',   instructions: [] },
  { name: 'Dips',                         category: 'push', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'bodyweight', difficulty: 'intermediate', purpose: 'mixed',       instructions: [] },
  { name: 'Close-Grip Bench Press',       category: 'push', muscleGroups: ['triceps', 'chest'],             equipment: 'barbell',    difficulty: 'intermediate', purpose: 'strength',    instructions: [] },
  { name: 'Skull Crushers',              category: 'push', muscleGroups: ['triceps'],                      equipment: 'barbell',    difficulty: 'intermediate', purpose: 'hypertrophy', instructions: [] },
  { name: 'Rope Tricep Pushdown',        category: 'push', muscleGroups: ['triceps'],                      equipment: 'cable',      difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Overhead Tricep Extension',   category: 'push', muscleGroups: ['triceps'],                      equipment: 'dumbbell',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Machine Chest Press',         category: 'push', muscleGroups: ['chest', 'triceps'],             equipment: 'machine',    difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Seated Dumbbell Shoulder Press', category: 'push', muscleGroups: ['shoulders', 'triceps'],      equipment: 'dumbbell',   difficulty: 'intermediate', purpose: 'hypertrophy', instructions: [] },
  { name: 'Upright Row',                 category: 'push', muscleGroups: ['shoulders', 'back'],            equipment: 'barbell',    difficulty: 'intermediate', purpose: 'mixed',       instructions: [] },
  { name: 'Landmine Press',              category: 'push', muscleGroups: ['shoulders', 'chest', 'triceps'], equipment: 'barbell',   difficulty: 'intermediate', purpose: 'mixed',       instructions: [] },
  { name: 'Cable Lateral Raise',         category: 'push', muscleGroups: ['shoulders'],                    equipment: 'cable',      difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },

  // ── PULL ───────────────────────────────────────────────────
  { name: 'Pull-Ups',                    category: 'pull', muscleGroups: ['back', 'biceps'],              equipment: 'bodyweight', difficulty: 'intermediate', purpose: 'strength',    instructions: [] },
  { name: 'Chin-Ups',                    category: 'pull', muscleGroups: ['back', 'biceps'],              equipment: 'bodyweight', difficulty: 'intermediate', purpose: 'mixed',       instructions: [] },
  { name: 'Barbell Bent-Over Row',       category: 'pull', muscleGroups: ['back', 'shoulders'],           equipment: 'barbell',    difficulty: 'intermediate', purpose: 'strength',    instructions: [] },
  { name: 'Seated Cable Row',            category: 'pull', muscleGroups: ['back', 'biceps'],              equipment: 'cable',      difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Lat Pulldown',               category: 'pull', muscleGroups: ['back', 'biceps'],              equipment: 'machine',    difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'T-Bar Row',                  category: 'pull', muscleGroups: ['back'],                        equipment: 'barbell',    difficulty: 'intermediate', purpose: 'strength',    instructions: [] },
  { name: 'Single-Arm Dumbbell Row',    category: 'pull', muscleGroups: ['back'],                        equipment: 'dumbbell',   difficulty: 'intermediate', purpose: 'hypertrophy', instructions: [] },
  { name: 'Face Pulls',                 category: 'pull', muscleGroups: ['shoulders', 'back'],           equipment: 'cable',      difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Rear Delt Fly',              category: 'pull', muscleGroups: ['shoulders'],                   equipment: 'dumbbell',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Deadlift',                   category: 'pull', muscleGroups: ['back', 'glutes', 'hamstrings'], equipment: 'barbell',   difficulty: 'advanced',     purpose: 'strength',    instructions: [] },
  { name: 'Rack Pull',                  category: 'pull', muscleGroups: ['back'],                        equipment: 'barbell',    difficulty: 'advanced',     purpose: 'strength',    instructions: [] },
  { name: 'Shrugs',                     category: 'pull', muscleGroups: ['back'],                        equipment: 'barbell',    difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'EZ Bar Curl',               category: 'pull', muscleGroups: ['biceps'],                      equipment: 'barbell',    difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Hammer Curl',               category: 'pull', muscleGroups: ['biceps'],                      equipment: 'dumbbell',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Preacher Curl',             category: 'pull', muscleGroups: ['biceps'],                      equipment: 'machine',    difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Cable Curl',                category: 'pull', muscleGroups: ['biceps'],                      equipment: 'cable',      difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Reverse Curl',              category: 'pull', muscleGroups: ['biceps'],                      equipment: 'barbell',    difficulty: 'beginner',     purpose: 'endurance',   instructions: [] },
  { name: 'Inverted Row',              category: 'pull', muscleGroups: ['back', 'biceps'],              equipment: 'bodyweight', difficulty: 'intermediate', purpose: 'endurance',   instructions: [] },
  { name: 'Meadows Row',               category: 'pull', muscleGroups: ['back', 'shoulders'],           equipment: 'barbell',    difficulty: 'advanced',     purpose: 'mixed',       instructions: [] },
  { name: 'Romanian Deadlift',         category: 'pull', muscleGroups: ['hamstrings', 'glutes', 'back'], equipment: 'barbell',   difficulty: 'intermediate', purpose: 'mixed',       instructions: [] },

  // ── LEGS ───────────────────────────────────────────────────
  { name: 'Barbell Back Squat',        category: 'legs', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: 'barbell',  difficulty: 'intermediate', purpose: 'strength',    instructions: [] },
  { name: 'Front Squat',              category: 'legs', muscleGroups: ['quads', 'core'],                equipment: 'barbell',   difficulty: 'advanced',     purpose: 'strength',    instructions: [] },
  { name: 'Leg Press',               category: 'legs', muscleGroups: ['quads', 'glutes'],              equipment: 'machine',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Bulgarian Split Squat',   category: 'legs', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: 'dumbbell', difficulty: 'intermediate', purpose: 'mixed',       instructions: [] },
  { name: 'Walking Lunges',          category: 'legs', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: 'dumbbell', difficulty: 'beginner',     purpose: 'endurance',   instructions: [] },
  { name: 'Leg Extension',          category: 'legs', muscleGroups: ['quads'],                         equipment: 'machine',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Lying Leg Curl',         category: 'legs', muscleGroups: ['hamstrings'],                   equipment: 'machine',   difficulty: 'beginner',     purpose: 'hypertrophy', instructions: [] },
  { name: 'Hip Thrust',             category: 'legs', muscleGroups: ['glutes', 'hamstrings'],         equipment: 'barbell',   difficulty: 'intermediate', purpose: 'mixed',       instructions: [] },
  { name: 'Standing Calf Raise',    category: 'legs', muscleGroups: ['calves'],                       equipment: 'machine',   difficulty: 'beginner',     purpose: 'endurance',   instructions: [] },
  { name: 'Seated Calf Raise',      category: 'legs', muscleGroups: ['calves'],                       equipment: 'machine',   difficulty: 'beginner',     purpose: 'endurance',   instructions: [] },
];

export async function seedExercises() {
  let count = 0;
  for (const ex of SAMPLE_EXERCISES) {
    const id = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const { error } = await supabase.from('exercises').upsert({ ...ex, id }, { onConflict: 'id' });
    if (error) console.error(error);
    count++;
  }
  return count;
}

export async function seedMockUser(uid: string) {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    displayName: 'Mock Athlete',
    weight: 186,
    bmi: 24.5,
    streak: 14,
    weightHistory: [
      { value: 195, date: 'May 1' },
      { value: 193, date: 'May 8' },
      { value: 191, date: 'May 10' },
      { value: 190, date: 'May 15' },
      { value: 188, date: 'May 20' },
      { value: 186, date: 'May 29' },
    ],
    measurements: [{ chest: 41.5, waist: 33.0, arms: 15.2, legs: 24.8 }],
    progressPhotos: [
      { url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80', date: '2026-01-01' },
      { url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80', date: new Date().toISOString() },
    ]
  }, { merge: true });

  const workoutRef = doc(db, `users/${uid}/workouts/mock_workout_1`);
  await setDoc(workoutRef, {
    id: 'mock_workout_1',
    date: new Date().toISOString().split('T')[0],
    notes: 'Heavy Push Day',
    exercises: [
      {
        exerciseId: 'barbell-bench-press',
        name: 'Barbell Bench Press',
        muscleGroups: ['chest', 'triceps'],
        sets: [
          { id: '1', weight: 225, reps: 5, completed: true },
          { id: '2', weight: 225, reps: 5, completed: true },
        ]
      }
    ]
  });
}
