/**
 * useStreak
 *
 * Calculates the user's current streak from their actual workout history
 * and writes it back to Firestore if it has changed.
 *
 * Rules:
 *  - A "streak day" = any calendar day that has at least 1 logged workout
 *  - Streak is the count of consecutive days ending today (or yesterday if
 *    the user hasn't worked out yet today — grace-period logic)
 *  - If the last workout was 2+ days ago the streak resets to 0
 */

import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import { useWorkouts } from './useWorkouts';

export function useStreak() {
  const { user, setUser } = useAuthStore();
  const { workouts } = useWorkouts();

  const streak = useMemo(() => {
    if (!workouts || workouts.length === 0) return 0;

    // Build a Set of unique dates that have at least one workout
    const activeDays = new Set(workouts.map(w => w.date));

    let count = 0;
    // Start from today; allow "today not logged yet" by also checking yesterday
    let cursor = dayjs();

    // If today has no workout, start counting from yesterday
    if (!activeDays.has(cursor.format('YYYY-MM-DD'))) {
      cursor = cursor.subtract(1, 'day');
    }

    // Walk backwards while consecutive days exist
    while (activeDays.has(cursor.format('YYYY-MM-DD'))) {
      count++;
      cursor = cursor.subtract(1, 'day');
    }

    return count;
  }, [workouts]);

  // Sync to Firestore only when the value changes
  useEffect(() => {
    if (!user?.uid) return;
    const currentStreak = (user as any).streak ?? 0;
    if (streak === currentStreak) return;

    // Update local store immediately for instant UI feedback
    setUser({ ...(user as any), streak } as any);

    // Persist to Firestore
    updateDoc(doc(db, 'users', user.uid), { streak }).catch(console.error);
  }, [streak, user?.uid]);

  return streak;
}
