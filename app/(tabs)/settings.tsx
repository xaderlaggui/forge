import { signOut } from 'firebase/auth';
import { Database, LogOut, Moon, Shield, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ForgeButton } from '../../components/forge/ForgeButton';
import { ForgeTheme as T } from '../../constants/ForgeTheme';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { seedExercises } from '../../utils/seedData';

// ─── Sub-component ─────────────────────────────────────────
function SettingRow({ icon, label, onPress, isDanger = false }: { icon: React.ReactNode; label: string; onPress: () => void; isDanger?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, isDanger && styles.iconWrapDanger]}>
        {icon}
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, isDanger && styles.rowLabelDanger]} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────
export default function SettingsScreen() {
  const { user } = useAuthStore();
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
      Alert.alert('Success', `Seeded ${count} exercises to Firestore!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} maxFontSizeMultiplier={1.2}>Settings</Text>
      </View>

      {/* ── Profile Card ── */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <UserIcon size={32} color={T.colors.forge} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} maxFontSizeMultiplier={1.2}>{user?.displayName || 'Athlete'}</Text>
          <Text style={styles.profileEmail} maxFontSizeMultiplier={1.2}>{user?.email || 'No email linked'}</Text>
        </View>
      </View>

      {/* ── Preferences Section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel} maxFontSizeMultiplier={1.2}>Preferences</Text>
        <View style={styles.card}>
          <SettingRow icon={<Moon size={18} color={T.colors.t1} />} label="Dark Theme (Default)" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon={<UserIcon size={18} color={T.colors.t1} />} label="Edit Profile" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon={<Shield size={18} color={T.colors.t1} />} label="Privacy & Security" onPress={() => {}} />
        </View>
      </View>

      {/* ── Developer / Admin Section ── */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel} maxFontSizeMultiplier={1.2}>Developer</Text>
          <View style={styles.card}>
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
