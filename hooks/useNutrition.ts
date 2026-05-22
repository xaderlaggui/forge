import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import type { NutritionLog } from '../types';

export function useNutrition(dateStr: string = dayjs().format('YYYY-MM-DD')) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const queryKey = ['nutrition', user?.uid, dateStr];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.uid) return null;
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.uid)
        .eq('date', dateStr)
        .maybeSingle();
      if (error) throw error;

      if (data) {
        const meals = (data.meals || []) as any[];
        const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
        return { ...data, totalCalories } as NutritionLog;
      }

      // Default empty state
      return {
        date: dateStr,
        meals: [
          { name: 'Breakfast', calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Dinner', calories: 0, protein: 0, carbs: 0, fat: 0 },
          { name: 'Snacks', calories: 0, protein: 0, carbs: 0, fat: 0 },
        ],
        waterMl: 0,
        totalCalories: 0,
      } as NutritionLog;
    },
    enabled: !!user?.uid,
  });

  const mutation = useMutation({
    mutationFn: async (newData: Partial<NutritionLog>) => {
      if (!user?.uid) return;

      // Strip out derived fields like totalCalories before saving
      const { totalCalories, ...dbData } = newData as any;

      const { error } = await supabase
        .from('nutrition_logs')
        .upsert({ ...dbData, user_id: user.uid, date: dateStr }, { onConflict: 'user_id,date' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { ...query, updateNutrition: mutation.mutateAsync };
}
