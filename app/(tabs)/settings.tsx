import { signOut } from 'firebase/auth';
import { Database, LogOut, Moon, Shield, Sparkles, Sun, Smartphone, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ForgeButton } from '../../components/forge/ForgeButton';
import { ForgeTheme as ST } from '../../constants/ForgeTheme';
import { useForgeTheme } from '../../hooks/useForgeTheme';
import { useThemeStore, type ThemePreference } from '../../stores/themeStore';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { seedExercises } from '../../utils/seedData';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

// ─── Theme Toggle ───────────────────────────────────────────────
const THEME_OPTIONS: { key: ThemePreference; label: string; icon: any }[] = [
  { key: 'system',  label: 'System', icon: Smartphone },
  { key: 'light',   label: 'Light',  icon: Sun        },
  { key: 'dark',    label: 'Dark',   icon: Moon       },
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
              { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
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
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, isDanger && { backgroundColor: T.colors.redDim }]}>
        {icon}
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: isDanger ? T.colors.red : T.colors.t1 }]} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { T } = useForgeTheme();
  const [seeding, setSeeding] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.error(error);
        }
      }},
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
    <ScrollView style={[styles.container, { backgroundColor: T.colors.bg0 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: T.colors.b1, backgroundColor: T.colors.bg0 }]}>
        <Text style={[styles.headerTitle, { color: T.colors.t1 }]} maxFontSizeMultiplier={1.2}>Settings</Text>
      </View>

      {/* ── Profile Card ── */}
      <View style={[styles.profileCard, { backgroundColor: T.colors.bg1, borderColor: T.colors.b1 }]}>
        <View style={[styles.avatar, { backgroundColor: T.colors.forgeDim }]}>
          <UserIcon size={32} color={T.colors.forge} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: T.colors.t1 }]} maxFontSizeMultiplier={1.2}>{user?.displayName || 'Athlete'}</Text>
          <Text style={[styles.profileEmail, { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>{user?.email || 'No email linked'}</Text>
        </View>
      </View>

      {/* ── Appearance ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: T.colors.bg1, borderColor: T.colors.b1 }]}>
          <ThemeToggle T={T} />
        </View>
      </View>

      {/* ── Preferences Section ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: T.colors.bg1, borderColor: T.colors.b1 }]}>
          <SettingRow T={T} icon={<UserIcon size={18} color={T.colors.t1} />} label="Edit Profile" onPress={() => {}} />
          <View style={[styles.divider, { backgroundColor: T.colors.b1 }]} />
          <SettingRow T={T} icon={<Sparkles size={18} color={T.colors.forge} />} label="Generate AI Plan" onPress={() => router.push('/aiPlan')} />
          <View style={[styles.divider, { backgroundColor: T.colors.b1 }]} />
          <SettingRow T={T} icon={<Shield size={18} color={T.colors.t1} />} label="Privacy & Security" onPress={() => {}} />
        </View>
      </View>

      {/* ── Developer / Admin Section ── */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: T.colors.t3 }]} maxFontSizeMultiplier={1.2}>Developer</Text>
          <View style={[styles.card, { backgroundColor: T.colors.bg1, borderColor: T.colors.b1 }]}>
            <View style={{ padding: T.spacing.px4 }}>
              <Text style={styles.devHint} maxFontSizeMultiplier={1.2}>
                Need test data? Seed the Firestore database with default exercises.
              </Text>
              <ForgeButton
                label="Seed Exercises"
                onPress={handleSeed}
                loading={seeding}
                variant="secondary"
                leftIcon={<Database size={16} color={T.colors.forge} />}
                style={{ marginBottom: 12 }}
              />
              <ForgeButton
                label="Inject Mock User Data"
                onPress={async () => {
                  try {
                    if (!user?.uid) return;
                    setSeeding(true);
                    const { seedMockUser } = await import('../../utils/seedData');
                    await seedMockUser(user.uid);
                    Alert.alert('Success', 'Mock profile and workouts injected to Firestore!');
                  } catch (e: any) {
                    Alert.alert('Error', e.message);
                  } finally {
                    setSeeding(false);
                  }
                }}
                loading={seeding}
                variant="secondary"
                leftIcon={<Database size={16} color={T.colors.forge} />}
                style={{ marginBottom: 12 }}
              />
              <ForgeButton
                label="Generate AI Plan"
                onPress={() => router.push('/aiPlan')}
                variant="primary"
                leftIcon={<Database size={16} color="#000" />}
              />
            </View>
          </View>
        </View>
      )}

      {/* ── Actions ── */}
      <View style={styles.section}>
        <ForgeButton
          label="Log Out"
          onPress={handleLogout}
          variant="danger"
          leftIcon={<LogOut size={16} color="#fff" />}
        />
        <Text style={styles.version} maxFontSizeMultiplier={1.2}>FORGE App v1.0.0</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ST.colors.bg0 },
  content: { paddingBottom: 110 },

  header: {
    paddingHorizontal: ST.spacing.page, paddingTop: 60, paddingBottom: ST.spacing.px3,
    borderBottomWidth: 0.5, borderBottomColor: ST.colors.b1,
    backgroundColor: ST.colors.bg0,
    marginBottom: ST.spacing.px5,
  },
  headerTitle: { fontSize: ST.typography.sizes.h1, fontWeight: '700', color: ST.colors.t1 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginHorizontal: ST.spacing.page, marginBottom: ST.spacing.px7,
    padding: ST.spacing.px4, borderRadius: ST.radii.xl,
    backgroundColor: ST.colors.bg1, borderWidth: 0.5, borderColor: ST.colors.b1,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: ST.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,92,46,0.3)',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: ST.typography.sizes.h2, fontWeight: '700', color: ST.colors.t1, marginBottom: 2 },
  profileEmail: { fontSize: ST.typography.sizes.bodyS, color: ST.colors.t3 },

  section: { marginHorizontal: ST.spacing.page, marginBottom: ST.spacing.px6 },
  sectionLabel: {
    fontSize: ST.typography.sizes.label, fontWeight: '600', color: ST.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: ST.spacing.px3,
  },
  card: {
    backgroundColor: ST.colors.bg1, borderRadius: ST.radii.lg,
    borderWidth: 0.5, borderColor: ST.colors.b1, overflow: 'hidden',
  },
  divider: { height: 0.5, backgroundColor: ST.colors.b1, marginLeft: 50 },

  row: { flexDirection: 'row', alignItems: 'center', padding: ST.spacing.px4, gap: 12 },
  iconWrap: {
    width: 36, height: 36, borderRadius: ST.radii.md,
    backgroundColor: ST.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: ST.colors.redDim },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: ST.typography.sizes.body, fontWeight: '500', color: ST.colors.t1 },
  rowLabelDanger: { color: ST.colors.red, fontWeight: '600' },

  devHint: { fontSize: ST.typography.sizes.bodyS, color: ST.colors.t3, marginBottom: ST.spacing.px4, lineHeight: 20 },

  version: { textAlign: 'center', fontSize: ST.typography.sizes.label, color: ST.colors.t3, marginTop: ST.spacing.px4, fontWeight: '500' },
});
