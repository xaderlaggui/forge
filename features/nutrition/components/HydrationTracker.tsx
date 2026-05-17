import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Droplets, Plus } from 'lucide-react-native';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { DailyAggregates } from '../types';

interface HydrationTrackerProps {
  aggregates: DailyAggregates;
  waterMl: number;
  updateNutrition?: (data: any) => Promise<void>;
}

export function HydrationTracker({ aggregates, waterMl, updateNutrition }: HydrationTrackerProps) {
  const { waterLiters, goalWater } = aggregates;
  const [isUpdating, setIsUpdating] = useState(false);

  const addWater = async (amountMl: number) => {
    if (!updateNutrition) return;
    setIsUpdating(true);
    try {
      await updateNutrition({ waterMl: waterMl + amountMl });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <View style={[s.section, { marginBottom: 0 }]}>
      <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Hydration</Text>
      <View style={s.waterCard}>
        <View style={s.waterLeft}>
          <View style={s.waterIcon}>
            <Droplets size={20} color={T.colors.blue} />
          </View>
          <View>
            <Text style={s.waterVal} maxFontSizeMultiplier={1.2}>{waterLiters.toFixed(1)} L</Text>
            <Text style={s.waterGoal} maxFontSizeMultiplier={1.2}>Goal: {goalWater} L</Text>
          </View>
        </View>
        <View style={s.waterBarWrap}>
          <View style={s.waterBarTrack}>
            <View
              style={[
                s.waterBarFill,
                { width: `${Math.min((waterLiters / goalWater) * 100, 100)}%` },
              ]}
            />
          </View>
          <View style={s.waterDots}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={[
                  s.waterDot,
                  i < Math.round((waterLiters / goalWater) * 8) && s.waterDotFilled,
                ]}
              />
            ))}
          </View>
        </View>
        
        {updateNutrition && (
          <View style={s.waterActions}>
            <TouchableOpacity style={s.waterBtn} onPress={() => addWater(250)} disabled={isUpdating}>
              <Plus size={14} color={T.colors.blue} />
              <Text style={s.waterBtnText}>Glass (250ml)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.waterBtn} onPress={() => addWater(500)} disabled={isUpdating}>
              <Plus size={14} color={T.colors.blue} />
              <Text style={s.waterBtnText}>Bottle (500ml)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: T.spacing.px2,
  },
  waterCard: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1,
    padding: T.spacing.px4, gap: 14,
  },
  waterLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waterIcon: {
    width: 40, height: 40, borderRadius: T.radii.md,
    backgroundColor: T.colors.blueDim,
    alignItems: 'center', justifyContent: 'center',
  },
  waterVal: { fontSize: T.typography.sizes.h2, fontWeight: '700', color: T.colors.t1 },
  waterGoal: { fontSize: T.typography.sizes.label, color: T.colors.t3, marginTop: 1 },
  waterBarWrap: { gap: 8 },
  waterBarTrack: { height: 6, backgroundColor: T.colors.bg3, borderRadius: T.radii.sm, overflow: 'hidden' },
  waterBarFill: { height: 6, backgroundColor: T.colors.blue, borderRadius: T.radii.sm },
  waterDots: { flexDirection: 'row', gap: 6 },
  waterDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.colors.bg3 },
  waterDotFilled: { backgroundColor: T.colors.blue },
  
  waterActions: { flexDirection: 'row', gap: 10, marginTop: 4, borderTopWidth: 0.5, borderTopColor: T.colors.b1, paddingTop: 14 },
  waterBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: T.colors.blueDim, paddingVertical: 10, borderRadius: T.radii.md,
  },
  waterBtnText: { color: T.colors.blue, fontSize: 13, fontWeight: '700' },
});
