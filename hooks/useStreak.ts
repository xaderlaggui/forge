import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useWorkouts } from './useWorkouts';

export function useStreak() {
  const { user, setUser } = useAuthStore();
  const { workouts } = useWorkouts();

  const streak = useMemo(() => {
    if (!workouts || workouts.length === 0) return 0;
    const activeDays = new Set(workouts.map(w => w.date));
    let count = 0;
    let cursor = dayjs();
    if (!activeDays.has(cursor.format('YYYY-MM-DD'))) {
      cursor = cursor.subtract(1, 'day');
    }
    while (activeDays.has(cursor.format('YYYY-MM-DD'))) {
      count++;
      cursor = cursor.subtract(1, 'day');
    }
    return count;
  }, [workouts]);

  useEffect(() => {
    if (!user?.uid) return;
    const currentStreak = (user as any).streak ?? 0;
    if (streak === currentStreak) return;
    setUser({ ...(user as any), streak } as any);
    supabase
      .from('profiles')
      .update({ streak })
      .eq('id', user.uid)
      .then(({ error }) => { if (error) console.error('Streak update error:', error); });
  }, [streak, user?.uid]);

  return streak;
}
