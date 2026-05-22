import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MEAL_ANALYSIS_SYSTEM_PROMPT } from '../constants/prompts';
import { groqComplete } from '../services/groq';

export default function AnalyzeMealScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { mealName: mealNameParam } = useLocalSearchParams();

  const getDefaultMealSlot = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 'Breakfast';
    if (h >= 11 && h < 16) return 'Lunch';
    if (h >= 16 && h < 21) return 'Dinner';
    return 'Snacks';
  };
  const mealName = (mealNameParam as string) || getDefaultMealSlot();

  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const detectMealSlotFromText = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (/\bbreakfast\b/.test(lower)) return 'Breakfast';
    if (/\blunch\b/.test(lower)) return 'Lunch';
    if (/\bdinner\b/.test(lower)) return 'Dinner';
    if (/\bsnack(s)?\b/.test(lower)) return 'Snacks';
    return null;
  };

  const analyzeMeal = async () => {
    if (!description.trim()) {
      Alert.alert('Empty', 'Please describe what you ate first.');
      return;
    }

    const detectedSlot = detectMealSlotFromText(description);
    const resolvedMealName = detectedSlot || mealName;

    setIsAnalyzing(true);
    try {
      const content = await groqComplete(
        [
          { role: 'system', content: MEAL_ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: description },
        ],
        {
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          max_tokens: 300,
          response_format: { type: 'json_object' },
        }
      );

      // Pass the parsed string directly to addMeal
      router.replace({
        pathname: '/addMeal',
        params: {
          mealName: resolvedMealName,
          aiData: content,
          originalDescription: description
        }
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Analysis Failed', 'Could not estimate nutrition. You can still enter it manually.');
      router.replace({ pathname: '/addMeal', params: { mealName: resolvedMealName } });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={s.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => router.back()} />
      <View style={s.sheet}>
        <View style={s.grabberWrap}>
          <View style={s.grabber} />
        </View>

        <View style={s.header}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
            <Text style={s.title}>
              <Text style={{ color: T.colors.forge }}>LOG</Text> {mealName.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={s.scroll}>
          <View style={s.analyzeWrap}>
            <Text style={s.aiPrompt}>What did you eat?</Text>
            <TextInput
              style={s.aiInput}
              placeholder="e.g. 'I had a bowl of sinigang with 1 cup of white rice' or '2 scrambled eggs'"
              placeholderTextColor={T.colors.t3}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity
              style={[s.aiBtn, isAnalyzing && { opacity: 0.7 }]}
              onPress={analyzeMeal}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Sparkles size={18} color="#000" strokeWidth={3} />
                  <Text style={s.aiBtnText}>Analyze Meal</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace({ pathname: '/addMeal', params: { mealName } })} style={{ marginTop: 24, padding: 12 }}>
              <Text style={{ color: T.colors.t3, textAlign: 'center', fontSize: 14, fontWeight: '600' }}>
                Or enter manually
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { width: '100%', backgroundColor: T.colors.bg0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20 },
  grabberWrap: { width: '100%', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: T.colors.b1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 2,
  },
  title: { fontSize: 24, fontWeight: '900', color: T.colors.t1, letterSpacing: 1, marginBottom: 4 },
  scroll: { padding: 16, paddingBottom: 40 },

  analyzeWrap: { marginTop: 0 },
  aiPrompt: { fontSize: 24, fontWeight: '700', color: T.colors.t1, marginBottom: 16 },
  aiInput: {
    backgroundColor: T.colors.bg1, borderWidth: 1, borderColor: T.colors.b1,
    borderRadius: 16, padding: 16, color: T.colors.t1,
    fontSize: 16, minHeight: 120, marginBottom: 20, lineHeight: 24,
  },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.colors.forge, padding: 16, borderRadius: 999,
    shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8,
  },
  aiBtnText: { color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
