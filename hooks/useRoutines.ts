import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
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
      const q = query(collection(db, `users/${user.uid}/routines`));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as RoutineTemplate);
    },
    enabled: !!user?.uid,
  });

  const saveRoutine = useMutation({
    mutationFn: async (routine: RoutineTemplate) => {
      if (!user?.uid) return;
      const ref = doc(db, `users/${user.uid}/routines/${routine.id}`);
      await setDoc(ref, routine, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', user?.uid] });
    }
  });

  return {
    routines: routinesQuery.data || [],
    isLoading: routinesQuery.isLoading,
    saveRoutine: saveRoutine.mutateAsync
  };
}
