import dayjs from 'dayjs';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useWorkouts } from '../../../hooks/useWorkouts';
import type { Exercise } from '../../../types';
import type { GeneratedPlan } from '../../../services/GeneratorEngine';

import { useAuthStore } from '../../../stores/authStore';

export function usePlannerData() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Planner');
  
  // Dynamic weekly dates starting from Monday
  const today = dayjs();
  const startOfWeek = today.startOf('week').add(1, 'day'); // Monday
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = startOfWeek.add(i, 'day');
    return { label: d.format('dd').charAt(0), date: d.date(), fullDate: d.format('YYYY-MM-DD') };
  });
  
  const [activeDayIdx, setActiveDayIdx] = useState(today.day() === 0 ? 6 : today.day() - 1);
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
  const { data: activePlan } = useQuery({
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
    days, activeDayIdx, setActiveDayIdx, activeDateStr,
    exercises, isLoadingExercises,
    loggedWorkout, plannedWorkout, isLoadingWorkouts
  };
}
