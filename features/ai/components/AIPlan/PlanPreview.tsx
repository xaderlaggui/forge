import { Check, ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { WeeklyCalendar } from '../../../../features/planner/components/WeeklyCalendar';
import { GeneratedPlan } from '../../../../services/GeneratorEngine';
import { CoachMessageCard } from './CoachMessageCard';

export function PlanPreview({ plan, onApply, onSaveDraft, isApplying, isSavingDraft, T }: {
  plan: GeneratedPlan;
  onApply: () => void;
  onSaveDraft: () => void;
  isApplying: boolean;
  isSavingDraft: boolean;
  T: any;
}) {
  const isWeekly = Array.isArray(plan.mealPlan.days) && plan.mealPlan.days.length > 0;

  // Generate 7 days starting from Monday
  const weekDays = React.useMemo(() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const todayPH = new Date(utc + (3600000 * 8)); // UTC+8

    const dayOfWeek = todayPH.getDay();
    const currentIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6

    const startOfWeek = new Date(todayPH);
    startOfWeek.setDate(todayPH.getDate() - currentIdx);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
      const fullName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i];
      return { label, fullName, date: d.getDate(), fullDate: `${year}-${month}-${date}` };
    });
  }, []);

  const [selectedDayIdx, setSelectedDayIdx] = React.useState(() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const todayPH = new Date(utc + (3600000 * 8));
    const dayOfWeek = todayPH.getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  });

  const selectedDayName = weekDays[selectedDayIdx].fullName;
  const currentDay = isWeekly
    ? plan.mealPlan.days.find((d: any) => d.dayOfWeek === selectedDayName)
    : { dayOfWeek: 'Preview', meals: plan.mealPlan.meals };

  return (
    <View style={{ flex: 1 }}>
      {/* Header matching Weekly Meal Plan */}
      <View style={{
        flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
        paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16,
        backgroundColor: T.colors.bg1, ...T.shadows.lift, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
      }}>
        <TouchableOpacity
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}
          onPress={onSaveDraft}
          disabled={isSavingDraft || isApplying}
        >
          {isSavingDraft ? <ActivityIndicator color={T.colors.t1} /> : <ChevronLeft size={28} color={T.colors.t1} />}
        </TouchableOpacity>

        <View style={{ alignItems: 'center', paddingBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: T.colors.t1 }}>Generated Plan</Text>
        </View>

        <TouchableOpacity
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: -8 }}
          onPress={onApply}
          disabled={isApplying || isSavingDraft}
        >
          {isApplying ? <ActivityIndicator color={T.colors.forge} /> : <Check size={28} color={T.colors.forge} />}
        </TouchableOpacity>
      </View>

      {isWeekly && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <WeeklyCalendar
            days={weekDays}
            activeDayIdx={selectedDayIdx}
            onSelectDay={setSelectedDayIdx}
          />
          <Text style={{ fontSize: 14, color: T.colors.t2, marginBottom: 10, fontWeight: '600' }}>
            Targets: {plan.mealPlan.targetCalories} kcal • {plan.mealPlan.targetProtein}g P • {plan.mealPlan.targetCarbs}g C • {plan.mealPlan.targetFat}g F
          </Text>
        </View>

      )}

      <ScrollView contentContainerStyle={{ padding: 16, }} showsVerticalScrollIndicator={false}>

        {(currentDay?.meals || []).map((meal: any, i: number) => (
          <View
            key={i}
            style={{
              backgroundColor: T.colors.bg1, ...T.shadows.lift, borderRadius: 14,
              padding: 16, borderWidth: 0.5, borderColor: T.colors.b1,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              marginBottom: 12,
            }}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 10,
              backgroundColor: T.colors.forgeDim,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: 11, fontWeight: '800', letterSpacing: 0.5,
                color: T.colors.forge,
              }}>{meal.name.substring(0, 3).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: T.colors.t1 }}>{meal.name}</Text>
              <Text style={{ fontSize: 13, color: T.colors.t2, marginTop: 2, lineHeight: 18 }}>
                {meal.description}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: T.colors.t3, marginTop: 4 }}>
                {meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
              </Text>
            </View>
          </View>
        ))}

        {plan.coachMessage && (
          <CoachMessageCard message={plan.coachMessage} T={T} />
        )}

      </ScrollView>
    </View>
  );
}
