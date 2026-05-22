import { useForgeTheme } from "@/hooks/useForgeTheme";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { getGreeting, getInitial } from '../utils';

interface DashboardHeaderProps {
  displayName?: string | null;
  photoUrl?: string | null;
}

export function DashboardHeader({ displayName, photoUrl }: DashboardHeaderProps) {
  const router = useRouter();
  const { T } = useForgeTheme();
  const s = useS(T);
  return (
    <View>
      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <Text style={s.wordmark}>FORGE</Text>
        <View style={s.headerRight}>
          <View style={s.bellBtn}>
            <Bell size={24} color={T.colors.t1} />
            <View style={s.bellBadge} />
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} activeOpacity={0.8}>
            <LinearGradient colors={[T.colors.forge, '#b33e1d']} style={s.avatarWrap}>
              <View
                style={[s.avatarInner, { overflow: 'hidden' }]}
                accessibilityLabel={`Profile: ${displayName ?? 'Athlete'}`}
                accessibilityRole="button"
              >
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={s.avatarText}>{getInitial(displayName)}</Text>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Greeting ── */}
      <View style={s.greetingWrap}>
        <Text style={s.greetingSub} maxFontSizeMultiplier={1.3}>
          {getGreeting()},
        </Text>
        <Text style={s.greetingName} maxFontSizeMultiplier={1.3}>
          Ready to train, {displayName ?? 'Athlete'}?
        </Text>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
  },
  wordmark: { fontSize: 18, fontWeight: '800', letterSpacing: 2.5, color: T.colors.forge },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bellBtn: { position: 'relative' },
  bellBadge: {
    position: 'absolute', top: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: T.colors.forge,
    borderWidth: 2, borderColor: T.colors.bg0,
  },
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    padding: 2,
  },
  avatarInner: {
    flex: 1, borderRadius: 20,
    backgroundColor: T.colors.bg0,
    borderWidth: 2, borderColor: T.colors.bg0,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: T.colors.t1 },

  greetingWrap: { paddingHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  greetingSub: { fontSize: T.typography.sizes.label, fontWeight: '500', color: T.colors.t3, marginBottom: 2 },
  greetingName: { fontSize: 26, fontWeight: '900', color: T.colors.t1 },
});
