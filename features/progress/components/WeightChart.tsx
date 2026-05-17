import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";

const SCREEN_W = Dimensions.get('window').width;
const TIMEFRAMES = ['7D', '1M', '3M', 'YTD'];

interface WeightChartProps {
  timeframe: string;
  setTimeframe: (tf: string) => void;
  weightDiff: number;
  lineData: { value: number; label: string }[];
  minVal: number;
  maxVal: number;
}

export function WeightChart({
  timeframe, setTimeframe, weightDiff, lineData, minVal, maxVal
}: WeightChartProps) {
    const { T } = useForgeTheme();
    const s = useS(T);
  return (
    <View style={useS.section}>
      {/* Timeframe pills */}
      <View style={useS.tfRow}>
        {TIMEFRAMES.map(tf => (
          <TouchableOpacity
            key={tf}
            style={[useS.tfPill, timeframe === tf && useS.tfPillActive]}
            onPress={() => setTimeframe(tf)}
          >
            <Text style={[useS.tfText, timeframe === tf && useS.tfTextActive]} maxFontSizeMultiplier={1.2}>{tf}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={useS.chartCard}>
        <View style={useS.chartHeader}>
          <Text style={useS.chartTitle} maxFontSizeMultiplier={1.2}>Weight Trend</Text>
          <View style={[useS.deltaBadge, weightDiff <= 0 ? useS.deltaBadgeDown : useS.deltaBadgeUp]}>
            {weightDiff <= 0 ? <TrendingDown size={12} color={T.colors.green} /> : <TrendingUp size={12} color={T.colors.red} />}
            <Text style={[useS.deltaBadgeText, weightDiff <= 0 ? { color: T.colors.green } : { color: T.colors.red }]} maxFontSizeMultiplier={1.2}>
              {weightDiff > 0 ? '+' : ''}{weightDiff} lbs
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
            hideRules
            yAxisOffset={minVal - 5}
            maxValue={maxVal - minVal + 10}
            noOfSections={4}
            stepValue={Math.ceil((maxVal - minVal) / 4)}
            height={140}
            width={SCREEN_W - 72}
          />
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
          deltaBadgeUp:   { backgroundColor: T.colors.redDim  },
          deltaBadgeText: { fontSize: T.typography.sizes.label, fontWeight: '700' },
        });
