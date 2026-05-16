import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNutrition } from '../hooks/useNutrition';
import type { Meal } from '../types';

export default function AddMealScreen() {
  const router = useRouter();
  const { mealName } = useLocalSearchParams();
  const { data: nutrition, updateNutrition } = useNutrition();

  const [foodName, setFoodName] = useState('');
  const [cals, setCals] = useState('');
  const [pro, setPro] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleSave = async () => {
    if (!foodName || !cals) {
      Alert.alert('Incomplete', 'Please enter at least a meal name and calories.');
      return;
    }

    try {
      const targetMealName = (mealName as string) || 'Snack';
      const existingMeals = nutrition?.meals || [];
      
      // We will replace the dummy empty meal with this actual meal data,
      // or if it's already filled, we'll append to it (for simplicity, we'll just overwrite/add)
      const mealIdx = existingMeals.findIndex(m => m.name === targetMealName);
      
      let updatedMeals = [...existingMeals];
      const newMealData: Meal = {
        name: targetMealName,
        calories: Number(cals),
        protein: Number(pro) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      };

      if (mealIdx >= 0) {
        // Add to existing meal category
        updatedMeals[mealIdx] = {
          name: targetMealName,
          calories: updatedMeals[mealIdx].calories + newMealData.calories,
          protein: updatedMeals[mealIdx].protein + newMealData.protein,
          carbs: updatedMeals[mealIdx].carbs + newMealData.carbs,
          fat: updatedMeals[mealIdx].fat + newMealData.fat,
        };
      } else {
        updatedMeals.push(newMealData);
      }

      await updateNutrition({ 
        meals: updatedMeals, 
        totalCalories: (nutrition?.totalCalories || 0) + newMealData.calories 
      });

      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save meal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOG <Text style={{ color: '#D2FF00' }}>{((mealName as string) || 'MEAL').toUpperCase()}</Text></Text>

      <View style={styles.form}>
        <Text style={styles.label}>FOOD ITEM</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Chicken Breast & Rice" 
          placeholderTextColor="#8A8A93"
          value={foodName}
          onChangeText={setFoodName}
        />

        <Text style={styles.label}>CALORIES</Text>
        <TextInput 
          style={styles.input} 
          placeholder="0" 
          placeholderTextColor="#8A8A93"
          keyboardType="numeric"
          value={cals}
          onChangeText={setCals}
        />

        <View style={styles.macroRow}>
          <View style={styles.macroCol}>
            <Text style={styles.label}>PROTEIN (g)</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor="#8A8A93" keyboardType="numeric" value={pro} onChangeText={setPro} />
          </View>
          <View style={styles.macroCol}>
            <Text style={styles.label}>CARBS (g)</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor="#8A8A93" keyboardType="numeric" value={carbs} onChangeText={setCarbs} />
          </View>
          <View style={styles.macroCol}>
            <Text style={styles.label}>FAT (g)</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor="#8A8A93" keyboardType="numeric" value={fat} onChangeText={setFat} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>SAVE MEAL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0C0E', padding: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1, marginBottom: 32 },
  
  form: { flex: 1 },
  label: { fontSize: 10, fontWeight: '800', color: '#8A8A93', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#16161A', borderWidth: 1, borderColor: '#242429', borderRadius: 12, padding: 16, color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 24 },
  
  macroRow: { flexDirection: 'row', gap: 12 },
  macroCol: { flex: 1 },
  
  saveBtn: { backgroundColor: '#D2FF00', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, shadowColor: '#D2FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  
  cancelBtn: { padding: 18, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#8A8A93', fontSize: 12, fontWeight: '800', letterSpacing: 1 }
});
