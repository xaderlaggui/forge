import { useForgeTheme } from "@/hooks/useForgeTheme";
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

// Card padding (16px each side) + page margin (16px each side)
const SCREEN_W = Dimensions.get('window').width;
const PAGE_MARGIN = 32;  // marginHorizontal: 16 each side
const CARD_PAD = 32;  // padding: 16 each side
const GIFTED_LEFT = 0;   // yAxisLabelWidth override = 0
const CHART_W = SCREEN_W - PAGE_MARGIN - CARD_PAD - 2; // -2 for border

const BAR_SPACING = 8;
const NUM_BARS = 7;
const BAR_W = Math.floor((CHART_W - BAR_SPACING * (NUM_BARS - 1)) / NUM_BARS);

// Calendar constants
const CAL_GAP = 4;
const CELL_SIZE = Math.floor((CHART_W - CAL_GAP * 6) / 7); // 7 columns, 6 gaps

interface DayData {
  value: number;
  label: string;
  date: string;
  isToday?: boolean;
  active?: boolean;
  dayName?: string;
}

interface VolumeChartProps {
  volumeLineData: DayData[];
  weeklyVolumeData: DayData[];
  monthlyVolumeData: DayData[];
  currentVolume: number;
  volumeDiff: number;
  minVol: number;
  maxVol: number;
  timeframe: '1W' | '1M';
  setTimeframe: (t: '1W' | '1M') => void;
}

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function VolumeChart({
  weeklyVolumeData, monthlyVolumeData,
  currentVolume, volumeDiff,
  maxVol, timeframe, setTimeframe,
}: VolumeChartProps) {
  const { T } = useForgeTheme();
  const s = useS(T);
  const isUp = volumeDiff >= 0;

  // ── Weekly: 7-bar chart, fits container exactly ──────────────────────────
  const renderWeekly = () => (
    <View style={{ marginTop: 17, left: -6 }}>
      <BarChart
        data={weeklyVolumeData.map(d => ({
          value: d.value,
          label: d.label,
          frontColor: (d as any).isFuture
            ? T.colors.bg3 + '60'
            : d.isToday
              ? T.colors.forge
              : d.value > 0
                ? T.colors.forge + '88'
                : T.colors.bg3,
          topLabelComponent: () =>
            d.value > 0 ? (
              <Text style={{ color: T.colors.t3, fontSize: 8, marginBottom: 2, fontWeight: '600' }}>
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
              </Text>
            ) : null,
        }))}
        barWidth={BAR_W}
        spacing={BAR_SPACING}
        roundedTop
        roundedBottom
        hideRules
        disableScroll
        yAxisLabelWidth={0}
        xAxisThickness={0}
        yAxisThickness={0}
        hideYAxisText
        xAxisLabelTextStyle={{ color: T.colors.t3, fontSize: 11, fontWeight: '700' }}
        noOfSections={3}
        maxValue={maxVol > 0 ? maxVol * 1.3 : 100}
        height={130}
        width={CHART_W}
      />
      <View style={s.legend}>
        <View style={[s.legendDot, { backgroundColor: T.colors.forge }]} />
        <Text style={s.legendLabel}>Today</Text>
        <View style={[s.legendDot, { backgroundColor: T.colors.forge + '88', marginLeft: 10 }]} />
        <Text style={s.legendLabel}>Trained</Text>
        <View style={[s.legendDot, { backgroundColor: T.colors.bg3, marginLeft: 10 }]} />
        <Text style={s.legendLabel}>Rest</Text>
      </View>
    </View>
  );

  // ── Monthly: calendar grid, no scroll, fixed cell size ───────────────────
  const renderMonthly = () => {
    const firstDOW = monthlyVolumeData.length > 0
      ? new Date(monthlyVolumeData[0].date).getDay()
      : 0;

    const padded: (DayData | null)[] = [
      ...Array(firstDOW).fill(null),
      ...monthlyVolumeData,
    ];
    while (padded.length % 7 !== 0) padded.push(null);

    const weeks: (DayData | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

    return (
      <View style={{ marginTop: 12 }}>
        {/* Day-of-week header */}
        <View style={s.calRow}>
          {DOW_LABELS.map((d, i) => (
            <View key={i} style={[s.calCell, { height: 18 }]}>
              <Text style={s.calDOW}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar weeks */}
        {weeks.map((week, wi) => (
          <View key={wi} style={[s.calRow, { marginTop: CAL_GAP }]}>
            {week.map((day, di) =>
              !day ? (
                <View key={di} style={s.calCell} />
              ) : (
                <View
                  key={di}
                  style={[
                    s.calCell,
                    s.calCellBase,
                    day.value > 0 && s.calCellActive,
                    day.isToday && s.calCellToday,
                  ]}
                >
                  <Text style={[
                    s.calNum,
                    day.value > 0 && { color: '#fff', fontWeight: '700' },
                    day.isToday && { color: '#000', fontWeight: '800' },
                  ]}>
                    {day.label}
                  </Text>
                </View>
              )
            )}
          </View>
        ))}

        <View style={[s.legend, { marginTop: 10 }]}>
          <View style={[s.legendDot, { backgroundColor: T.colors.forge }]} />
          <Text style={s.legendLabel}>Trained</Text>
          <View style={[s.legendDot, { backgroundColor: T.colors.forge, marginLeft: 10, borderWidth: 1.5, borderColor: '#fff' }]} />
          <Text style={s.legendLabel}>Today</Text>
          <View style={[s.legendDot, { backgroundColor: T.colors.bg3, marginLeft: 10 }]} />
          <Text style={s.legendLabel}>No session</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.section}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Progressive Overload</Text>
      <View style={s.chartCard}>

        {/* Header */}
        <View style={s.chartHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.chartTitle} maxFontSizeMultiplier={1.2}>Total Volume</Text>
            <Text style={s.chartSub} maxFontSizeMultiplier={1.2}>
              {currentVolume > 0
                ? `${currentVolume.toLocaleString()} lbs today`
                : 'No session today'}
            </Text>
          </View>
          <View style={[s.deltaBadge, isUp ? s.deltaBadgeUp : s.deltaBadgeDown]}>
            {isUp
              ? <TrendingUp size={12} color={T.colors.forge} />
              : <TrendingDown size={12} color={T.colors.t3} />}
            <Text style={[s.deltaBadgeText, { color: isUp ? T.colors.forge : T.colors.t3 }]}>
              {isUp ? '+' : ''}{volumeDiff.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Timeframe toggle */}
        <View style={s.toggle}>
          {(['1W', '1M'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[s.toggleBtn, timeframe === t && s.toggleBtnActive]}
              onPress={() => setTimeframe(t)}
            >
              <Text style={[s.toggleText, timeframe === t && s.toggleTextActive]}>
                {t === '1W' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {timeframe === '1W' ? renderWeekly() : renderMonthly()}
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: T.spacing.px3,
  },
  chartCard: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.xl,
    borderWidth: 0.5, borderColor: T.colors.b1,
    padding: CARD_PAD / 2, // 16px
    overflow: 'hidden',
  },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  chartTitle: { fontSize: T.typography.sizes.body, fontWeight: '700', color: T.colors.t1, marginBottom: 2 },
  chartSub: { fontSize: 12, color: T.colors.t3 },

  deltaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: T.radii.full, borderWidth: 0.5, borderColor: T.colors.b1,
  },
  deltaBadgeUp: { backgroundColor: T.colors.forgeDim, borderColor: 'transparent' },
  deltaBadgeDown: { backgroundColor: T.colors.bg2 },
  deltaBadgeText: { fontSize: T.typography.sizes.label, fontWeight: '700' },

  toggle: {
    flexDirection: 'row', backgroundColor: T.colors.bg2,
    borderRadius: T.radii.md, padding: 3,
    marginTop: 14, alignSelf: 'flex-start',
  },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: T.radii.sm },
  toggleBtnActive: { backgroundColor: T.colors.forge },
  toggleText: { fontSize: 12, fontWeight: '700', color: T.colors.t3 },
  toggleTextActive: { color: '#000' },

  legend: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end' },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, color: T.colors.t3, fontWeight: '600' },

  // Calendar
  calRow: { flexDirection: 'row', gap: CAL_GAP },
  calCell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  calCellBase: {
    borderRadius: 6,
    backgroundColor: T.colors.bg2,
  },
  calCellActive: {
    backgroundColor: T.colors.forge,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 2,
  },
  calCellToday: {
    backgroundColor: T.colors.forge,
    borderWidth: 2, borderColor: '#fff',
  },
  calDOW: { fontSize: 10, fontWeight: '700', color: T.colors.t3 },
  calNum: { fontSize: 11, fontWeight: '500', color: T.colors.t2 },
});
