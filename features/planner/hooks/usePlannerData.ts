import { useQuery } from '@tanstack/react-query';
// Removed dayjs from top import since we are using raw Date math for timezone accuracy
import { useMemo, useState } from 'react';
import { useWorkouts } from '../../../hooks/useWorkouts';
import type { GeneratedPlan } from '../../../services/GeneratorEngine';
import { supabase } from '../../../services/supabase';
import type { Exercise } from '../../../types';

import { useAuthStore } from '../../../stores/authStore';

export function usePlannerData() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Planner');

  const { days, todayIdx } = useMemo(() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const todayPH = new Date(utc + (3600000 * 8)); // UTC+8
    
    const dayOfWeek = todayPH.getDay();
    const currentIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const startOfWeek = new Date(todayPH);
    startOfWeek.setDate(todayPH.getDate() - currentIdx);

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const label = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
      return { label, date: d.getDate(), fullDate: `${year}-${month}-${date}` };
    });

    return { days: weekDays, todayIdx: currentIdx };
  }, []);

  const [activeDayIdx, setActiveDayIdx] = useState(todayIdx);
  const activeDateStr = days[activeDayIdx].fullDate;

  // Exercise Library Fetch
  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exercises').select('*');
      if (error) throw error;
      return (data || []) as Exercise[];
    }
  });

  // Dynamic Workouts Fetch
  const { workouts, isLoading: isLoadingWorkouts } = useWorkouts();

  // AI Generated Active Plan Fetch
  const { data: activePlan, isLoading: isLoadingActivePlan } = useQuery({
    queryKey: ['activePlan', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const { data } = await supabase
        .from('generated_plans')
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

  // Filter workout for selected day
  const loggedWorkout = useMemo(() => {
    return workouts?.find(w => w.date.startsWith(activeDateStr));
  }, [workouts, activeDateStr]);

  const plannedWorkout = useMemo(() => {
    // 1. If we have an AI plan, use it
    if (activePlan?.workoutWeek) {
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      // activeDayIdx goes from 0 (Monday) to 6 (Sunday)
      const currentDayName = dayNames[activeDayIdx];
      const dayPlan = activePlan.workoutWeek.find(d => d.day === currentDayName);

      if (dayPlan) {
        if (dayPlan.exercises.length === 0) {
          return { dayType: 'Rest' };
        }
        return {
          title: dayPlan.focus,
          exercises: dayPlan.exercises.map(ex => ({ name: ex.name })),
          dayType: 'Workout'
        };
      }
    }
    // 2. Fallback to legacy static plan
    return (user as any)?.plan_weekly_schedule || (user as any)?.plan?.weeklySchedule?.[activeDayIdx];
  }, [activePlan, activeDayIdx, user]);

  return {
    activeTab, setActiveTab,
    days, activeDayIdx, setActiveDayIdx, activeDateStr, todayIdx,
    exercises, isLoadingExercises,
    loggedWorkout, plannedWorkout, isLoadingWorkouts: isLoadingWorkouts || isLoadingActivePlan
  };
}
