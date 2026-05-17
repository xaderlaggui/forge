import dayjs from 'dayjs';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useWorkouts } from '../../../hooks/useWorkouts';
import type { Exercise } from '../../../types';

export function usePlannerData() {
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
      const snap = await getDocs(collection(db, 'exercises'));
      return snap.docs.map(doc => doc.data() as Exercise);
    }
  });

  // Dynamic Workouts Fetch
  const { workouts, isLoading: isLoadingWorkouts } = useWorkouts();
  
  // Filter workout for selected day
  const todayWorkout = useMemo(() => {
    return workouts?.find(w => w.date.startsWith(activeDateStr));
  }, [workouts, activeDateStr]);

  return {
    activeTab, setActiveTab,
    days, activeDayIdx, setActiveDayIdx, activeDateStr,
    exercises, isLoadingExercises,
    todayWorkout, isLoadingWorkouts
  };
}
