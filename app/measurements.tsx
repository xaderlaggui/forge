import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

export default function MeasurementsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

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
      const { error } = await supabase
        .from('profiles')
        .update({ measurements: [...existing, newEntry] })
        .eq('id', user?.uid);
      if (error) throw error;
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save measurements.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOG <Text style={{ color: '#D2FF00' }}>MEASUREMENTS</Text></Text>
      <Text style={styles.subtitle}>Enter values in inches.</Text>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>CHEST (in)</Text>
            <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#8A8A93" keyboardType="numeric" value={chest} onChangeText={setChest} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>WAIST (in)</Text>
            <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#8A8A93" keyboardType="numeric" value={waist} onChangeText={setWaist} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>ARMS (in)</Text>
            <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#8A8A93" keyboardType="numeric" value={arms} onChangeText={setArms} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>LEGS (in)</Text>
            <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#8A8A93" keyboardType="numeric" value={legs} onChangeText={setLegs} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveBtnText}>{isSaving ? 'SAVING...' : 'SAVE MEASUREMENTS'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={isSaving}>
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0C0E', padding: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#8A8A93', marginBottom: 32 },
  
  form: { flex: 1 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  col: { flex: 1 },
  
  label: { fontSize: 10, fontWeight: '800', color: '#8A8A93', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#16161A', borderWidth: 1, borderColor: '#242429', borderRadius: 12, padding: 16, color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  saveBtn: { backgroundColor: '#D2FF00', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12, shadowColor: '#D2FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  
  cancelBtn: { padding: 18, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#8A8A93', fontSize: 12, fontWeight: '800', letterSpacing: 1 }
});
