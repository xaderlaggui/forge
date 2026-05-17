import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { MeasCardProps } from '../types';
import { useForgeTheme } from "@/hooks/useForgeTheme";

export function MeasurementCard({ label, value, prevValue, onPress }: MeasCardProps) {
    const { T } = useForgeTheme();
    const measS = useMeasS(T);
  const delta = value && prevValue ? +(value - prevValue).toFixed(1) : undefined;
  return (
    <TouchableOpacity style={useMeasS.card} onPress={onPress} activeOpacity={0.75}>
      <Text style={useMeasS.label} maxFontSizeMultiplier={1.2}>{label}</Text>
      <Text style={useMeasS.val} maxFontSizeMultiplier={1.2}>{value ?? '—'}</Text>
      <Text style={useMeasS.unit} maxFontSizeMultiplier={1.2}>inches</Text>
      {delta !== undefined && (
        <View style={[useMeasS.badge, delta < 0 && useMeasS.badgeDown, delta > 0 && useMeasS.badgeUp]}>
          <Text style={[useMeasS.badgeText, delta < 0 && { color: T.colors.green }, delta > 0 && { color: T.colors.red }]} maxFontSizeMultiplier={1.2}>
            {delta > 0 ? '+' : ''}{delta} in
          </Text>
        </View>
      )}
      <View style={useMeasS.row}>
        <Text style={useMeasS.updateText} maxFontSizeMultiplier={1.2}>Update</Text>
        <ChevronRight size={12} color={T.colors.forge} />
      </View>
    </TouchableOpacity>
  );
}

const useMeasS = (T: any) => StyleSheet.create({
          card: {
            width: '48%', backgroundColor: T.colors.bg1,
            borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1, padding: 14,
          },
          label: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t3, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 },
          val: { fontSize: 24, fontWeight: '800', color: T.colors.t1 },
          unit: { fontSize: T.typography.sizes.label, color: T.colors.t2, marginTop: 2 },
          badge: {
            alignSelf: 'flex-start', marginTop: 4,
            paddingHorizontal: 6, paddingVertical: 2, borderRadius: T.radii.full,
            backgroundColor: T.colors.bg2,
          },
          badgeDown: { backgroundColor: T.colors.greenDim },
          badgeUp:   { backgroundColor: T.colors.redDim  },
          badgeText: { fontSize: 9, fontWeight: '700', color: T.colors.t3 },
          row: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 2 },
          updateText: { fontSize: T.typography.sizes.label, color: T.colors.forge, fontWeight: '600' },
        });
