import { useForgeTheme } from "@/hooks/useForgeTheme";
import { Minus, TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatCardProps } from '../types';

export function StatCard({ label, value, unit, delta, subText, valueColor, Icon, onPress, userGoal }: StatCardProps) {
  const { T } = useForgeTheme();
  const sc = useSc(T);
  const isDown = delta !== undefined && delta < 0;
  const isUp = delta !== undefined && delta > 0;

  let badgeColor = T.colors.t3;
  let badgeBg = T.colors.bg2;

  if (isDown) {
    if (userGoal === 'bulk') { badgeColor = T.colors.red; badgeBg = T.colors.redDim; }
    else { badgeColor = T.colors.green; badgeBg = T.colors.greenDim; }
  } else if (isUp) {
    if (userGoal === 'bulk') { badgeColor = T.colors.green; badgeBg = T.colors.greenDim; }
    else { badgeColor = T.colors.red; badgeBg = T.colors.redDim; }
  }

  return (
    <TouchableOpacity style={sc.card} onPress={onPress} activeOpacity={0.75}>
      <Text style={sc.label} maxFontSizeMultiplier={1.2}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
        <Text style={sc.value} maxFontSizeMultiplier={1.2}>{value}</Text>
        {unit && <Text style={sc.unit} maxFontSizeMultiplier={1.2}>{unit}</Text>}
      </View>
      {delta !== undefined && (
        <View style={[sc.badge, { backgroundColor: badgeBg }]}>
          {isDown ? <TrendingDown size={10} color={badgeColor} /> : isUp ? <TrendingUp size={10} color={badgeColor} /> : <Minus size={10} color={T.colors.t3} />}
          <Text style={[sc.badgeText, { color: badgeColor }]} maxFontSizeMultiplier={1.2}>
            {Math.abs(delta)} lbs
          </Text>
        </View>
      )}
      {subText !== undefined && (
        <View style={[sc.categoryBadge, { backgroundColor: (valueColor || T.colors.t3) + '22', borderColor: (valueColor || T.colors.t3) + '55', gap: Icon ? 4 : 0 }]}>
          {Icon && <Icon size={11} color={valueColor || T.colors.t3} />}
          <Text style={[sc.categoryText, { color: valueColor || T.colors.t2 }]} maxFontSizeMultiplier={1.2}>{subText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const useSc = (T: any) => StyleSheet.create({
  card: {
    flex: 1, backgroundColor: T.colors.bg1, ...T.shadows.lift,
    borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1, padding: 14,
    alignItems: 'center',
  },
  label: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t3, textTransform: 'uppercase', letterSpacing: 0.7, textAlign: 'center' },
  value: { fontSize: 22, fontWeight: '800', color: T.colors.t1 },
  unit: { fontSize: T.typography.sizes.bodyS, color: T.colors.t2, fontWeight: '500' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6,
    alignSelf: 'center',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: T.radii.full,
  },
  badgeText: { fontSize: T.typography.sizes.caption, fontWeight: '700' },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 6,
    alignSelf: 'center',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: T.radii.full,
  },
  categoryText: { fontSize: T.typography.sizes.caption, fontWeight: '700', },
});
