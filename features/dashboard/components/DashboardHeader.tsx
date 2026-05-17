import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { getGreeting, getInitial } from '../utils';

interface DashboardHeaderProps {
  displayName?: string | null;
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <View>
      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <Text style={s.wordmark}>FORGE</Text>
        <View
          style={s.avatar}
          accessibilityLabel={`Profile: ${displayName ?? 'Athlete'}`}
          accessibilityRole="button"
        >
          <Text style={s.avatarText}>{getInitial(displayName)}</Text>
        </View>
      </View>

      {/* ── Greeting ── */}
      <View style={s.greetingWrap}>
        <Text style={s.greetingSub} maxFontSizeMultiplier={1.3}>
          {getGreeting()} · {dayjs().format('dddd')}
        </Text>
        <Text style={s.greetingName} maxFontSizeMultiplier={1.3}>
          {displayName ?? 'Athlete'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
  },
  wordmark: { fontSize: 18, fontWeight: '800', letterSpacing: 2.5, color: T.colors.forge },
  avatar: {
    width: 36, height: 36, borderRadius: T.radii.full,
    backgroundColor: T.colors.forge,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  greetingWrap: { paddingHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  greetingSub: { fontSize: T.typography.sizes.label, fontWeight: '500', color: T.colors.t2, marginBottom: 2 },
  greetingName: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1 },
});
