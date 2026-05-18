import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { Flame, Droplet } from 'lucide-react-native';

interface MacroDonutRingProps {
  calories: number;
  calorieGoal: number;
  waterLiters: number;
  waterGoal: number;
}

const SingleDonut = ({
  value,
  goal,
  color,
  trackColor,
  icon: Icon,
  unit,
  size = 64
}: {
  value: number;
  goal: number;
  color: string;
  trackColor: string;
  icon: any;
  unit: string;
  size?: number;
}) => {
  const STROKE = 6;
  const R = (size - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const percent = goal > 0 ? Math.min(value / goal, 1) : 0;
  const offset = CIRCUMFERENCE - percent * CIRCUMFERENCE;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Track ring */}
          <Circle
            cx={size / 2} cy={size / 2} r={R}
            stroke={trackColor}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress ring */}
          <Circle
            cx={size / 2} cy={size / 2} r={R}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={StyleSheet.absoluteFillObject as any} pointerEvents="none">
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <View style={{ marginBottom: 1 }}>
              <Icon size={12} color={color} />
            </View>
            <Text style={{ fontSize: 9, fontWeight: '800', color: color, lineHeight: 10 }}>
              {unit === 'L'
                ? (value > 0 ? Number(value).toFixed(1) : '--')
                : (value > 0 ? value : '--')}
            </Text>
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 10, color: '#888', marginTop: 4, fontWeight: '600' }}>{unit}</Text>
    </View>
  );
};

export function MacroDonutRing({ calories, calorieGoal, waterLiters, waterGoal }: MacroDonutRingProps) {
  const { T } = useForgeTheme();
  
  return (
    <View style={styles.wrapper}>
      <SingleDonut
        value={calories}
        goal={calorieGoal}
        color={T.colors.forge}
        trackColor="#2A1A1A"
        icon={Flame}
        unit="kcal"
      />
      <SingleDonut
        value={waterLiters}
        goal={waterGoal}
        color="#0ea5e9"
        trackColor="#082f49"
        icon={Droplet}
        unit="L"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', alignItems: 'center' },
});

