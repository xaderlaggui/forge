import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Body from 'react-native-body-highlighter';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { ChevronRight } from 'lucide-react-native';

interface BodyMeasurementsCardProps {
  latest: any;
  prev: any;
  onPressDetail: () => void;
}

export function BodyMeasurementsCard({ latest, prev, onPressDetail }: BodyMeasurementsCardProps) {
  const { T } = useForgeTheme();
  const s = useS(T);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const getHeatmapData = (): any[] => {
    if (selectedPart === 'Chest') {
      return [{ slug: 'chest', intensity: 2 }];
    }
    if (selectedPart === 'Waist') {
      return [{ slug: 'abs', intensity: 2 }, { slug: 'obliques', intensity: 2 }];
    }
    if (selectedPart === 'Arms') {
      return [
        { slug: 'biceps', intensity: 2 },
        { slug: 'triceps', intensity: 2 },
        { slug: 'forearm', intensity: 2 }
      ];
    }
    if (selectedPart === 'Legs') {
      return [
        { slug: 'quadriceps', intensity: 2 },
        { slug: 'hamstrings', intensity: 2 },
        { slug: 'calves', intensity: 2 },
        { slug: 'gluteal', intensity: 2 }
      ];
    }
    
    // Default: highlight all tracked parts slightly
    return [
      { slug: 'chest', intensity: 1 },
      { slug: 'abs', intensity: 1 },
      { slug: 'obliques', intensity: 1 },
      { slug: 'biceps', intensity: 1 },
      { slug: 'triceps', intensity: 1 },
      { slug: 'forearm', intensity: 1 },
      { slug: 'quadriceps', intensity: 1 },
      { slug: 'hamstrings', intensity: 1 },
      { slug: 'calves', intensity: 1 },
      { slug: 'gluteal', intensity: 1 },
    ];
  };

  const renderMeasurementRow = (label: string, value: any, prevValue: any) => {
    const isSelected = selectedPart === label;
    const delta = value && prevValue ? +(value - prevValue).toFixed(1) : undefined;
    
    return (
      <TouchableOpacity 
        style={[
          s.rowCard, 
          isSelected && { borderColor: T.colors.forge, backgroundColor: T.colors.bg2 }
        ]} 
        onPress={() => setSelectedPart(isSelected ? null : label)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={[s.rowLabel, isSelected && { color: T.colors.forge }]} maxFontSizeMultiplier={1.2}>
            {label}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={s.rowVal} maxFontSizeMultiplier={1.2}>{value ?? '—'}</Text>
            <Text style={s.rowUnit} maxFontSizeMultiplier={1.2}>in</Text>
          </View>
        </View>
        
        {delta !== undefined ? (
          <View style={[s.badge, delta < 0 ? s.badgeDown : delta > 0 ? s.badgeUp : {}]}>
            <Text style={[s.badgeText, delta < 0 && { color: T.colors.green }, delta > 0 && { color: T.colors.red }]} maxFontSizeMultiplier={1.2}>
              {delta > 0 ? '+' : ''}{delta}
            </Text>
          </View>
        ) : (
          <View style={s.badgeEmpty} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      {/* Body Model Column */}
      <View style={s.bodyCol}>
        <Body 
          data={getHeatmapData()} 
          gender="male" 
          side="front" 
          scale={0.5} 
          colors={['#333', T.colors.forge + '80', T.colors.forge]} 
        />
        <View style={s.bodyOverlay}>
            <Text style={s.bodyOverlayText}>Front</Text>
        </View>
      </View>

      {/* Measurements Column */}
      <View style={s.measCol}>
        {renderMeasurementRow('Chest', latest?.chest, prev?.chest)}
        {renderMeasurementRow('Waist', latest?.waist, prev?.waist)}
        {renderMeasurementRow('Arms', latest?.arms, prev?.arms)}
        {renderMeasurementRow('Legs', latest?.legs, prev?.legs)}
        
        <TouchableOpacity style={s.updateBtn} onPress={onPressDetail}>
          <Text style={s.updateBtnText}>Manage Measurements</Text>
          <ChevronRight size={14} color={T.colors.forge} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: T.colors.bg1,
    borderRadius: T.radii.xl,
    borderWidth: 0.5,
    borderColor: T.colors.b1,
    padding: 16,
    ...T.shadows.lift,
  },
  bodyCol: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderColor: T.colors.b1,
    paddingRight: 10,
    position: 'relative',
  },
  bodyOverlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: T.colors.bg2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bodyOverlayText: {
    fontSize: 10,
    fontWeight: '700',
    color: T.colors.t3,
    textTransform: 'uppercase',
  },
  measCol: {
    width: '60%',
    paddingLeft: 12,
    justifyContent: 'center',
    gap: 8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.colors.bg0,
    borderRadius: T.radii.lg,
    borderWidth: 1,
    borderColor: T.colors.b1,
    padding: 10,
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: T.colors.t3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowVal: {
    fontSize: 20,
    fontWeight: '800',
    color: T.colors.t1,
  },
  rowUnit: {
    fontSize: 12,
    color: T.colors.t3,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: T.radii.md,
    backgroundColor: T.colors.bg2,
  },
  badgeDown: { backgroundColor: T.colors.greenDim },
  badgeUp:   { backgroundColor: T.colors.redDim  },
  badgeText: { fontSize: 11, fontWeight: '800', color: T.colors.t2 },
  badgeEmpty: { width: 30 },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.colors.forgeDim,
    paddingVertical: 10,
    borderRadius: T.radii.md,
    marginTop: 4,
    gap: 4,
  },
  updateBtnText: {
    color: T.colors.forge,
    fontSize: 12,
    fontWeight: '700',
  },
});
