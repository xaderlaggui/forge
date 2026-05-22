import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Database, LogOut, Moon, Shield, Smartphone, Sparkles, Sun, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ForgeButton } from '../../components/forge/ForgeButton';
import { useForgeTheme } from '../../hooks/useForgeTheme';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore, type ThemePreference } from '../../stores/themeStore';
import { seedExercises } from '../../utils/seedData';

// ─── Theme Toggle ───────────────────────────────────────────────
const THEME_OPTIONS: { key: ThemePreference; label: string; icon: any }[] = [
  { key: 'system', label: 'System', icon: Smartphone },
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
];

function ThemeToggle({ T }: { T: any }) {
  const { preference, setPreference } = useThemeStore();
  return (
    <View style={{ flexDirection: 'row', gap: 8, padding: 12 }}>
      {THEME_OPTIONS.map(({ key, label, icon: Icon }) => {
        const active = preference === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => setPreference(key)}
            style={[
              {
                flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                paddingVertical: 10, borderRadius: 12, gap: 4,
                backgroundColor: active ? T.colors.forge + '18' : T.colors.bg2,
                borderWidth: 1,
                borderColor: active ? T.colors.forge : T.colors.b1,
              }
            ]}
          >
            <Icon size={16} color={active ? T.colors.forge : T.colors.t3} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: active ? T.colors.forge : T.colors.t3 }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Sub-component ─────────────────────────────────────────
function SettingRow({ T, icon, label, onPress, isDanger = false }: { T: any; icon: React.ReactNode; label: string; onPress: () => void; isDanger?: boolean }) {
  const s = useS(T);
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.iconWrap, isDanger && { backgroundColor: T.colors.redDim }]}>
        {icon}
      </View>
      <View style={s.rowContent}>
        <Text style={[s.rowLabel, { color: isDanger ? T.colors.red : T.colors.t1 }]} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

import { useScrollToHideNav } from '../../hooks/useScrollToHideNav';

// ─── Main Screen ─────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { T } = useForgeTheme();
  const s = useS(T);
  const [seeding, setSeeding] = useState(false);
  const { onScroll } = useScrollToHideNav();

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.error(error);
          }
        }
      },
    ]);
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const count = await seedExercises();
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      Alert.alert('Success', `Seeded ${count} exercises to Firestore!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <ScrollView style={[s.container, { backgroundColor: T.colors.bg0 }]} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} bounces={false}>
      {/* ── Header ── */}
      <View style={[s.header, { borderBottomColor: T.colors.b1, backgroundColor: T.colors.bg0 }]}>
        <Text style={[s.headerTitle, { color: T.colors.t1 }]} maxFontSizeMultiplier={1.2}>Profile</Text>
      </View>

      {/* ── Profile Card ── */}
      <View style={[s.profileCard, { backgroundColor: T.colors.bg1, borderColor: T.colors.b1 }]}>
        <LinearGradient colors={[T.colors.forge, '#b33e1d']} style={{ width: 64, height: 64, borderRadius: 32, padding: 3 }}>
          <View style={[s.avatar, { backgroundColor: T.colors.bg0, flex: 1, width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden' }]}>
            {(user?.photoURL || (user as any)?.photo_url) ? (
              <Image source={{ uri: user?.photoURL || (user as any)?.photo_url }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={{ fontSize: 24, fontWeight: '800', color: T.colors.t1 }}>
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
              </Text>
            )}
          </View>
        </LinearGradient>
        <View style={s.profileInfo}>
          <Text style={[s.profileName, { color: T.colors.t1 }]} maxFontSizeMultiplier={1.2}>{user?.displayName || 'Athlete'}</Text>
          <Text style={[s.profileEmail, { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>{user?.email || 'No email linked'}</Text>
        </View>
      </View>

      {/* ── Appearance ── */}
      <View style={s.section}>
        <Text style={[s.sectionLabel, { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>Appearance</Text>
        <View style={[s.card, { backgroundColor: T.colors.bg1, borderColor: T.colors.b1 }]}>
          <ThemeToggle T={T} />
        </View>
      </View>

      {/* ── Preferences Section ── */}
      <View style={s.section}>
        <Text style={[s.sectionLabel, { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>Preferences</Text>
        <View style={[s.card, { backgroundColor: T.colors.bg1, borderColor: T.colors.b1 }]}>
          <SettingRow T={T} icon={<UserIcon size={18} color={T.colors.t1} />} label="Edit Profile" onPress={() => router.push('/editProfile')} />
          <View style={[s.divider, { backgroundColor: T.colors.b1 }]} />
          <SettingRow T={T} icon={<Shield size={18} color={T.colors.t1} />} label="Privacy & Security" onPress={() => router.push('/privacySecurity')} />
        </View>
      </View>


      {/* ── Actions ── */}
      <View style={s.section}>
        <ForgeButton
          label="Log Out"
          onPress={handleLogout}
          variant="danger"
          leftIcon={<LogOut size={16} color="#fff" />}
        />
        <Text style={s.version} maxFontSizeMultiplier={1.2}>FORGE App v1.0.0</Text>
      </View>

    </ScrollView>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { paddingBottom: 110 },

  header: {
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px3,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
    backgroundColor: T.colors.bg0,
    marginBottom: T.spacing.px5,
  },
  headerTitle: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginHorizontal: T.spacing.page, marginBottom: T.spacing.px7,
    padding: T.spacing.px4, borderRadius: T.radii.xl,
    backgroundColor: T.colors.bg1, borderWidth: 0.5, borderColor: T.colors.b1,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,92,46,0.3)',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: T.typography.sizes.h2, fontWeight: '700', color: T.colors.t1, marginBottom: 2 },
  profileEmail: { fontSize: T.typography.sizes.bodyS, color: T.colors.t3 },

  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: T.spacing.px3,
  },
  card: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden',
  },
  divider: { height: 0.5, backgroundColor: T.colors.b1, marginLeft: 50 },

  row: { flexDirection: 'row', alignItems: 'center', padding: T.spacing.px4, gap: 12 },
  iconWrap: {
    width: 36, height: 36, borderRadius: T.radii.md,
    backgroundColor: T.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: T.colors.redDim },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: T.typography.sizes.body, fontWeight: '500', color: T.colors.t1 },
  rowLabelDanger: { color: T.colors.red, fontWeight: '600' },

  devHint: { fontSize: T.typography.sizes.bodyS, color: T.colors.t3, marginBottom: T.spacing.px4, lineHeight: 20 },

  version: { textAlign: 'center', fontSize: T.typography.sizes.label, color: T.colors.t3, marginTop: T.spacing.px4, fontWeight: '500' },
});
