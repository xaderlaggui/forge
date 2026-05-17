export type Goal = 'cut' | 'maintain' | 'bulk';
export type ActivityLevel = 'sedentary' | 'light' | 'active' | 'very_active';

export interface NutritionTargets {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  active: 1.55,
  very_active: 1.725,
};

/**
 * Calculates Target Daily Calories and Macros based on biometrics and goals.
 * Uses the Mifflin-St Jeor equation.
 */
export function calculateNutritionTargets(
  weightLbs: number,
  heightCm: number = 175, // Default if not provided
  age: number = 30,       // Default if not provided
  gender: 'male' | 'female' = 'male',
  activity: ActivityLevel = 'active',
  goal: Goal = 'maintain'
): NutritionTargets {
  
  // 1. Convert to metric
  const weightKg = weightLbs / 2.20462;

  // 2. Calculate BMR (Mifflin-St Jeor)
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  // 3. Calculate TDEE (Total Daily Energy Expenditure)
  let tdee = bmr * ACTIVITY_MULTIPLIERS[activity];

  // 4. Apply Goal Modifier
  let targetCalories = tdee;
  if (goal === 'cut') {
    targetCalories -= 500; // ~1 lb weight loss per week
  } else if (goal === 'bulk') {
    targetCalories += 300; // Lean bulk surplus
  }

  targetCalories = Math.round(targetCalories);

  // 5. Calculate Macros
  // Protein: High protein is crucial for all goals (1g per lb of bodyweight is standard for lifters)
  // Fat: Minimum 0.3g per lb for hormone health
  // Carbs: The remainder of the caloric budget
  
  const proteinGrams = Math.round(weightLbs * 1.0); // 1g / lb
  let fatGrams = Math.round(weightLbs * 0.4);       // 0.4g / lb for balanced diet
  
  // Adjust fat down slightly if cutting to spare carbs for energy
  if (goal === 'cut') {
    fatGrams = Math.round(weightLbs * 0.3);
  }

  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  
  const remainingCals = targetCalories - (proteinCals + fatCals);
  let carbGrams = Math.round(remainingCals / 4);

  // Failsafe: if carbs are negative (extreme cut), reduce fat/protein slightly
  if (carbGrams < 50) {
    carbGrams = 50;
    targetCalories = (proteinGrams * 4) + (fatGrams * 9) + (carbGrams * 4);
  }

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
}
