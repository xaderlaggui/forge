import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import type { NutritionLog, Meal } from '../types';
import dayjs from 'dayjs';

export function useNutrition(dateStr: string = dayjs().format('YYYY-MM-DD')) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const queryKey = ['nutrition', user?.uid, dateStr];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.uid) return null;
      const ref = doc(db, `users/${user.uid}/nutrition/${dateStr}`);
      const snap = await getDoc(ref);
      
      if (snap.exists()) {
        return snap.data() as NutritionLog;
      }
      
      // Default empty state
      return {
        date: dateStr,
        meals: [
          { name: 'Breakfast', calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Lunch',     calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Dinner',   calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Snacks',   calories: 0, protein: 0, carbs: 0, fat: 0 },
        ],
        waterMl: 0,
        totalCalories: 0
      } as NutritionLog;
    },
    enabled: !!user?.uid,
  });

  const mutation = useMutation({
    mutationFn: async (newData: Partial<NutritionLog>) => {
      if (!user?.uid) return;
      const ref = doc(db, `users/${user.uid}/nutrition/${dateStr}`);
      await setDoc(ref, newData, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  return { ...query, updateNutrition: mutation.mutateAsync };
}
