import { useState } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../stores/authStore';
import { useWorkouts } from '../../../hooks/useWorkouts';
import { WeightEntry, MeasurementEntry } from '../types';
import dayjs from 'dayjs';

// Aggregate volume PER DAY (sum all exercises/sets on the same date)
function aggregateVolumeByDay(workouts: any[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const w of workouts) {
    const day = dayjs(w.date).format('YYYY-MM-DD');
    let vol = 0;
    w.exercises?.forEach((ex: any) => {
      ex.sets?.forEach((set: any) => { vol += (set.weight || 0) * (set.reps || 0); });
    });
    map[day] = (map[day] || 0) + vol;
  }
  return map;
}

export function useProgressData() {
  const { user, setUser } = useAuthStore();
  const { workouts } = useWorkouts();
  const [timeframe, setTimeframe] = useState<'1W' | '1M'>('1W');
  const [isUploading, setIsUploading] = useState(false);

  // ── Weight data ──
  let rawHistory: WeightEntry[] = (user as any)?.weight_history || (user as any)?.weightHistory || [];

  // Fallback to reading weight from bmi_history (like the seeded mock data) if weight_history is empty
  if (rawHistory.length === 0) {
    rawHistory = (((user as any)?.bmi_history || (user as any)?.bmiHistory || []) as any[])
      .map((item: any) => ({
        value: item.weight || (item.value > 50 ? item.value : 0),
        date: item.date
      }))
      .filter(item => item.value > 0);
  }

  const userWeightLbs = user?.weight ? Math.round(user.weight * 2.20462) : 0;

  const currentWeight = rawHistory.length > 0 ? rawHistory[rawHistory.length - 1].value : userWeightLbs;
  const startWeight   = rawHistory.length > 0 ? rawHistory[0].value : userWeightLbs;
  const weightDiff    = startWeight > 0 ? +(currentWeight - startWeight).toFixed(1) : 0;

  const lineData = rawHistory.length > 0
    ? rawHistory.map(item => ({ value: item.value, label: item.date.includes('T') || item.date.includes('-') ? dayjs(item.date).format('MM/DD') : item.date.slice(0, 5) }))
    : [
        { value: userWeightLbs, label: 'Start' },
        { value: userWeightLbs, label: 'Today' }
      ];

  const minVal = rawHistory.length > 0 ? Math.min(...rawHistory.map(r => r.value)) : userWeightLbs;
  const maxVal = rawHistory.length > 0 ? Math.max(...rawHistory.map(r => r.value)) : userWeightLbs;

  const bmiCalcText = user?.height && user?.weight
    ? `${Math.round(user.height)} x ${Math.round(user.weight)}`
    : undefined;

  // ── Measurements ──
  const measurements: MeasurementEntry[] = (user as any)?.measurements || [];
  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : {};
  const prev   = measurements.length > 1 ? measurements[measurements.length - 2] : undefined;

  // ── Photos ──
  const photos = (user as any)?.progress_photos || (user as any)?.progressPhotos || [];
  const firstPhoto = photos.length > 0 ? photos[0] : null;
  const lastPhoto  = photos.length > 0 ? photos[photos.length - 1] : null;

  // ── Volume: aggregate per day ──
  const today = dayjs();
  const volumeByDay = aggregateVolumeByDay(workouts || []);
  const activityDates = Object.keys(volumeByDay).sort();

  // Weekly volume data: Sun–Sat of the CURRENT week
  const startOfWeek = today.startOf('week'); // dayjs: week starts Sunday
  const weeklyVolumeData = Array.from({ length: 7 }, (_, i) => {
    const day = startOfWeek.add(i, 'day');
    const key = day.format('YYYY-MM-DD');
    const isFuture = day.isAfter(today, 'day');
    return {
      value: isFuture ? 0 : (volumeByDay[key] || 0),
      label: day.format('ddd').charAt(0), // S M T W T F S
      date: key,
      isToday: day.isSame(today, 'day'),
      isFuture,
    };
  });

  // Monthly volume data: all days of current month
  const startOfMonth = today.startOf('month');
  const daysInMonth  = today.daysInMonth();
  const monthlyVolumeData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = startOfMonth.add(i, 'day');
    const key = day.format('YYYY-MM-DD');
    return {
      value: volumeByDay[key] || 0,
      label: day.format('D'),        // Day number: 1, 2, 3…
      dayName: day.format('ddd'),
      date: key,
      active: !!volumeByDay[key],
      isToday: day.isSame(today, 'day'),
      startOfWeek: day.day() === 0,  // Sunday
    };
  });

  const volumeLineData = timeframe === '1W' ? weeklyVolumeData : monthlyVolumeData;

  const todayKey     = today.format('YYYY-MM-DD');
  const currentVolume = volumeByDay[todayKey] || 0;
  const prevVolume    = weeklyVolumeData.find(d => d.isToday === false && !d.isFuture)?.value || 0;
  const volumeDiff    = currentVolume - prevVolume;

  const allVols = weeklyVolumeData.map(v => v.value);
  const minVol  = Math.min(...allVols);
  const maxVol  = Math.max(...allVols);

  // ── Camera ──
  const uploadPhoto = async (uri: string, targetIndex?: number) => {
    if (!user?.uid) { alert('You must be logged in to upload photos.'); return; }
    setIsUploading(true);
    try {
      // 1. Read as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Decode base64 → binary array (atob is fine here — we're not creating a Blob)
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      // 3. Upload via Supabase Storage
      const path = `${user.uid}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('progress')
        .upload(path, bytes, { contentType: 'image/jpeg' });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('progress')
        .getPublicUrl(path);

      // 4. Save URL to Supabase profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('progress_photos')
        .eq('id', user.uid)
        .single();
        
      const existing = profile?.progress_photos || [];
      const updatedPhotos = [...existing];
      
      if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < updatedPhotos.length) {
        updatedPhotos[targetIndex] = { url: publicUrl, date: new Date().toISOString() };
      } else {
        updatedPhotos.push({ url: publicUrl, date: new Date().toISOString() });
      }
      
      await supabase.from('profiles').update({
        progress_photos: updatedPhotos
      }).eq('id', user.uid);
      
      // Instantly update local state so the Transformation section re-renders
      setUser({ ...user, progress_photos: updatedPhotos } as any);
      
      alert('Progress photo saved!');
    } catch (err: any) {
      console.error('[uploadPhoto] error:', err?.message ?? err);
      alert(err?.message ?? 'Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async (targetIndex?: number) => {
    Alert.alert(
      'Upload Progress Photo',
      'Select a source for your photo:',
      [
        {
          text: 'Take Photo (Camera)',
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) { alert('Camera permission required.'); return; }
            const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.6 });
            if (!result.canceled) uploadPhoto(result.assets[0].uri, targetIndex);
          }
        },
        {
          text: 'Choose from Album (Library)',
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) { alert('Photo library permission required.'); return; }
            const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.6 });
            if (!result.canceled) uploadPhoto(result.assets[0].uri, targetIndex);
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return {
    user,
    timeframe, setTimeframe,
    lineData, currentWeight, startWeight, weightDiff, minVal, maxVal,
    volumeLineData, weeklyVolumeData, monthlyVolumeData,
    currentVolume, volumeDiff, minVol, maxVol,
    activityDates,
    latest, prev,
    firstPhoto, lastPhoto,
    isUploading, takePhoto,
    bmiCalcText,
  };
}
