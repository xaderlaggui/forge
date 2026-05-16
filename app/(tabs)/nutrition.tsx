import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, ScanLine, Plus } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useNutrition } from '../../hooks/useNutrition';

export default function NutritionScreen() {
  const router = useRouter();
  const { data: nutrition, isLoading } = useNutrition();

  if (isLoading || !nutrition) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D2FF00" />
      </View>
    );
  }

  // Calculate totals
  const totalProtein = nutrition.meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = nutrition.meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = nutrition.meals.reduce((sum, m) => sum + m.fat, 0);
  const totalCal = nutrition.meals.reduce((sum, m) => sum + m.calories, 0);
  
  // Goal constants (In a real app, these come from UserProfile goals)
  const goalPro = 150;
  const goalCarbs = 200;
  const goalFat = 70;
  const goalCal = 2400;

  // SVG Calculations (Circumference = 2 * PI * r)
  const calcOffset = (val: number, goal: number, r: number) => {
    const c = 2 * Math.PI * r;
    const percent = Math.min(val / goal, 1);
    return c - (percent * c);
  };

  const proOffset = calcOffset(totalProtein, goalPro, 28);
  const carbOffset = calcOffset(totalCarbs, goalCarbs, 38);
  const fatOffset = calcOffset(totalFat, goalFat, 48);
  const calPercent = Math.min((totalCal / goalCal) * 100, 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>NUTRITION <Text style={{ color: '#D2FF00' }}>TRACKER</Text></Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}><Search size={20} color="#8A8A93" /></View>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search food or scan barcode..."
            placeholderTextColor="#8A8A93"
          />
          <TouchableOpacity style={styles.scanBtn}>
            <ScanLine size={18} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.macroSection}>
        <View style={styles.ringContainer}>
          <Svg height="192" width="192" viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
            {/* Protein (Inner) */}
            <Circle cx="50" cy="50" r="28" fill="transparent" stroke="#16161A" strokeWidth="6" />
            <Circle cx="50" cy="50" r="28" fill="transparent" stroke="#D2FF00" strokeWidth="6" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={proOffset} strokeLinecap="round" />
            
            {/* Carbs (Middle) */}
            <Circle cx="50" cy="50" r="38" fill="transparent" stroke="#16161A" strokeWidth="6" />
            <Circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={carbOffset} strokeLinecap="round" />
            
            {/* Fat (Outer) */}
            <Circle cx="50" cy="50" r="48" fill="transparent" stroke="#16161A" strokeWidth="6" />
            <Circle cx="50" cy="50" r="48" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={fatOffset} strokeLinecap="round" />
          </Svg>
          
          <View style={styles.ringCenterText}>
            <Text style={styles.ringValue}>{totalCal}</Text>
            <Text style={styles.ringLabel}>EATEN</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>CALORIES</Text>
            <Text style={styles.progressStats}>{totalCal} / <Text style={{ color: '#D2FF00' }}>{goalCal}</Text></Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${calPercent}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>MEAL LOG</Text>
        
        <View style={styles.mealsList}>
          {nutrition.meals.map((meal, idx) => (
            <View key={idx} style={styles.mealCard}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                {meal.calories > 0 ? (
                  <Text style={styles.mealMacros}>{meal.protein}P / {meal.carbs}C / {meal.fat}F</Text>
                ) : (
                  <Text style={styles.mealNotLogged}>Not logged yet</Text>
                )}
              </View>
              
              <View style={styles.mealAction}>
                {meal.calories > 0 ? (
                  <Text style={styles.mealCals}>{meal.calories} <Text style={styles.mealCalsLabel}>kcal</Text></Text>
                ) : (
                  <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => router.push({ pathname: '/addMeal', params: { mealName: meal.name } })}
                  >
                    <Plus size={16} color="#D2FF00" strokeWidth={3} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0C0E' },
  scrollContent: { padding: 24, paddingTop: 48 },
  
  header: { marginBottom: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 24, letterSpacing: 1 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16161A', borderRadius: 30, borderWidth: 1, borderColor: '#242429', paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '500' },
  scanBtn: { backgroundColor: '#D2FF00', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  macroSection: { alignItems: 'center', marginBottom: 40 },
  ringContainer: { position: 'relative', width: 192, height: 192, marginBottom: 24, alignItems: 'center', justifyContent: 'center' },
  ringCenterText: { position: 'absolute', alignItems: 'center' },
  ringValue: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  ringLabel: { fontSize: 10, fontWeight: '800', color: '#8A8A93', letterSpacing: 2 },

  progressContainer: { width: '100%', maxWidth: 320 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 12, fontWeight: '800', color: '#8A8A93', letterSpacing: 1 },
  progressStats: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  progressBarBg: { height: 12, backgroundColor: '#16161A', borderRadius: 6, borderWidth: 1, borderColor: '#242429', overflow: 'hidden' },
  progressBarFill: { height: '100%', width: '45%', backgroundColor: '#D2FF00', borderRadius: 6, shadowColor: '#D2FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },

  mealsSection: {},
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#8A8A93', letterSpacing: 1, marginBottom: 16 },
  mealsList: { gap: 12 },
  mealCard: { backgroundColor: '#16161A', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#242429' },
  mealName: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  mealMacros: { fontSize: 12, fontWeight: '600', color: '#8A8A93', letterSpacing: 0.5 },
  mealNotLogged: { fontSize: 12, fontWeight: '500', color: '#8A8A93', fontStyle: 'italic' },
  
  mealAction: { flexDirection: 'row', alignItems: 'center' },
  mealCals: { fontSize: 18, fontWeight: '900', color: '#D2FF00' },
  mealCalsLabel: { fontSize: 12, color: '#8A8A93' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0C0C0E', borderWidth: 1, borderColor: '#242429', alignItems: 'center', justifyContent: 'center' }
});
