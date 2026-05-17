const fs = require('fs');

const md = fs.readFileSync('ppl_exercises_muscle_groups_50.md', 'utf8');
const lines = md.split('\n');

const muscleMap = {
  'Chest': 'chest', 'Upper Chest': 'chest', 'Lower Chest': 'chest',
  'Front Delts': 'shoulders', 'Side Delts': 'shoulders', 'Rear Delts': 'shoulders', 'Shoulders': 'shoulders',
  'Triceps': 'triceps',
  'Lats': 'back', 'Upper Back': 'back', 'Lower Back': 'back', 'Rhomboids': 'back', 'Traps': 'back',
  'Biceps': 'biceps', 'Forearms': 'biceps', // mapping forearms to biceps for now
  'Quads': 'quads', 'Glutes': 'glutes', 'Hamstrings': 'hamstrings', 'Calves': 'calves',
  'Core': 'core'
};

const equipmentMap = {
  'Barbell': 'barbell', 'Dumbbell': 'dumbbell', 'Machine': 'machine', 'Cable': 'cable', 'Bodyweight': 'bodyweight'
};

let results = [];

for (const line of lines) {
  if (line.startsWith('|') && !line.includes('---') && !line.includes('Main Muscle')) {
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 4) continue;
    
    const id = parts[0];
    const name = parts[1];
    const category = parts[2].toLowerCase();
    const rawMuscles = parts[3].split(',').map(s => s.trim());
    
    let mappedMuscles = new Set();
    for (const rm of rawMuscles) {
      if (muscleMap[rm]) mappedMuscles.add(muscleMap[rm]);
    }
    
    let equipment = 'machine'; // default
    const nameL = name.toLowerCase();
    if (nameL.includes('barbell') || nameL.includes('squat') || nameL.includes('deadlift')) equipment = 'barbell';
    else if (nameL.includes('dumbbell')) equipment = 'dumbbell';
    else if (nameL.includes('cable') || nameL.includes('rope')) equipment = 'cable';
    else if (nameL.includes('push-ups') || nameL.includes('pull-ups') || nameL.includes('chin-ups') || nameL.includes('dips') || nameL.includes('plank')) equipment = 'bodyweight';

    results.push(`  { name: '${name.replace(/'/g, "\\'")}', category: '${category}', muscleGroups: [${Array.from(mappedMuscles).map(m => `'${m}'`).join(', ')}], equipment: '${equipment}', difficulty: 'intermediate', instructions: [] }`);
  }
}

const header = `import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Exercise } from '../types';

const SAMPLE_EXERCISES: Omit<Exercise, 'id'>[] = [
`;

const footer = `
];

export async function seedExercises() {
  let count = 0;
  for (const ex of SAMPLE_EXERCISES) {
    const id = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const docRef = doc(db, 'exercises', id);
    
    await setDoc(docRef, {
      ...ex,
      id
    });
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
    measurements: [
      { chest: 41.5, waist: 33.0, arms: 15.2, legs: 24.8 }
    ],
    progressPhotos: [
      { url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80', date: '2026-01-01' },
      { url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80', date: new Date().toISOString() },
    ]
  }, { merge: true });

  const workoutRef = doc(db, \`users/\${uid}/workouts/mock_workout_1\`);
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
`;

fs.writeFileSync('utils/seedData.ts', header + results.join(',\n') + footer);
console.log('Successfully generated seedData.ts with ' + results.length + ' exercises.');
