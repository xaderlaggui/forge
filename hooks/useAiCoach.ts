import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useAuthStore } from '../stores/authStore';
import { useNutrition } from './useNutrition';
import { useWorkouts } from './useWorkouts';
import { groqComplete } from '../services/groq';

export function useAiCoach() {
  const { user } = useAuthStore();
  const { data: nutrition } = useNutrition();
  const { workouts } = useWorkouts();

  return useQuery({
    queryKey: ['aiCoachTip', user?.uid, dayjs().format('YYYY-MM-DD')],
    queryFn: async () => {
      const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      if (!apiKey) {
        return "Set EXPO_PUBLIC_GROQ_API_KEY in your .env to enable the AI Coach.";
      }

      if (!user) return "Welcome! Start logging workouts and meals to get personalized tips.";

      const recentWorkout = workouts?.[0];
      const caloriesEaten = nutrition?.totalCalories ?? 0;
      const waterLiters   = ((nutrition?.waterMl ?? 0) / 1000).toFixed(1);

      try {
        return await groqComplete([
          {
            role: 'system',
            content:
              'You are an elite, highly motivating personal fitness coach. ' +
              'Reply in 1–2 short punchy sentences. No markdown. No emojis. ' +
              'Be specific to the data provided — reference the athlete\'s name, streak, or stats directly.',
          },
          {
            role: 'user',
            content:
              `Athlete: ${user.displayName || 'Athlete'}\n` +
              `Streak: ${(user as any).streak ?? 0} days\n` +
              `Calories logged today: ${caloriesEaten} kcal\n` +
              `Water logged today: ${waterLiters} L\n` +
              `Last workout: ${recentWorkout ? (recentWorkout.notes || `${recentWorkout.exercises.length} exercises`) : 'None recently'}\n\n` +
              `Give them one personalized, energetic coaching tip for today based on this data.`,
          },
        ], { max_tokens: 80, temperature: 0.85 });
      } catch (err: any) {
        console.error('AI Coach Error:', err?.message);
        return "Keep pushing! Every rep counts. Log your meals and workouts to stay on track.";
      }
    },
    staleTime: 1000 * 60 * 60 * 4, // Cache tip for 4 hours
    retry: false,
  });
}
