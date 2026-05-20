import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useForgeTheme } from '../hooks/useForgeTheme';

export default function MeasurementsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { T } = useForgeTheme();
  const s = useS(T);

  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [legs, setLegs] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!chest && !waist && !arms && !legs) {
      Alert.alert('Incomplete', 'Please enter at least one measurement.');
      return;
    }
    setIsSaving(true);
    try {
      const newEntry = {
        chest: chest ? Number(chest) : undefined,
        waist: waist ? Number(waist) : undefined,
        arms:  arms  ? Number(arms)  : undefined,
        legs:  legs  ? Number(legs)  : undefined,
        date: new Date().toISOString(),
      };
      // Fetch current measurements array and append
      const { data: profile } = await supabase
        .from('profiles')
        .select('measurements')
        .eq('id', user?.uid)
        .single();
      const existing = profile?.measurements || [];
      const updatedMeasurements = [...existing, newEntry];
      const { error } = await supabase
        .from('profiles')
        .update({ measurements: updatedMeasurements })
        .eq('id', user?.uid);
      if (error) throw error;
      
      // Instantly update local state so the Progress screen re-renders
      setUser({ ...user, measurements: updatedMeasurements } as any);
      
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save measurements.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>LOG <Text style={{ color: T.colors.forge }}>MEASUREMENTS</Text></Text>
      <Text style={s.subtitle}>Enter values in inches.</Text>

      <View style={s.form}>
        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.label}>CHEST (in)</Text>
            <TextInput style={s.input} placeholder="0.0" placeholderTextColor={T.colors.t3} keyboardType="numeric" value={chest} onChangeText={setChest} />
          </View>
          <View style={s.col}>
            <Text style={s.label}>WAIST (in)</Text>
            <TextInput style={s.input} placeholder="0.0" placeholderTextColor={T.colors.t3} keyboardType="numeric" value={waist} onChangeText={setWaist} />
          </View>
        </View>

        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.label}>ARMS (in)</Text>
            <TextInput style={s.input} placeholder="0.0" placeholderTextColor={T.colors.t3} keyboardType="numeric" value={arms} onChangeText={setArms} />
          </View>
          <View style={s.col}>
            <Text style={s.label}>LEGS (in)</Text>
            <TextInput style={s.input} placeholder="0.0" placeholderTextColor={T.colors.t3} keyboardType="numeric" value={legs} onChangeText={setLegs} />
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={isSaving}>
          <Text style={s.saveBtnText}>{isSaving ? 'SAVING...' : 'SAVE MEASUREMENTS'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()} disabled={isSaving}>
          <Text style={s.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg1, padding: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '900', color: T.colors.t1, letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontSize: 12, color: T.colors.t3, marginBottom: 32 },
  
  form: { flex: 1 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  col: { flex: 1 },
  
  label: { fontSize: 10, fontWeight: '800', color: T.colors.t3, letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: T.colors.bg2, borderWidth: 1, borderColor: T.colors.b1, borderRadius: 12, padding: 16, color: T.colors.t1, fontSize: 16, fontWeight: '700' },
  
  saveBtn: { backgroundColor: T.colors.forge, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12, shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  
  cancelBtn: { padding: 18, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: T.colors.t3, fontSize: 12, fontWeight: '800', letterSpacing: 1 }
});
