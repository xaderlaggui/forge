import { useQuery } from '@tanstack/react-query';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuthStore } from '../stores/authStore';
import { useNutrition } from './useNutrition';
import { useWorkouts } from './useWorkouts';
import dayjs from 'dayjs';

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export function useAiCoach() {
  const { user } = useAuthStore();
  const { data: nutrition } = useNutrition();
  const { workouts } = useWorkouts();

  return useQuery({
    queryKey: ['aiCoachTip', user?.uid, dayjs().format('YYYY-MM-DD')],
    queryFn: async () => {
      if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        return "Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file to enable the AI Coach.";
      }

      if (!user) return "Welcome to your AI Coach! Start logging data to get personalized tips.";

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Gather context context for the AI
        const recentWorkout = workouts?.[0];
        const caloriesEaten = nutrition?.totalCalories || 0;
        const waterLiters = ((nutrition?.waterMl || 0) / 1000).toFixed(1);

        const prompt = `
          You are a world-class, highly motivating personal fitness AI coach. 
          Keep your response under 2 sentences. Make it punchy and actionable.
          
          User Context:
          Name: ${user.displayName || 'Athlete'}
          Streak: ${user.streak || 0} days
          Today's Calories Logged: ${caloriesEaten} kcal
          Today's Water Logged: ${waterLiters}L
          Recent Workout: ${recentWorkout ? recentWorkout.notes || recentWorkout.exercises.length + ' exercises' : 'None recently'}
          
          Based on this data, give them a highly personalized, energetic tip for today. Focus on either nutrition, hydration, or training depending on what they might need most right now.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.error("AI Coach Error:", error);
        return "Keep pushing! Log your meals and workouts to stay on track today.";
      }
    },
    // Only refetch once per day ideally, or when data changes significantly
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
  });
}
