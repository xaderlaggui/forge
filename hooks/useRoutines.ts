import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

export interface RoutineTemplate {
  id: string;
  name: string;
  split?: 'push' | 'pull' | 'legs' | 'full';
  exercises: {
    exerciseId?: string;
    name: string;
    sets: number;
    reps: number;
    preset?: string;
  }[];
}

export function useRoutines() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const routinesQuery = useQuery({
    queryKey: ['routines', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.uid);
      if (error) throw error;
      return (data || []) as RoutineTemplate[];
    },
    enabled: !!user?.uid,
  });

  const saveRoutine = useMutation({
    mutationFn: async (routine: RoutineTemplate) => {
      if (!user?.uid) return;
      const { error } = await supabase
        .from('routines')
        .upsert({ ...routine, user_id: user.uid }, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines', user?.uid] }),
  });

  return {
    routines: routinesQuery.data || [],
    isLoading: routinesQuery.isLoading,
    saveRoutine: saveRoutine.mutateAsync,
  };
}
