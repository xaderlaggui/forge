export interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
}

export interface MealDef {
  key: string;
  label: string;
  emoji: string;
}

export interface DailyAggregates {
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCal: number;
  waterMl: number;
  waterLiters: number;
  calPct: number;
  remaining: number;
  goalCal: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
  goalWater: number;
}
