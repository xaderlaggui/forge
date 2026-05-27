import dayjs from 'dayjs';
import { useAiCoach } from '../../../features/ai/hooks/useAiCoach';
import { useNutrition } from '../../../features/nutrition/hooks/useNutrition';
import { useStreak } from '../../../features/dashboard/hooks/useStreak';
import { useWorkouts } from '../../../features/workout/hooks/useWorkouts';
import { useAllNutritionLogs } from '../../../features/nutrition/hooks/useAllNutritionLogs';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import type { GeneratedPlan } from '../../../services/GeneratorEngine';

export function useDashboardData() {
  const { user } = useAuthStore();
  const { data: nutrition, isLoading: isNutritionLoading } = useNutrition();
  const { workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { nutritionLogs, isLoading: isNutritionLogsLoading } = useAllNutritionLogs();
  const { data: aiTip, isLoading: isAiLoading } = useAiCoach();

  const { data: activePlan, isLoading: isLoadingActivePlan } = useQuery({
    queryKey: ['activeWorkoutPlan', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const { data } = await supabase
        .from('generated_workout_plan_weekly')
        .select('plan')
        .eq('user_id', user.uid)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return null;
      return data.plan as GeneratedPlan;
    },
    enabled: !!user?.uid,
  });

  const isLoading = isNutritionLoading || isWorkoutsLoading || isNutritionLogsLoading || isLoadingActivePlan;

  // ── Derived data ──
  const waterLiters = (nutrition?.waterMl ?? 0) / 1000;
  const activeCals = nutrition?.totalCalories ?? 0;
  const waterGoal = 2.4;
  const calGoal = (user as any)?.targets?.nutrition?.calories ?? 2500;

  const todayDate = dayjs().format('YYYY-MM-DD');
  const loggedWorkout = workouts?.find(w => w.date === todayDate);

  const todayIdx = dayjs().day() === 0 ? 6 : dayjs().day() - 1; // 0=Mon, 6=Sun
  
  // Derive which Mon-based day indices (0=Mon, 6=Sun) are rest days from the plan
  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const restDayIndices: number[] = [];
  if (activePlan?.workoutWeek) {
    activePlan.workoutWeek.forEach((d: any) => {
      if (!d.exercises || d.exercises.length === 0) {
        const idx = DAY_NAMES.indexOf(d.day);
        if (idx >= 0) restDayIndices.push(idx);
      }
    });
  }
  // Must be called after restDayIndices is populated (hooks rules: value is passed, not the ref)
  const streak = useStreak(restDayIndices);

  let plannedWorkout: any = null;
  if (activePlan?.workoutWeek) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDayName = dayNames[todayIdx];
    const dayPlan = activePlan.workoutWeek.find((d: any) => d.day === currentDayName);
    
    if (dayPlan) {
      if (dayPlan.exercises.length === 0) {
        plannedWorkout = { dayType: 'Rest' };
      } else {
        plannedWorkout = {
          title: dayPlan.focus,
          exercises: dayPlan.exercises.map((ex: any) => ({ name: ex.name })),
          dayType: 'Workout'
        };
      }
    }
  }
  if (!plannedWorkout) {
    plannedWorkout = (user as any)?.plan_weekly_schedule?.[todayIdx] || (user as any)?.plan?.weeklySchedule?.[todayIdx];
  }

  const muscleTags: string[] = plannedWorkout && plannedWorkout.dayType !== 'Rest'
    ? [...new Set<string>(plannedWorkout.exercises.flatMap((ex: any) => ex.muscleGroups ?? []))].filter(Boolean)
    : [];

  const allItems: any[] = [];
  workouts?.forEach(w => {
    allItems.push({ ...w, _type: 'workout' });
  });
  nutritionLogs?.forEach(log => {
    const loggedMeals = (log.meals || []).filter((m: any) => m.calories > 0);
    if (loggedMeals.length > 0) {
      const totalCals = loggedMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
      const mealNames = loggedMeals.map((m: any) => m.name).filter(Boolean);
      allItems.push({ ...log, _type: 'meal', loggedMeals, totalCals, mealNames });
    }
  });

  const recentActivity = allItems
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const startOfWeek = dayjs().subtract(todayIdx, 'day');
  let workoutsThisWeek = 0;
  const weekActivity = Array.from({ length: 7 }).map((_, i) => {
    const d = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
    const isDone = !!(workouts ?? []).find(w => w.date === d);
    if (isDone) workoutsThisWeek++;
    return isDone;
  });

  const getVolumeForDate = (dateStr: string) => {
    let vol = 0;
    workouts?.forEach(w => {
      if (w.date === dateStr) {
        w.exercises?.forEach((ex: any) => {
          ex.sets?.forEach((s: any) => {
            const wt = s.weight || 0;
            const r = s.reps || 0;
            vol += (wt * r);
          });
        });
      }
    });
    return vol;
  };

  const todayVolumeLbs = getVolumeForDate(todayDate);
  const yesterdayDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const yesterdayVolumeLbs = getVolumeForDate(yesterdayDate);

  let volumeChangePct = 0;
  if (yesterdayVolumeLbs > 0) {
    volumeChangePct = Math.round(((todayVolumeLbs - yesterdayVolumeLbs) / yesterdayVolumeLbs) * 100);
  } else if (todayVolumeLbs > 0) {
    volumeChangePct = 100;
  }

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
    recentActivity,
    weekActivity,
    workoutsThisWeek,
    totalVolumeLbs: todayVolumeLbs,
    volumeChangePct,
    streak,
    restDayIndices,
  };
}
