import { useForgeTheme } from '@/hooks/useForgeTheme';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert, Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ForgeButton } from '../components/forge/ForgeButton';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];
const GOAL_OPTIONS = ['Lose Weight', 'Build Muscle', 'Improve Endurance', 'Stay Active'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { T } = useForgeTheme();
  const s = useStyles(T);
  const { user, setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [handle, setHandle] = useState((user as any)?.handle || '');
  const [dob, setDob] = useState((user as any)?.dateOfBirth || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [gender, setGender] = useState(GENDER_OPTIONS[0]);
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(user?.photoURL || null);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const heightVal = heightUnit === 'ft'
        ? Math.round(parseFloat(height) * 30.48)
        : parseFloat(height) || 0;
      const weightVal = weightUnit === 'lbs'
        ? Math.round(parseFloat(weight) * 0.453592)
        : parseFloat(weight) || 0;

      const updated = {
        ...user,
        displayName,
        display_name: displayName,
        handle,
        dateOfBirth: dob,
        date_of_birth: dob,
        height: heightVal,
        weight: weightVal,
        photoURL: photoUri || user.photoURL,
        photo_url: photoUri || user.photoURL,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          handle,
          date_of_birth: dob,
          height: heightVal,
          weight: weightVal,
          photo_url: photoUri || (user as any).photoURL,
        })
        .eq('id', user.uid);
      if (error) throw error;
      setUser(updated);
      Alert.alert('Saved', 'Profile updated successfully.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const renderUnitToggle = (
    value: string,
    options: string[],
    onChange: (v: any) => void
  ) => (
    <View style={s.unitToggle}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[s.unitBtn, value === opt && s.unitBtnActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[s.unitBtnText, value === opt && s.unitBtnTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSegmented = (
    label: string,
    options: string[],
    value: string,
    onChange: (v: string) => void
  ) => (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.segmented}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[s.segBtn, value === opt && s.segBtnActive]}
            onPress={() => onChange(opt)}
          >
            <Text style={[s.segBtnText, value === opt && s.segBtnTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={T.colors.t1} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>


        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity style={s.avatarWrap} onPress={pickAvatar}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.avatarImg} />
            ) : (
              <View style={[s.avatarImg, { backgroundColor: T.colors.forgeDim, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: T.colors.forge }}>
                  {displayName?.[0]?.toUpperCase() || 'A'}
                </Text>
              </View>
            )}
            <View style={s.cameraOverlay}>
              <Camera size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={s.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Fields */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Personal Info</Text>
          <View style={s.card}>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Display Name</Text>
              <TextInput
                style={s.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={T.colors.t3}
              />
            </View>
            <View style={s.divider} />

            <View style={s.field}>
              <Text style={s.fieldLabel}>Username / Handle</Text>
              <TextInput
                style={s.input}
                value={handle}
                onChangeText={setHandle}
                placeholder="@username"
                placeholderTextColor={T.colors.t3}
                autoCapitalize="none"
              />
            </View>
            <View style={s.divider} />

            <View style={s.field}>
              <Text style={s.fieldLabel}>Date of Birth</Text>
              <TextInput
                style={s.input}
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={T.colors.t3}
              />
            </View>
            <View style={s.divider} />

            {/* Gender */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>Gender</Text>
              <View style={s.segmented}>
                {GENDER_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.segBtn, gender === opt && s.segBtnActive]}
                    onPress={() => setGender(opt)}
                  >
                    <Text style={[s.segBtnText, gender === opt && s.segBtnTextActive]}>
                      {opt === 'Prefer not to say' ? 'Other' : opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Body Metrics</Text>
          <View style={s.card}>
            {/* Height */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>Height</Text>
              <View style={s.inputRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder={heightUnit === 'cm' ? '175' : '5.9'}
                  placeholderTextColor={T.colors.t3}
                  keyboardType="decimal-pad"
                />
                {renderUnitToggle(heightUnit, ['cm', 'ft'], setHeightUnit)}
              </View>
            </View>
            <View style={s.divider} />
            {/* Weight */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>Weight</Text>
              <View style={s.inputRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder={weightUnit === 'kg' ? '75' : '165'}
                  placeholderTextColor={T.colors.t3}
                  keyboardType="decimal-pad"
                />
                {renderUnitToggle(weightUnit, ['kg', 'lbs'], setWeightUnit)}
              </View>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Fitness Goal</Text>
          <View style={s.card}>
            <View style={s.field}>
              {GOAL_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[s.goalRow, goal === opt && s.goalRowActive]}
                  onPress={() => setGoal(opt)}
                >
                  <View style={[s.radioOuter, goal === opt && s.radioOuterActive]}>
                    {goal === opt && <View style={s.radioInner} />}
                  </View>
                  <Text style={[s.goalText, goal === opt && { color: T.colors.forge }]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={s.section}>
          <ForgeButton
            label={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            loading={saving}
          />
        </View>
      </ScrollView>
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
  content: { paddingBottom: 60 },

  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.colors.forge,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: T.colors.bg0,
  },
  avatarHint: { marginTop: 10, fontSize: 13, color: T.colors.t3 },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: T.colors.t3, letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 8,
  },
  card: {
    backgroundColor: T.colors.bg1, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden',
  },
  divider: { height: 0.5, backgroundColor: T.colors.b1 },

  field: { padding: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: T.colors.t3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: T.colors.bg2, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: T.colors.t1, fontWeight: '500',
  },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },

  unitToggle: { flexDirection: 'row', backgroundColor: T.colors.bg2, borderRadius: 10, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  unitBtnActive: { backgroundColor: T.colors.forge },
  unitBtnText: { fontSize: 13, fontWeight: '700', color: T.colors.t3 },
  unitBtnTextActive: { color: '#FFF' },

  segmented: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: T.colors.bg2, alignItems: 'center',
  },
  segBtnActive: { backgroundColor: T.colors.forge },
  segBtnText: { fontSize: 13, fontWeight: '700', color: T.colors.t2 },
  segBtnTextActive: { color: '#FFF' },

  goalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
  },
  goalRowActive: {},
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: T.colors.t3,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: T.colors.forge },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.colors.forge },
  goalText: { fontSize: 16, fontWeight: '500', color: T.colors.t1 },
});
