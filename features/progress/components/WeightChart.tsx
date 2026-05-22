import { useForgeTheme } from "@/hooks/useForgeTheme";
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const SCREEN_W = Dimensions.get('window').width;
const TIMEFRAMES = ['7D', '1M', '3M', 'YTD'];

interface WeightChartProps {
  timeframe: string;
  setTimeframe: (tf: string) => void;
  weightDiff: number;
  lineData: { value: number; label: string }[];
  minVal: number;
  maxVal: number;
  weightUnit?: string;
}

export function WeightChart({
  timeframe, setTimeframe, weightDiff, lineData, minVal, maxVal, weightUnit = 'kg'
}: WeightChartProps) {
  const { T } = useForgeTheme();
  const s = useS(T);

  // Calculate clean Y-axis parameters
  let yAxisOffset = 0;
  let stepValue = 5;
  let noOfSections = 4;

  if (minVal === maxVal) {
    // Constant weight case (e.g., 200 unit)
    stepValue = 5;
    noOfSections = 4;
    yAxisOffset = minVal - 8; // Center it: 2 sections below, 2 sections above (e.g., 192, 196, 200, 204, 208)
  } else {
    const diff = maxVal - minVal;

    // Choose a clean step value
    if (diff <= 4) {
      stepValue = 1;
    } else if (diff <= 8) {
      stepValue = 2;
    } else if (diff <= 16) {
      stepValue = 4;
    } else if (diff <= 25) {
      stepValue = 5;
    } else if (diff <= 50) {
      stepValue = 10;
    } else {
      stepValue = Math.ceil(diff / 4);
    }

    // Floor the yAxisOffset to a multiple of stepValue for clean labels
    yAxisOffset = Math.floor((minVal - 2) / stepValue) * stepValue;

    // Calculate sections needed to cover maxVal
    const neededSections = Math.ceil((maxVal + 2 - yAxisOffset) / stepValue);
    noOfSections = Math.max(3, neededSections);
  }

  const maxValueRange = stepValue * noOfSections;

  return (
    <View style={s.section}>
      {/* Timeframe pills */}
      <View style={s.tfRow}>
        {TIMEFRAMES.map(tf => (
          <TouchableOpacity
            key={tf}
            style={[s.tfPill, timeframe === tf && s.tfPillActive]}
            onPress={() => setTimeframe(tf)}
          >
            <Text style={[s.tfText, timeframe === tf && s.tfTextActive]} maxFontSizeMultiplier={1.2}>{tf}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ position: 'relative', overflow: 'visible', ...T.shadows.lift }}>
        <View style={s.chartCard}>
          <View style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: T.colors.forgeDim }} />

          <View style={s.chartHeader}>
            <Text style={s.chartTitle} maxFontSizeMultiplier={1.2}>Weight Trend ({weightUnit})</Text>
            <View style={[s.deltaBadge, weightDiff <= 0 ? s.deltaBadgeDown : s.deltaBadgeUp]}>
              {weightDiff <= 0 ? <TrendingDown size={12} color={T.colors.green} /> : <TrendingUp size={12} color={T.colors.red} />}
              <Text style={[s.deltaBadgeText, weightDiff <= 0 ? { color: T.colors.green } : { color: T.colors.red }]} maxFontSizeMultiplier={1.2}>
                {weightDiff > 0 ? '+' : ''}{weightDiff} {weightUnit}
              </Text>
            </View>
          </View>
          <View style={{ marginLeft: -16, marginRight: -4 }}>
            <LineChart
              data={lineData}
              areaChart
              hideDataPoints
              color={T.colors.forge}
              thickness={2.5}
              startFillColor={T.colors.forge}
              endFillColor={T.colors.forge}
              startOpacity={0.18}
              endOpacity={0}
              xAxisColor={T.colors.b1}
              yAxisColor="transparent"
              yAxisTextStyle={{ color: T.colors.t3, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: T.colors.t3, fontSize: 10 }}
              curved
              rulesType="solid"
              rulesColor={T.colors.b1}
              yAxisOffset={yAxisOffset}
              maxValue={maxValueRange}
              noOfSections={noOfSections}
              stepValue={stepValue}
              height={140}
              width={SCREEN_W - 72}
              spacing={Math.max(2, (SCREEN_W - 105) / (lineData.length - 1 || 1))}
              disableScroll
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  tfRow: { flexDirection: 'row', gap: 6, marginBottom: T.spacing.px3 },
  tfPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: T.radii.full, backgroundColor: T.colors.bg2 },
  tfPillActive: { backgroundColor: T.colors.forge },
  tfText: { fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3 },
  tfTextActive: { color: '#fff' },

  chartCard: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.xl, borderWidth: 0.5,
    borderColor: T.colors.b1, padding: T.spacing.px4, overflow: 'hidden',
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: T.spacing.px3 },
  chartTitle: { fontSize: T.typography.sizes.body, fontWeight: '600', color: T.colors.t1 },
  deltaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: T.radii.full, backgroundColor: T.colors.bg2,
  },
  deltaBadgeDown: { backgroundColor: T.colors.greenDim },
  deltaBadgeUp: { backgroundColor: T.colors.redDim },
  deltaBadgeText: { fontSize: T.typography.sizes.label, fontWeight: '700' },
});
