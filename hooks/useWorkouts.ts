import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import type { Workout } from '../types';

export function useWorkouts() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const workoutsQuery = useQuery({
    queryKey: ['workouts', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.uid)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []) as Workout[];
    },
    enabled: !!user?.uid,
  });

  const saveWorkout = useMutation({
    mutationFn: async (workout: Workout) => {
      if (!user?.uid) return;
      const { error } = await supabase
        .from('workouts')
        .upsert({ ...workout, user_id: user.uid }, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts', user?.uid] }),
  });

  const updateWorkout = useMutation({
    mutationFn: async (workout: Workout) => {
      if (!user?.uid) return;
      const { error } = await supabase
        .from('workouts')
        .upsert({ ...workout, user_id: user.uid }, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts', user?.uid] }),
  });

  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutsQuery.isLoading,
    saveWorkout: saveWorkout.mutateAsync,
    updateWorkout: updateWorkout.mutateAsync,
  };
}
