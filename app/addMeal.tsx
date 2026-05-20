import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save, Sparkles, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
          calories: updatedMeals[mealIdx].calories + newMealData.calories,
          protein: updatedMeals[mealIdx].protein + newMealData.protein,
          carbs: updatedMeals[mealIdx].carbs + newMealData.carbs,
          fat: updatedMeals[mealIdx].fat + newMealData.fat,
          fiber: (updatedMeals[mealIdx].fiber || 0) + (newMealData.fiber || 0),
          sugar: (updatedMeals[mealIdx].sugar || 0) + (newMealData.sugar || 0),
          isAiParsed: (updatedMeals[mealIdx] as any).isAiParsed || wasAiAnalyzed,
          items: [...(updatedMeals[mealIdx].items || []), newItem],
        };
      } else {
        updatedMeals.push({ ...newMealData, isAiParsed: wasAiAnalyzed, items: [newItem] });
      }

      await updateNutrition({
        meals: updatedMeals,
        totalCalories: (nutrition?.totalCalories || 0) + newMealData.calories,
        waterMl: (nutrition?.waterMl || 0) + (Number(waterMl) || 0),
      });

      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save meal.');
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
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <X size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={s.title}>
          LOG <Text style={{ color: T.colors.forge }}>{resolvedMealName.toUpperCase()}</Text>
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
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
              <View style={[s.infoBanner, { borderColor: confidenceColor[confidence] + '40', backgroundColor: confidenceColor[confidence] + '12' }]}>
                <Sparkles size={16} color={confidenceColor[confidence]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoText, { color: confidenceColor[confidence] }]}>
                    {confidence === 'high' && 'High confidence — values match known food data.'}
                    {confidence === 'medium' && 'Medium confidence — mixed dish, edit if needed.'}
                    {confidence === 'low' && 'Low confidence — unusual item, please verify.'}
                  </Text>
                  {!!analysisNotes && (
                    <Text style={[s.infoText, { color: T.colors.t3, marginTop: 2, fontSize: 11 }]}>
                      {analysisNotes}
                    </Text>
                  )}
                </View>
              </View>
            )}

            <View style={s.receiptCard}>
              <Text style={s.receiptTitle}>MEAL RECEIPT</Text>
              <View style={s.receiptDivider} />
              
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Item</Text>
                <TextInput style={[s.receiptInput, { flex: 1, marginLeft: 16 }]} value={foodName} onChangeText={setFoodName} placeholder="---" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Qty</Text>
                <TextInput style={[s.receiptInput, { flex: 1, marginLeft: 16 }]} value={portion} onChangeText={setPortion} placeholder="---" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.receiptDivider} />
              
              <View style={s.receiptRow}>
                <Text style={s.receiptCaloriesTitle}>Calories</Text>
                <TextInput style={s.receiptCaloriesInput} value={cals} onChangeText={setCals} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.receiptDivider} />
              
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Fat (g)</Text>
                <TextInput style={s.receiptInput} value={fat} onChangeText={setFat} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
              
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Carbs (g)</Text>
                <TextInput style={s.receiptInput} value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>

              <View style={[s.receiptRow, { paddingLeft: 16 }]}>
                <Text style={[s.receiptLabel, { fontSize: 12 }]}>Fiber (g)</Text>
                <TextInput style={[s.receiptInput, { fontSize: 14 }]} value={fiber} onChangeText={setFiber} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>

              <View style={[s.receiptRow, { paddingLeft: 16 }]}>
                <Text style={[s.receiptLabel, { fontSize: 12 }]}>Sugars (g)</Text>
                <TextInput style={[s.receiptInput, { fontSize: 14 }]} value={sugar} onChangeText={setSugar} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>

              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Protein (g)</Text>
                <TextInput style={s.receiptInput} value={pro} onChangeText={setPro} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.receiptDivider} />
              
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Water (ml)</Text>
                <TextInput style={s.receiptInput} value={waterMl} onChangeText={setWaterMl} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
              <Save size={18} color="#000" strokeWidth={2.5} />
              <Text style={s.saveBtnText}>SAVE MEAL</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: T.colors.t1, letterSpacing: 1 },
  scroll: { padding: T.spacing.page, paddingBottom: 60 },

  analyzeWrap: { marginTop: 40 },
  aiPrompt: { fontSize: 28, fontWeight: '700', color: T.colors.t1, marginBottom: 20 },
  aiInput: {
    backgroundColor: T.colors.bg1, borderWidth: 1, borderColor: T.colors.b1,
    borderRadius: T.radii.lg, padding: 20, color: T.colors.t1,
    fontSize: 18, minHeight: 150, marginBottom: 24, lineHeight: 26,
  },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.colors.forge, padding: 20, borderRadius: T.radii.lg,
    shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8,
  },
  aiBtnText: { color: '#000', fontSize: 18, fontWeight: '800', letterSpacing: 1 },

  formWrap: { flex: 1 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: T.radii.md,
    borderWidth: 1, marginBottom: 24,
  },
  infoText: { fontSize: 13, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '800', color: T.colors.t3, letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: T.colors.bg2, borderWidth: 1, borderColor: T.colors.b1,
    borderRadius: T.radii.md, padding: 16, color: T.colors.t1,
    fontSize: 16, fontWeight: '600', marginBottom: 20,
  },
  macroRow: { flexDirection: 'row', gap: 12 },
  macroCol: { flex: 1 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.colors.forge, padding: 20, borderRadius: T.radii.lg, marginTop: 12,
    shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8,
  },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Receipt styles
  receiptCard: {
    backgroundColor: T.colors.bg1,
    borderWidth: 1,
    borderColor: T.colors.b1,
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 24,
    borderRadius: T.radii.sm,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: T.colors.t1,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 12,
  },
  receiptDivider: {
    borderBottomWidth: 1,
    borderBottomColor: T.colors.b1,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: T.colors.t2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  receiptInput: {
    fontSize: 16,
    fontWeight: '700',
    color: T.colors.t1,
    textAlign: 'right',
    minWidth: 60,
    padding: 0,
  },
  receiptCaloriesTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: T.colors.t1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  receiptCaloriesInput: {
    fontSize: 28,
    fontWeight: '900',
    color: T.colors.t1,
    textAlign: 'right',
    minWidth: 80,
    padding: 0,
  },
});