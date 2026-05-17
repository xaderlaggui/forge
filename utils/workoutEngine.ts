export type WorkoutDayType = 'Push' | 'Pull' | 'Legs' | 'FullBody' | 'Rest';

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string; // e.g., "8-12"
  targetWeightLbs?: number; // Calculated later via progressive overload engine
}

export interface PlannedWorkout {
  dayType: WorkoutDayType;
  title: string;
  exercises: PlannedExercise[];
}

/**
 * Hardcoded Foundation Templates 
 * We use a deterministic algorithm instead of AI to ensure safety and balance.
 */
const TEMPLATES: Record<Exclude<WorkoutDayType, 'Rest'>, PlannedExercise[]> = {
  Push: [
    { exerciseId: 'bench-press', name: 'Barbell Bench Press', targetSets: 3, targetReps: '5-8' },
    { exerciseId: 'overhead-press', name: 'Overhead Press', targetSets: 3, targetReps: '8-10' },
    { exerciseId: 'incline-db-press', name: 'Incline DB Press', targetSets: 3, targetReps: '8-12' },
    { exerciseId: 'tricep-pushdown', name: 'Tricep Pushdown', targetSets: 3, targetReps: '12-15' },
    { exerciseId: 'lateral-raise', name: 'Lateral Raise', targetSets: 4, targetReps: '15-20' },
  ],
  Pull: [
    { exerciseId: 'pull-up', name: 'Pull-ups', targetSets: 3, targetReps: 'AMRAP' },
    { exerciseId: 'barbell-row', name: 'Barbell Row', targetSets: 3, targetReps: '8-10' },
    { exerciseId: 'lat-pulldown', name: 'Lat Pulldown', targetSets: 3, targetReps: '10-12' },
    { exerciseId: 'barbell-curl', name: 'Barbell Bicep Curl', targetSets: 3, targetReps: '10-12' },
    { exerciseId: 'face-pull', name: 'Face Pulls', targetSets: 3, targetReps: '15-20' },
  ],
  Legs: [
    { exerciseId: 'squat', name: 'Barbell Squat', targetSets: 3, targetReps: '5-8' },
    { exerciseId: 'romanian-deadlift', name: 'Romanian Deadlift', targetSets: 3, targetReps: '8-10' },
    { exerciseId: 'leg-press', name: 'Leg Press', targetSets: 3, targetReps: '10-12' },
    { exerciseId: 'leg-curl', name: 'Leg Curl', targetSets: 3, targetReps: '12-15' },
    { exerciseId: 'calf-raise', name: 'Calf Raise', targetSets: 4, targetReps: '15-20' },
  ],
  FullBody: [
    { exerciseId: 'squat', name: 'Barbell Squat', targetSets: 3, targetReps: '5-8' },
    { exerciseId: 'bench-press', name: 'Bench Press', targetSets: 3, targetReps: '5-8' },
    { exerciseId: 'barbell-row', name: 'Barbell Row', targetSets: 3, targetReps: '8-10' },
    { exerciseId: 'overhead-press', name: 'Overhead Press', targetSets: 3, targetReps: '8-10' },
  ]
};

/**
 * Generates a weekly schedule based on the user's available days to train.
 */
export function generateWeeklySchedule(daysPerWeek: 3 | 4 | 5 | 6): PlannedWorkout[] {
  const week: PlannedWorkout[] = [];
  
  // Mapping logic based on frequency
  let pattern: WorkoutDayType[] = [];
  
  switch(daysPerWeek) {
    case 3:
      // Mon/Wed/Fri style PPL
      pattern = ['Push', 'Rest', 'Pull', 'Rest', 'Legs', 'Rest', 'Rest'];
      break;
    case 4:
      // Upper/Lower/Rest/Upper/Lower/Rest/Rest -> Mapped roughly to Push/Legs/Pull/Full for variety
      pattern = ['Push', 'Legs', 'Rest', 'Pull', 'FullBody', 'Rest', 'Rest'];
      break;
    case 5:
      // PPL + Upper/Lower
      pattern = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Rest', 'Rest'];
      break;
    case 6:
      // Strict PPL x2
      pattern = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'];
      break;
  }

  // Generate the actual workout objects for the 7-day week
  pattern.forEach((dayType, index) => {
    if (dayType === 'Rest') {
      week.push({
        dayType: 'Rest',
        title: 'Active Recovery',
        exercises: [],
      });
    } else {
      week.push({
        dayType,
        title: `Hypertrophy ${dayType}`,
        exercises: TEMPLATES[dayType],
      });
    }
  });

  return week;
}
