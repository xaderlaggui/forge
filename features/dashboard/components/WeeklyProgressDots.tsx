import { useForgeTheme } from "@/hooks/useForgeTheme";
import { Check, Flame, Play } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WeeklyProgressDotsProps {
  weekActivity: boolean[]; // Array of 7 booleans (Mon-Sun), true if worked out
  streak: number;
  restDayIndices?: number[]; // 0=Mon, 6=Sun
}

export function WeeklyProgressDots({ weekActivity, streak, restDayIndices = [] }: WeeklyProgressDotsProps) {
  const { T } = useForgeTheme();
  const s = useStyles(T);

  const { weekDates, todayIdx } = useMemo(() => {
    // Get current date in Manila time (Philippine Time) safely without toLocaleString
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const todayPH = new Date(utc + (3600000 * 8)); // UTC+8

    const dayOfWeek = todayPH.getDay();
    const currentIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(todayPH);
    startOfWeek.setDate(todayPH.getDate() - currentIdx);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }

    return { weekDates: dates, todayIdx: currentIdx };
  }, []);

  const restSet = new Set(restDayIndices);

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
          const isRest = restSet.has(idx);
          const isFuture = idx > todayIdx;
          const dateNum = dateObj.getDate();
          const dayLabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx];

          // Determine pill style
          let pillStyle: any[] = [s.dayPill];
          if (isToday) pillStyle.push(s.dayPillToday);
          else if (isDone) pillStyle.push(s.dayPillDone);
          else if (isRest && !isFuture) pillStyle.push(s.dayPillRest);

          // Determine text colors
          const labelColor = isToday ? T.colors.bg0
            : isRest && !isDone ? '#6B8EBF'
              : T.colors.t3;
          const dateColor = isToday ? T.colors.bg0
            : isDone ? T.colors.forge
              : isRest && !isFuture ? '#6B8EBF'
                : T.colors.t1;

          return (
            <View key={idx} style={pillStyle}>
              <Text style={[s.dayLabel, { color: labelColor }]}>
                {dayLabel}
              </Text>

              <Text style={[s.dateNum, { color: dateColor }]}>
                {dateNum}
              </Text>

              <View style={s.iconWrapper}>
                {isDone ? (
                  <Check size={14} color={isToday ? T.colors.bg0 : T.colors.forge} strokeWidth={3} />
                ) : isRest && !isFuture ? (
                  // Rest day icon — moon/pause symbol using a small styled view
                  <View style={s.restDot} />
                ) : isToday ? (
                  <Play size={14} color={T.colors.bg0} fill={T.colors.bg0} style={{ marginLeft: 2 }} />
                ) : (
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
    paddingVertical: 5,
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
  dayPillRest: {
    backgroundColor: 'rgba(107, 142, 191, 0.12)',
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
  restDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B8EBF',
  },
});
