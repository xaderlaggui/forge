import { useForgeTheme } from "@/hooks/useForgeTheme";
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WeeklyCalendarProps {
  days: { label: string; date: number; fullDate: string }[];
  activeDayIdx: number;
  onSelectDay: (idx: number) => void;
}

export function WeeklyCalendar({ days, activeDayIdx, onSelectDay }: WeeklyCalendarProps) {
  const { T } = useForgeTheme();
  const s = useS(T);

  return (
    <View style={s.container}>
      {days.map((day, idx) => {
        const isActive = idx === activeDayIdx;
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => onSelectDay(idx)}
            style={[s.dayCard, isActive && s.dayCardActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.dayLabel, isActive && s.dayLabelActive]} maxFontSizeMultiplier={1.2}>
              {day.label}
            </Text>
            <Text style={[s.dateNum, isActive && s.dayLabelActive]} maxFontSizeMultiplier={1.2}>
              {day.date}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: T.colors.bg1, ...T.shadows.lift,
    padding: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: T.colors.b1,
  },
  dayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: 40,
    borderRadius: 20,
    gap: 4,
  },
  dayCardActive: {
    backgroundColor: T.colors.forge,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: T.colors.t3,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 14,
    fontWeight: '800',
    color: T.colors.t1,
  },
  dayLabelActive: {
    color: '#FFF',
  },
});
