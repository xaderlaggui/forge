import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { Check, Flame, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface WeeklyProgressDotsProps {
  weekActivity: boolean[]; // Array of 7 booleans (Mon-Sun), true if worked out
  streak: number;
}

export function WeeklyProgressDots({ weekActivity, streak }: WeeklyProgressDotsProps) {
  const { T } = useForgeTheme();
  const s = useStyles(T);
  const router = useRouter();

  const { weekDates, todayIdx } = useMemo(() => {
    // 1. Get current date in Manila time (Philippine Time) safely without toLocaleString
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const todayPH = new Date(utc + (3600000 * 8)); // UTC+8
    
    // 2. Determine day index (0 = Mon, 6 = Sun)
    const dayOfWeek = todayPH.getDay();
    const currentIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // 3. Find the Monday of this week
    const startOfWeek = new Date(todayPH);
    startOfWeek.setDate(todayPH.getDate() - currentIdx);

    // 4. Generate all 7 dates for the week
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    
    return { weekDates: dates, todayIdx: currentIdx };
  }, []);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>THIS WEEK</Text>
        <View style={s.streakRow}>
          <Text style={s.streak}>{streak} Day Streak</Text>
          <Flame size={14} color={T.colors.forge} />
        </View>
      </View>
      
      <View style={s.card}>
        {weekDates.map((dateObj, idx) => {
          const isDone = weekActivity[idx];
          const isToday = idx === todayIdx;
          const dateNum = dateObj.getDate();
          const dayLabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx];

          return (
            <View 
              key={idx} 
              style={[
                s.dayPill, 
                isToday && s.dayPillToday,
                isDone && !isToday && s.dayPillDone
              ]}
            >
              <Text style={[
                s.dayLabel, 
                isToday ? { color: T.colors.bg0 } : { color: T.colors.t3 }
              ]}>
                {dayLabel}
              </Text>
              
              <Text style={[
                s.dateNum,
                isToday ? { color: T.colors.bg0 } : (isDone ? { color: T.colors.forge } : { color: T.colors.t1 })
              ]}>
                {dateNum}
              </Text>

              <View style={s.iconWrapper}>
                {isDone ? (
                  // Show checkmark if completed (white if it's today, otherwise forge orange)
                  <Check size={14} color={isToday ? T.colors.bg0 : T.colors.forge} strokeWidth={3} />
                ) : isToday ? (
                  // Show play button if it's today and not done
                  <Play size={14} color={T.colors.bg0} fill={T.colors.bg0} style={{ marginLeft: 2 }} />
                ) : (
                  // Show small dot for past/future days
                  <View style={s.dotEmpty} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: {
    paddingHorizontal: T.spacing.page,
    marginBottom: T.spacing.px5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: T.colors.t3,
    letterSpacing: 0.8,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streak: {
    fontSize: 12,
    fontWeight: '700',
    color: T.colors.forge,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: T.colors.bg1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: T.colors.b1,
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: 40,
    borderRadius: 20,
    gap: 4,
  },
  dayPillToday: {
    backgroundColor: T.colors.forge,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dayPillDone: {
    backgroundColor: 'rgba(255, 92, 46, 0.08)', 
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  iconWrapper: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dotEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.colors.bg2,
  },
});
