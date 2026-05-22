import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface ConsistencyHeatmapProps {
  activityDates: string[]; // array of dates 'YYYY-MM-DD'
}

export function ConsistencyHeatmap({ activityDates }: ConsistencyHeatmapProps) {
  const { T } = useForgeTheme();
  const s = useStyles(T);

  // Generate last 28 days (4 weeks)
  const WEEKS = 4;
  const DAYS_PER_WEEK = 7;
  const today = dayjs();
  
  // We want to generate a 4x7 grid. The very last cell (bottom right) is today.
  // Actually, standard heatmaps flow left to right, top to bottom.
  // Let's just create an array of 28 days ending on today.
  const days: { date: string; active: boolean }[] = [];
  for (let i = WEEKS * DAYS_PER_WEEK - 1; i >= 0; i--) {
    const d = today.subtract(i, 'day').format('YYYY-MM-DD');
    days.push({
      date: d,
      active: activityDates.includes(d),
    });
  }

  // Chunk into weeks
  const weeks = [];
  for (let i = 0; i < WEEKS; i++) {
    weeks.push(days.slice(i * DAYS_PER_WEEK, (i + 1) * DAYS_PER_WEEK));
  }

  return (
    <View style={s.section}>
      <Text style={s.sectionLabel}>CONSISTENCY</Text>
      <View style={s.card}>
        <View style={s.grid}>
          {weeks.map((week, wIdx) => (
            <View key={`w-${wIdx}`} style={s.row}>
              {week.map((day, dIdx) => (
                <View 
                  key={`d-${wIdx}-${dIdx}`} 
                  style={[
                    s.cell,
                    day.active ? s.cellActive : s.cellInactive
                  ]} 
                />
              ))}
            </View>
          ))}
        </View>
        <View style={s.legend}>
          <Text style={s.legendText}>Less</Text>
          <View style={s.legendRow}>
            <View style={[s.cell, s.cellInactive, { width: 12, height: 12 }]} />
            <View style={[s.cell, s.cellActive, { width: 12, height: 12, opacity: 0.5 }]} />
            <View style={[s.cell, s.cellActive, { width: 12, height: 12 }]} />
          </View>
          <Text style={s.legendText}>More</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: T.spacing.px3,
  },
  card: {
    backgroundColor: T.colors.bg1, ...T.shadows.lift, borderRadius: T.radii.xl, borderWidth: 0.5,
    borderColor: T.colors.b1, padding: T.spacing.px5, alignItems: 'center'
  },
  grid: {
    flexDirection: 'column', gap: 6,
  },
  row: {
    flexDirection: 'row', gap: 6,
  },
  cell: {
    width: 28, height: 28, borderRadius: 6,
  },
  cellInactive: {
    backgroundColor: 'rgba(255,92,46,0.05)',
  },
  cellActive: {
    backgroundColor: T.colors.forge,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  legend: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, alignSelf: 'flex-end',
  },
  legendRow: { flexDirection: 'row', gap: 4 },
  legendText: { fontSize: 10, color: T.colors.t3, fontWeight: '600' },
});
