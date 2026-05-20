import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface QuickStatsRowProps {
  volumeLbs: number;
  volumeChangePct: number;
  streak: number;
  workoutsThisWeek: number;
}

export function QuickStatsRow({ volumeLbs, volumeChangePct, streak, workoutsThisWeek }: QuickStatsRowProps) {
  const { T } = useForgeTheme();
  const s = useStyles(T);

  // Format volume (e.g. 142k)
  const formatVol = (vol: number) => {
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'k';
    return vol.toString();
  };

  const renderPctChange = () => {
    if (volumeChangePct > 0) {
      return <Text style={[s.sub, { color: T.colors.green }]}>+{volumeChangePct}%</Text>;
    }
    if (volumeChangePct < 0) {
      return <Text style={[s.sub, { color: T.colors.red }]}>{volumeChangePct}%</Text>;
    }
    return <Text style={[s.sub, { color: T.colors.t3 }]}>0%</Text>;
  };

  return (
    <View style={s.container}>
      <View style={s.statCard}>
        <Text style={s.label}>VOLUME</Text>
        <Text style={s.value}>{formatVol(volumeLbs)}</Text>
        {renderPctChange()}
      </View>
      <View style={s.statCard}>
        <Text style={s.label}>STREAK</Text>
        <Text style={s.value}>{streak}</Text>
        <Text style={[s.sub, { color: T.colors.forge }]}>Days</Text>
      </View>
      <View style={s.statCard}>
        <Text style={s.label}>THIS WEEK</Text>
        <Text style={s.value}>{workoutsThisWeek}</Text>
        <Text style={[s.sub, { color: T.colors.t3 }]}>Sessions</Text>
      </View>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: T.spacing.page,
    marginBottom: T.spacing.px5,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: T.colors.bg1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: T.colors.b1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: T.colors.t3,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    color: T.colors.t1,
  },
  sub: {
    fontSize: 10,
    fontWeight: '700',
  },
});
