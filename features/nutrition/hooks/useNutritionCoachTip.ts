import { useState, useEffect, useRef } from 'react';
import { groqComplete } from '../../../services/groq';
import { NUTRITION_TIP_SYSTEM_PROMPT } from '../../../constants/prompts';

const FALLBACK_TIPS = [
  "To optimize your metabolism, make sure you're drinking at least 2 liters of water a day.",
  "Eating a protein-rich breakfast can reduce cravings later in the day.",
  "Don't fear healthy fats! Avocados and nuts are great for hormone balance.",
  "Try to eat a rainbow of vegetables to ensure you're getting a variety of micronutrients.",
  "If your goal is to build muscle, ensure you're eating in a slight caloric surplus.",
  "Meal prepping on weekends can save you hours during busy weekdays.",
  "Carbs are fuel! Focus on complex carbs like sweet potatoes and oats for sustained energy."
];

// Cache the tip globally so we don't re-fetch every time the user switches tabs
let cachedAiTip: string | null = null;
let lastFetchTime = 0;

export function useNutritionCoachTip(aggregates: any) {
  const [tip, setTip] = useState<string>(() => {
    return cachedAiTip || FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  });
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch if we have aggregates, haven't fetched recently (e.g., 10 mins), and haven't fetched this mount
    const now = Date.now();
    const shouldFetch = aggregates && (now - lastFetchTime > 10 * 60 * 1000) && !hasFetched.current;

    if (!shouldFetch) return;
    hasFetched.current = true;

    const fetchAiTip = async () => {
      setIsLoading(true);
      try {
        const stats = `Calories: ${aggregates.totalCalories}/${aggregates.targetCalories}, Protein: ${aggregates.totalProtein}/${aggregates.targetProtein}g, Carbs: ${aggregates.totalCarbs}/${aggregates.targetCarbs}g, Fat: ${aggregates.totalFat}/${aggregates.targetFat}g`;
        
        const response = await groqComplete([
          { role: 'system', content: NUTRITION_TIP_SYSTEM_PROMPT || "You are a fitness nutrition coach. Reply with ONE tip under 150 characters. No intro." },
          { role: 'user', content: `My stats today: ${stats}. Give me a short tip.` }
        ], {
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 55,
        });

        const newTip = response.trim().replace(/^["']|["']$/g, '').substring(0, 160);
        if (newTip) {
          cachedAiTip = newTip;
          lastFetchTime = Date.now();
          setTip(newTip);
        }
      } catch (err) {
        console.error('Failed to fetch AI nutrition tip:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiTip();
  }, [aggregates]);

  return { tip, isLoading };
}
