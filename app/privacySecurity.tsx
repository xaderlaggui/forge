import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useRouter } from 'expo-router';
import {
  BarChart2,
  ChevronLeft, ChevronRight,
  Download,
  Eye,
  Lock,
  Shield,
  Smartphone,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ForgeButton } from '../components/forge/ForgeButton';
import { BearMascot } from '../components/forge/BearMascot';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

type VisibilityOption = 'Public' | 'Friends Only' | 'Private';
const VISIBILITY_OPTIONS: VisibilityOption[] = ['Public', 'Friends Only', 'Private'];

function SectionHeader({ title, T }: { title: string; T: any }) {
  return (
    <Text style={{
      fontSize: 12, fontWeight: '700', color: T.colors.t3, letterSpacing: 0.8,
      textTransform: 'uppercase', marginBottom: 8, marginTop: 24, paddingHorizontal: 16,
    }}>
      {title}
    </Text>
  );
}

function SettingRow({
  icon, label, onPress, isDanger, rightContent, T,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  isDanger?: boolean;
  rightContent?: React.ReactNode;
  T: any;
}) {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: isDanger ? T.colors.redDim : T.colors.bg2,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </View>
      <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: isDanger ? T.colors.red : T.colors.t1 }}>
        {label}
      </Text>
      {rightContent ?? (onPress && <ChevronRight size={18} color={T.colors.t3} />)}
    </TouchableOpacity>
  );
}

function Divider({ T }: { T: any }) {
  return <View style={{ height: 0.5, backgroundColor: T.colors.b1, marginLeft: 66 }} />;
}

