import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, Candy, Droplets, Dumbbell, Flame, Leaf, Save, Sparkles, Star, Wheat } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MEAL_ANALYSIS_SYSTEM_PROMPT } from '../constants/prompts';
import { useNutrition } from '../hooks/useNutrition';
import { groqComplete } from '../services/groq';
import type { Meal } from '../types';

export default function AddMealScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { mealName: mealNameParam } = useLocalSearchParams();
  const { data: nutrition, updateNutrition } = useNutrition();

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
  const [analyzed, setAnalyzed] = useState(false);
  const [wasAiAnalyzed, setWasAiAnalyzed] = useState(false);
  const [resolvedMealName, setResolvedMealName] = useState(mealName);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [analysisNotes, setAnalysisNotes] = useState('');

  const detectMealSlotFromText = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (/\bbreakfast\b/.test(lower)) return 'Breakfast';
    if (/\blunch\b/.test(lower)) return 'Lunch';
    if (/\bdinner\b/.test(lower)) return 'Dinner';
    if (/\bsnack(s)?\b/.test(lower)) return 'Snacks';
    return null;
  };

  // Form state
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('');
  const [cals, setCals] = useState('');
  const [pro, setPro] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [waterMl, setWaterMl] = useState('');

  /**
   * Validates that calories are roughly consistent with macros.
   * (protein * 4) + (carbs * 4) + (fat * 9) should be within 10% of reported calories.
   * Returns corrected calorie value if significantly off, or original if fine.
   */
  const validateAndCorrectCalories = (
    calories: number,
    protein: number,
    carbsG: number,
    fatG: number
  ): { corrected: number; wasOff: boolean } => {
    const computed = protein * 4 + carbsG * 4 + fatG * 9;
    const diff = Math.abs(calories - computed);
    const threshold = calories * 0.12; // 12% tolerance
    if (diff > threshold && computed > 0) {
      return { corrected: Math.round(computed), wasOff: true };
    }
    return { corrected: calories, wasOff: false };
  };

  const analyzeMeal = async () => {
    if (!description.trim()) {
      Alert.alert('Empty', 'Please describe what you ate first.');
      return;
    }

    const detectedSlot = detectMealSlotFromText(description);
    if (detectedSlot) setResolvedMealName(detectedSlot);

    setIsAnalyzing(true);
    try {
      const content = await groqComplete(
        [
          { role: 'system', content: MEAL_ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: description },
        ],
        {
          // ✅ 70B model — significantly better nutritional knowledge than 8B
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,   // low temp = more deterministic, fact-based output
          max_tokens: 300,
          response_format: { type: 'json_object' },
        }
      );

      const parsed = JSON.parse(content);

      const protein = Number(parsed.protein || 0);
      const carbsVal = Number(parsed.carbs || 0);
      const fatVal = Number(parsed.fat || 0);
      const rawCals = Number(parsed.calories || 0);

      // Validate macro-calorie consistency and auto-correct if needed
      const { corrected: finalCals, wasOff } = validateAndCorrectCalories(rawCals, protein, carbsVal, fatVal);

      setFoodName(parsed.foodName || description);
      setPortion(parsed.portion || '1 serving');
      setCals(String(finalCals));
      setPro(String(protein));
      setCarbs(String(carbsVal));
      setFat(String(fatVal));
      setFiber(String(Number(parsed.fiber || 0)));
      setSugar(String(Number(parsed.sugar || 0)));
      setWaterMl(String(Number(parsed.waterMl || 0)));
      setConfidence(parsed.confidence || 'medium');
      setAnalysisNotes(
        wasOff
          ? `Calories adjusted from ${rawCals} to ${finalCals} to match macros.${parsed.notes ? ' ' + parsed.notes : ''}`
          : parsed.notes || ''
      );

      setAnalyzed(true);
      setWasAiAnalyzed(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Analysis Failed', 'Could not estimate nutrition. You can still enter it manually.');
      setAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!foodName || !cals) {
      Alert.alert('Incomplete', 'Please enter at least a meal name and calories.');
      return;
    }

    try {
      const existingMeals = nutrition?.meals || [];
      const mealIdx = existingMeals.findIndex(m => m.name === resolvedMealName);
      let updatedMeals = [...existingMeals];

      const newMealData: Meal = {
        name: resolvedMealName,
        calories: Number(cals),
        protein: Number(pro) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
        sugar: Number(sugar) || 0,
      };

      const newItem = {
        name: foodName,
        serving: portion || '1 serving',
        calories: Number(cals),
        protein: Number(pro) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      };

      if (mealIdx >= 0) {
        updatedMeals[mealIdx] = {
          name: resolvedMealName,
          calories: (Number(updatedMeals[mealIdx].calories) || 0) + newMealData.calories,
          protein: (Number(updatedMeals[mealIdx].protein) || 0) + newMealData.protein,
          carbs: (Number(updatedMeals[mealIdx].carbs) || 0) + newMealData.carbs,
          fat: (Number(updatedMeals[mealIdx].fat) || 0) + newMealData.fat,
          fiber: (Number(updatedMeals[mealIdx].fiber) || 0) + (newMealData.fiber || 0),
          sugar: (Number(updatedMeals[mealIdx].sugar) || 0) + (newMealData.sugar || 0),
          isAiParsed: (updatedMeals[mealIdx] as any).isAiParsed || wasAiAnalyzed,
          items: [...(updatedMeals[mealIdx].items || []), newItem],
        };
      } else {
        updatedMeals.push({ ...newMealData, isAiParsed: wasAiAnalyzed, items: [newItem] });
      }

      await updateNutrition({
        meals: updatedMeals,
        totalCalories: (Number(nutrition?.totalCalories) || 0) + newMealData.calories,
        waterMl: (Number(nutrition?.waterMl) || 0) + (Number(waterMl) || 0),
      });

      router.back();
    } catch (e: any) {
      console.error('Save Meal Error:', e);
      Alert.alert('Error', e?.message || 'Failed to save meal.');
    }
  };

  const confidenceColor = {
    high: '#4CAF50',
    medium: '#FF9800',
    low: '#F44336',
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
          <Text style={s.title}>
            <Text style={{ color: T.colors.forge }}>LOG</Text> {resolvedMealName.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={s.scroll}>
        {!analyzed ? (
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

            <TouchableOpacity onPress={() => setAnalyzed(true)} style={{ marginTop: 24, padding: 12 }}>
              <Text style={{ color: T.colors.t3, textAlign: 'center', fontSize: 14, fontWeight: '600' }}>
                Or enter manually
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.formWrap}>
            {/* AI confidence badge */}
            {wasAiAnalyzed && confidence && (
              <View style={[s.badgePill, { borderColor: confidenceColor[confidence], shadowColor: confidenceColor[confidence] }]}>
                <Star size={12} color={confidenceColor[confidence]} fill={confidenceColor[confidence]} />
                <Text style={[s.badgeText, { color: confidenceColor[confidence] }]}>
                  {confidence.toUpperCase()} CONFIDENCE
                </Text>
              </View>
            )}

            <View style={s.headerWrap}>
              <TextInput style={s.foodNameInput} multiline={true} value={foodName} onChangeText={setFoodName} placeholder="FOOD NAME" placeholderTextColor={T.colors.t3} textAlign="center" />
              <TextInput style={s.portionInput} multiline={true} value={portion} onChangeText={setPortion} placeholder="portion" placeholderTextColor={T.colors.t3} textAlign="center" />
            </View>

            <View style={s.caloriesRing}>
              <TextInput style={s.caloriesValue} value={cals} onChangeText={setCals} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} textAlign="center" />
              <Text style={s.caloriesLabel}>CALORIES</Text>
            </View>

            <View style={s.grid}>
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Flame size={16} color={T.colors.forge} />
                  <Text style={s.cardLabel}>FAT</Text>
                </View>
                <View style={s.cardValueRow}>
                  <TextInput style={s.cardValue} value={fat} onChangeText={setFat} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
                  <Text style={s.cardUnit}>g</Text>
                </View>
              </View>

              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Dumbbell size={16} color="#A29E9A" />
                  <Text style={s.cardLabel}>PROTEIN</Text>
                </View>
                <View style={s.cardValueRow}>
                  <TextInput style={s.cardValue} value={pro} onChangeText={setPro} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
                  <Text style={s.cardUnit}>g</Text>
                </View>
              </View>

              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Wheat size={16} color="#D4A373" />
                  <Text style={s.cardLabel}>CARBS</Text>
                </View>
                <View style={s.cardValueRow}>
                  <TextInput style={s.cardValue} value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
                  <Text style={s.cardUnit}>g</Text>
                </View>
              </View>

              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Leaf size={16} color="#4CAF50" />
                  <Text style={s.cardLabel}>FIBER</Text>
                </View>
                <View style={s.cardValueRow}>
                  <TextInput style={s.cardValue} value={fiber} onChangeText={setFiber} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
                  <Text style={s.cardUnit}>g</Text>
                </View>
              </View>

              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Candy size={16} color="#FF9A8B" />
                  <Text style={s.cardLabel}>SUGARS</Text>
                </View>
                <View style={s.cardValueRow}>
                  <TextInput style={s.cardValue} value={sugar} onChangeText={setSugar} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
                  <Text style={s.cardUnit}>g</Text>
                </View>
              </View>

              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Droplets size={16} color="#42A5F5" />
                  <Text style={s.cardLabel}>WATER</Text>
                </View>
                <View style={s.cardValueRow}>
                  <TextInput style={s.cardValue} value={waterMl} onChangeText={setWaterMl} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
                  <Text style={s.cardUnit}>ML</Text>
                </View>
              </View>
            </View>

            {!!analysisNotes && (
              <View style={s.notesRow}>
                <AlertCircle size={14} color={T.colors.forge} />
                <Text style={s.notesText}>{analysisNotes}</Text>
              </View>
            )}

            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
              <Save size={18} color="#000" strokeWidth={2.5} />
              <Text style={s.saveBtnText}>SAVE MEAL</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: T.colors.t1, letterSpacing: 1, marginBottom: 4 },
  scroll: { padding: 16, },

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

  formWrap: { alignItems: 'center' },

  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
    borderWidth: 1, marginBottom: 12, backgroundColor: T.colors.bg1,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 4
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  headerWrap: { alignItems: 'center', marginBottom: 16, width: '100%' },
  foodNameInput: { fontSize: 24, fontWeight: '900', color: T.colors.t1, textTransform: 'uppercase', textAlign: 'center', width: '100%' },
  portionInput: { fontSize: 14, fontWeight: '600', color: T.colors.t3, textAlign: 'center', width: '100%', marginTop: 2 },

  caloriesRing: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 25, paddingHorizontal: 32,
    borderRadius: 999,
    borderWidth: 1, borderColor: T.colors.forge + '4D',
    marginBottom: 15,
    shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 24, elevation: 12,
    backgroundColor: T.colors.bg1
  },
  caloriesValue: { fontSize: 42, fontWeight: '900', color: T.colors.forge, textAlign: 'center', minWidth: 80, padding: 0 },
  caloriesLabel: { fontSize: 10, fontWeight: '800', color: T.colors.t2, letterSpacing: 2, marginTop: -4 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', marginBottom: 10
  },
  card: {
    flex: 1, minWidth: '33%',
    backgroundColor: T.colors.bg1,
    borderRadius: 15, padding: 18,
    borderWidth: 1, borderColor: T.colors.b1
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8
  },
  cardLabel: { fontSize: 11, fontWeight: '700', color: T.colors.t2, letterSpacing: 1 },
  cardValueRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 1 },
  cardValue: { fontSize: 23, fontWeight: '900', color: T.colors.t1, textAlign: 'center', minWidth: 30, padding: 0 },
  cardUnit: { fontSize: 11, fontWeight: '600', color: T.colors.t3, marginBottom: 2 },

  notesRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    width: '100%', paddingHorizontal: 8, marginBottom: 10
  },
  notesText: { flex: 1, fontSize: 11, fontWeight: '500', color: T.colors.t3, lineHeight: 16 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
    backgroundColor: T.colors.forge, padding: 16, borderRadius: 999, marginTop: 8,
    shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
  },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});