import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react-native';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';

const SCREEN_W = Dimensions.get('window').width;

interface VolumeChartProps {
  volumeLineData: { value: number; label: string }[];
  currentVolume: number;
  volumeDiff: number;
  minVol: number;
  maxVol: number;
}

export function VolumeChart({
  volumeLineData, currentVolume, volumeDiff, minVol, maxVol
}: VolumeChartProps) {
  // If there's no real data yet, don't render an empty chart
  if (volumeLineData.length === 0 || (volumeLineData.length === 1 && volumeLineData[0].label === 'No Data')) {
    return null;
  }

  // Determine delta direction
  const isUp = volumeDiff >= 0;

  return (
    <View style={s.section}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Progressive Overload</Text>
      
      <View style={s.chartCard}>
        <View style={s.chartHeader}>
          <View>
            <Text style={s.chartTitle} maxFontSizeMultiplier={1.2}>Total Volume</Text>
            <Text style={s.chartSub} maxFontSizeMultiplier={1.2}>{currentVolume.toLocaleString()} lbs in latest session</Text>
          </View>
          <View style={[s.deltaBadge, isUp ? s.deltaBadgeUp : s.deltaBadgeDown]}>
            {isUp ? <TrendingUp size={12} color={T.colors.forge} /> : <TrendingDown size={12} color={T.colors.t3} />}
            <Text style={[s.deltaBadgeText, isUp ? { color: T.colors.forge } : { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>
              {isUp ? '+' : ''}{volumeDiff.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={{ marginLeft: -16, marginRight: -4, marginTop: 16 }}>
          <LineChart
            data={volumeLineData}
            areaChart
            hideDataPoints={false}
            dataPointsColor={T.colors.forge}
            dataPointsRadius={3}
            color={T.colors.forge}
            thickness={2.5}
            startFillColor={T.colors.forge}
            endFillColor={T.colors.forge}
            startOpacity={0.25}
            endOpacity={0}
            xAxisColor={T.colors.b1}
            yAxisColor="transparent"
            yAxisTextStyle={{ color: T.colors.t3, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: T.colors.t3, fontSize: 10 }}
            hideRules
            yAxisOffset={Math.max(0, minVol - 500)}
            maxValue={Math.max(maxVol - minVol + 1000, 1000)}
            noOfSections={3}
            stepValue={Math.ceil((maxVol - minVol + 1000) / 3)}
            height={140}
            width={SCREEN_W - 72}
            curved
          />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: T.spacing.px3,
  },
  chartCard: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.xl, borderWidth: 0.5,
    borderColor: T.colors.b1, padding: T.spacing.px4, overflow: 'hidden',
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chartTitle: { fontSize: T.typography.sizes.body, fontWeight: '700', color: T.colors.t1, marginBottom: 2 },
  chartSub:   { fontSize: 12, color: T.colors.t3 },
  
  deltaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: T.radii.full, backgroundColor: T.colors.bg2,
    borderWidth: 0.5, borderColor: T.colors.b1
  },
  deltaBadgeUp:   { backgroundColor: T.colors.forgeDim, borderColor: 'transparent' },
  deltaBadgeDown: { backgroundColor: T.colors.bg2 },
  deltaBadgeText: { fontSize: T.typography.sizes.label, fontWeight: '700' },
});