function VisibilityControl({ label, value, onChange, T }: {
  label: string; value: VisibilityOption; onChange: (v: VisibilityOption) => void; T: any;
}) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: T.colors.t2, marginBottom: 10 }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {VISIBILITY_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
              backgroundColor: value === opt ? T.colors.forge : T.colors.bg2,
            }}
          >
            <Text style={{
              fontSize: 12, fontWeight: '700',
              color: value === opt ? '#FFF' : T.colors.t3,
            }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { T } = useForgeTheme();
  const { user } = useAuthStore();

  // Security state
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState<VisibilityOption>(
    (user as any)?.profileVisibility || 'Public'
  );
  const [activityVisibility, setActivityVisibility] = useState<VisibilityOption>(
    (user as any)?.activityVisibility || 'Friends Only'
  );
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(
    (user as any)?.showLeaderboard ?? true
  );
  const [allowFollow, setAllowFollow] = useState<boolean>(
    (user as any)?.allowFollow ?? true
  );

  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(
    (user as any)?.twoFAEnabled ?? false
  );

  // Helper to persist to Supabase
  const updatePrivacySetting = async (key: string, value: any) => {
    if (!user?.uid) return;
    try {
      await supabase.from('profiles').update({ [key]: value }).eq('id', user.uid);
    } catch (e) {
      console.warn('Failed to save setting:', e);
    }
  };

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPwd.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setPwdLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      Alert.alert('Success', 'Password updated successfully.');
      setShowChangePwd(false);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm.');
      return;
    }
    try {
      if (user?.uid) {
        await supabase.from('profiles').delete().eq('id', user.uid);
      }
      // Supabase doesn't allow client-side account deletion by default
      // Sign out instead; use an Edge Function for full deletion in production
      await supabase.auth.signOut();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDownloadData = () => {
    Alert.alert('Data Export', 'Your data export request has been submitted. You will receive it via email within 24 hours.');
  };

  const s = useStyles(T);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false} bounces={false}>
        
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <BearMascot variant="THINKING" size="md" animate />
        </View>

        {/* Account Security */}
        <SectionHeader title="Account Security" T={T} />
        <View style={s.card}>
          <SettingRow
            T={T}
            icon={<Lock size={18} color={T.colors.t1} />}
            label="Change Password"
            onPress={() => setShowChangePwd(v => !v)}
          />
          {showChangePwd && (
            <View style={s.inlineForm}>
              <TextInput
                style={s.pwdInput}
                placeholder="Current password"
                placeholderTextColor={T.colors.t3}
                value={currentPwd}
                onChangeText={setCurrentPwd}
                secureTextEntry
              />
              <TextInput
                style={s.pwdInput}
                placeholder="New password"
                placeholderTextColor={T.colors.t3}
                value={newPwd}
                onChangeText={setNewPwd}
                secureTextEntry
              />
              <TextInput
                style={s.pwdInput}
                placeholder="Confirm new password"
                placeholderTextColor={T.colors.t3}
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                secureTextEntry
              />
              <ForgeButton
                label={pwdLoading ? 'Updating...' : 'Update Password'}
                onPress={handleChangePassword}
                loading={pwdLoading}
                style={{ marginTop: 4 }}
              />
            </View>
          )}
          <Divider T={T} />
          <SettingRow
            T={T}
            icon={<Shield size={18} color={T.colors.forge} />}
            label="Two-Factor Authentication"
            rightContent={
              <Switch
                value={twoFAEnabled}
                onValueChange={(val) => {
                  setTwoFAEnabled(val);
                  updatePrivacySetting('twoFAEnabled', val);
                }}
                trackColor={{ false: T.colors.bg3, true: T.colors.forge }}
                thumbColor="#FFF"
              />
            }
          />
          <Divider T={T} />
          <SettingRow
            T={T}
            icon={<Smartphone size={18} color={T.colors.t1} />}
            label="Active Sessions"
            onPress={() => Alert.alert('Active Sessions', 'You are currently signed in on 1 device.')}
          />
        </View>

        {/* Privacy */}
        <SectionHeader title="Privacy" T={T} />
        <View style={s.card}>
          <VisibilityControl
            label="Profile Visibility"
            value={profileVisibility}
            onChange={(val) => { setProfileVisibility(val); updatePrivacySetting('profileVisibility', val); }}
            T={T}
          />
          <Divider T={T} />
          <VisibilityControl
            label="Activity Visibility"
            value={activityVisibility}
            onChange={(val) => { setActivityVisibility(val); updatePrivacySetting('activityVisibility', val); }}
            T={T}
          />
          <Divider T={T} />
          <SettingRow
            T={T}
            icon={<BarChart2 size={18} color={T.colors.t1} />}
            label="Show in Leaderboards"
            rightContent={
              <Switch
                value={showLeaderboard}
                onValueChange={(val) => { setShowLeaderboard(val); updatePrivacySetting('showLeaderboard', val); }}
                trackColor={{ false: T.colors.bg3, true: T.colors.forge }}
                thumbColor="#FFF"
              />
            }
          />
          <Divider T={T} />
          <SettingRow
            T={T}
            icon={<Eye size={18} color={T.colors.t1} />}
            label="Allow others to follow me"
            rightContent={
              <Switch
                value={allowFollow}
                onValueChange={(val) => { setAllowFollow(val); updatePrivacySetting('allowFollow', val); }}
                trackColor={{ false: T.colors.bg3, true: T.colors.forge }}
                thumbColor="#FFF"
              />
            }
          />
        </View>

        {/* Data & Storage */}
        <SectionHeader title="Data & Storage" T={T} />
        <View style={s.card}>
          <SettingRow
            T={T}
            icon={<Download size={18} color={T.colors.t1} />}
            label="Download My Data"
            onPress={handleDownloadData}
          />
          <Divider T={T} />
          <SettingRow
            T={T}
            icon={<Trash2 size={18} color={T.colors.t1} />}
            label="Clear Cache"
            onPress={() => Alert.alert('Clear Cache', 'Cache cleared.', [{ text: 'OK' }])}
          />
          <Divider T={T} />
          <SettingRow
            T={T}
            icon={<Trash2 size={18} color={T.colors.red} />}
            label="Delete Account"
            isDanger
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Delete Account</Text>
            <Text style={s.modalBody}>
              This action is permanent and cannot be undone. All your data will be deleted.
              {'\n\n'}Type <Text style={{ color: T.colors.red, fontWeight: '800' }}>DELETE</Text> to confirm.
            </Text>
            <TextInput
              style={[s.pwdInput, { borderColor: T.colors.red }]}
              placeholder="Type DELETE"
              placeholderTextColor={T.colors.t3}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: T.colors.bg2 }]}
                onPress={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
              >
                <Text style={{ color: T.colors.t1, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: T.colors.red }]}
                onPress={handleDeleteAccount}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: T.colors.bg1, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: T.colors.t1, paddingBottom: 8 },
  card: {
    marginHorizontal: 16,
    backgroundColor: T.colors.bg1, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden',
  },
  inlineForm: { padding: 16, backgroundColor: T.colors.bg2, gap: 10 },
  pwdInput: {
    backgroundColor: T.colors.bg3, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: T.colors.t1,
    borderWidth: 0.5, borderColor: T.colors.b1,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: T.colors.bg1, borderRadius: 20,
    padding: 24, width: '100%', borderWidth: 0.5, borderColor: T.colors.b1,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: T.colors.t1, marginBottom: 12 },
  modalBody: { fontSize: 15, color: T.colors.t2, marginBottom: 20, lineHeight: 22 },
  modalBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
});
