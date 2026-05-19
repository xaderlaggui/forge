import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save, Sparkles, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNutrition } from '../hooks/useNutrition';
import { groqComplete } from '../services/groq';
import type { Meal } from '../types';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { MEAL_ANALYSIS_SYSTEM_PROMPT } from '../constants/prompts';

export default function AddMealScreen() {
    const { T } = useForgeTheme();
    const s = useS(T);
  const router = useRouter();
  const { mealName: mealNameParam } = useLocalSearchParams();
  const { data: nutrition, updateNutrition } = useNutrition();

  // Auto-detect meal slot from time of day if no param passed
  const getDefaultMealSlot = () => {
    const h = new Date().getHours();
    if (h >= 5  && h < 11) return 'Breakfast';
    if (h >= 11 && h < 16) return 'Lunch';
    if (h >= 16 && h < 21) return 'Dinner';
    return 'Snacks';
  };
  const mealName = (mealNameParam as string) || getDefaultMealSlot();

  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [wasAiAnalyzed, setWasAiAnalyzed] = useState(false);
  // Resolved meal slot — starts from param/time-of-day, can be overridden by description keywords
  const [resolvedMealName, setResolvedMealName] = useState(mealName);

  /** Scan free-text for meal-slot keywords and return the canonical slot name, or null if none found */
  const detectMealSlotFromText = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (/\bbreakfast\b/.test(lower)) return 'Breakfast';
    if (/\blunch\b/.test(lower))     return 'Lunch';
    if (/\bdinner\b/.test(lower))    return 'Dinner';
    if (/\bsnack(s)?\b/.test(lower)) return 'Snacks';
    return null;
  };

  // Form State
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('');
  const [cals, setCals] = useState('');
  const [pro, setPro] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [waterMl, setWaterMl] = useState('');

  const analyzeMeal = async () => {
    if (!description.trim()) {
      Alert.alert('Empty', 'Please describe what you ate first.');
      return;
    }

    // Override meal slot if user mentioned it in the description
    const detectedSlot = detectMealSlotFromText(description);
    if (detectedSlot) setResolvedMealName(detectedSlot);

    setIsAnalyzing(true);
    try {
      const content = await groqComplete([
        {
          role: 'system',
          content: MEAL_ANALYSIS_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: description
        }
      ], {
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(content);

      setFoodName(parsed.foodName || description);
      setPortion(parsed.portion || '1 serving');
      setCals(String(parsed.calories || 0));
      setPro(String(parsed.protein || 0));
      setCarbs(String(parsed.carbs || 0));
      setFat(String(parsed.fat || 0));
      setFiber(String(parsed.fiber || 0));
      setSugar(String(parsed.sugar || 0));
      setWaterMl(String(parsed.waterMl || 0));

      setAnalyzed(true);
      setWasAiAnalyzed(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Analysis Failed', 'Could not estimate nutrition. You can still enter it manually.');
      setAnalyzed(true); // Let them type manually
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
      const targetMealName = resolvedMealName;
      const existingMeals = nutrition?.meals || [];

      const mealIdx = existingMeals.findIndex(m => m.name === targetMealName);
      let updatedMeals = [...existingMeals];

      const finalName = portion ? `${foodName} (${portion})` : foodName;

      const newMealData: Meal = {
        name: targetMealName,
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
        // Append macros to the existing meal category (e.g. "Breakfast")
        updatedMeals[mealIdx] = {
          name: targetMealName,
          calories: updatedMeals[mealIdx].calories + newMealData.calories,
          protein: updatedMeals[mealIdx].protein + newMealData.protein,
          carbs: updatedMeals[mealIdx].carbs + newMealData.carbs,
          fat: updatedMeals[mealIdx].fat + newMealData.fat,
          fiber: (updatedMeals[mealIdx].fiber || 0) + (newMealData.fiber || 0),
          sugar: (updatedMeals[mealIdx].sugar || 0) + (newMealData.sugar || 0),
          // Keep isAiParsed true if either the existing or new entry was AI-analyzed
          isAiParsed: (updatedMeals[mealIdx] as any).isAiParsed || wasAiAnalyzed,
          items: [...(updatedMeals[mealIdx].items || []), newItem]
        };
      } else {
        updatedMeals.push({ ...newMealData, isAiParsed: wasAiAnalyzed, items: [newItem] });
      }

      await updateNutrition({
        meals: updatedMeals,
        totalCalories: (nutrition?.totalCalories || 0) + newMealData.calories,
        waterMl: (nutrition?.waterMl || 0) + (Number(waterMl) || 0)
      });

      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save meal.');
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <X size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={s.title}>LOG <Text style={{ color: T.colors.forge }}>{resolvedMealName.toUpperCase()}</Text></Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {!analyzed ? (
          <View style={s.analyzeWrap}>
            <Text style={s.aiPrompt}>What did you eat?</Text>
            <TextInput
              style={s.aiInput}
              placeholder="e.g. 'I had a bowl of sinigang with 1 cup of white rice' or '2 eggs'"
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
              <Text style={{ color: T.colors.t3, textAlign: 'center', fontSize: 14, fontWeight: '600' }}>Or enter manually</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.formWrap}>
            <View style={s.infoBanner}>
              <Sparkles size={16} color={T.colors.forge} />
              <Text style={s.infoText}>You can edit these AI estimates if needed.</Text>
            </View>

            <Text style={s.label}>FOOD SUMMARY</Text>
            <TextInput style={s.input} value={foodName} onChangeText={setFoodName} placeholder="Food name" placeholderTextColor={T.colors.t3} />

            <Text style={s.label}>PORTION / AMOUNT</Text>
            <TextInput style={s.input} value={portion} onChangeText={setPortion} placeholder="e.g. 1 cup, 200g" placeholderTextColor={T.colors.t3} />

            <Text style={s.label}>CALORIES</Text>
            <TextInput style={s.input} value={cals} onChangeText={setCals} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />

            <View style={s.macroRow}>
              <View style={s.macroCol}>
                <Text style={s.label}>PROTEIN (g)</Text>
                <TextInput style={s.input} value={pro} onChangeText={setPro} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.macroCol}>
                <Text style={s.label}>CARBS (g)</Text>
                <TextInput style={s.input} value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.macroCol}>
                <Text style={s.label}>FAT (g)</Text>
                <TextInput style={s.input} value={fat} onChangeText={setFat} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
            </View>

            <View style={s.macroRow}>
              <View style={s.macroCol}>
                <Text style={s.label}>FIBER (g)</Text>
                <TextInput style={s.input} value={fiber} onChangeText={setFiber} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.macroCol}>
                <Text style={s.label}>SUGAR (g)</Text>
                <TextInput style={s.input} value={sugar} onChangeText={setSugar} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
            </View>

            <View style={s.macroRow}>
              <View style={s.macroCol}>
                <Text style={s.label}>WATER (ml)</Text>
                <TextInput style={s.input} value={waterMl} onChangeText={setWaterMl} keyboardType="numeric" placeholder="0" placeholderTextColor={T.colors.t3} />
              </View>
              <View style={s.macroCol} />
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
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: 'rgba(178, 255, 36, 0.1)', padding: 12, borderRadius: T.radii.md,
            borderWidth: 1, borderColor: 'rgba(178, 255, 36, 0.2)', marginBottom: 24,
          },
          infoText: { color: T.colors.forge, fontSize: 13, fontWeight: '600' },
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
            backgroundColor: T.colors.forge, padding: 20, borderRadius: T.radii.lg, marginTop: 24,
            shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8,
          },
          saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
        });
