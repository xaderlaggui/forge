import dayjs from 'dayjs';
import { useAiCoach } from '../../../hooks/useAiCoach';
import { useNutrition } from '../../../hooks/useNutrition';
import { useWorkouts } from '../../../hooks/useWorkouts';
import { useAuthStore } from '../../../stores/authStore';

export function useDashboardData() {
  const { user } = useAuthStore();
  const { data: nutrition, isLoading: isNutritionLoading } = useNutrition();
  const { workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { data: aiTip, isLoading: isAiLoading } = useAiCoach();

  const isLoading = isNutritionLoading || isWorkoutsLoading;

  // ── Derived data ──
  const waterLiters = (nutrition?.waterMl ?? 0) / 1000;
  const activeCals = nutrition?.totalCalories ?? 0;
  const waterGoal = 2.4;
  const calGoal = (user as any)?.targets?.nutrition?.calories ?? 2500;

  const todayDate = dayjs().format('YYYY-MM-DD');
  const loggedWorkout = workouts?.find(w => w.date === todayDate);

  const todayIdx = dayjs().day() === 0 ? 6 : dayjs().day() - 1; // 0=Mon, 6=Sun
  const plannedWorkout = (user as any)?.plan?.weeklySchedule?.[todayIdx];

  const muscleTags: string[] = plannedWorkout && plannedWorkout.dayType !== 'Rest'
    ? [...new Set<string>(plannedWorkout.exercises.flatMap((ex: any) => ex.muscleGroups ?? []))].filter(Boolean)
    : [];

  const recentWorkouts = [...(workouts ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);

  const startOfWeek = dayjs().startOf('week').add(1, 'day');
  const weekActivity = Array.from({ length: 7 }).map((_, i) => {
    const d = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
    return !!(workouts ?? []).find(w => w.date === d);
  });

  return {
    user,
    isLoading,
    isAiLoading,
    aiTip,
    waterLiters,
    activeCals,
    waterGoal,
    calGoal,
    plannedWorkout,
    loggedWorkout,
    muscleTags: muscleTags as string[],
    recentWorkouts,
    weekActivity,
  };
}
