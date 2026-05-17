import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../../services/firebase';
import { useAuthStore } from '../../../stores/authStore';
import { WeightEntry, MeasurementEntry } from '../types';

export function useProgressData() {
  const { user } = useAuthStore();
  const [timeframe, setTimeframe] = useState('1M');
  const [isUploading, setIsUploading] = useState(false);

  // ── Weight data ──
  const fallbackHistory: WeightEntry[] = [
    { value: 195, date: 'May 1' },
    { value: 193, date: 'May 8' },
    { value: 191, date: 'May 10' },
    { value: 190, date: 'May 15' },
    { value: 188, date: 'May 20' },
    { value: (user as any)?.weight || 186, date: 'May 29' },
  ];
  
  const rawHistory: WeightEntry[] = (user as any)?.weightHistory?.length 
    ? (user as any).weightHistory 
    : fallbackHistory;
    
  const lineData = rawHistory.map(item => ({ value: item.value, label: item.date.slice(0, 5) }));

  const currentWeight = rawHistory[rawHistory.length - 1].value;
  const startWeight   = rawHistory[0].value;
  const weightDiff    = +(currentWeight - startWeight).toFixed(1);

  const minVal = Math.min(...rawHistory.map(r => r.value));
  const maxVal = Math.max(...rawHistory.map(r => r.value));

  // ── Measurements ──
  const measurements: MeasurementEntry[] = (user as any)?.measurements?.length
    ? (user as any).measurements
    : [{ chest: 41.5, waist: 33.0, arms: 15.2, legs: 24.8 }];
  
  const latest = measurements[measurements.length - 1];
  const prev   = measurements.length > 1 ? measurements[measurements.length - 2] : undefined;

  // ── Photos ──
  const photos = (user as any)?.progressPhotos?.length
    ? (user as any).progressPhotos
    : [
        { url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80', date: '2026-01-01' },
        { url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80', date: new Date().toISOString() },
      ];
  
  const firstPhoto = photos[0];
  const lastPhoto  = photos[photos.length - 1];

  // ── Camera ──
  const uploadPhoto = async (uri: string) => {
    setIsUploading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const photoRef = ref(storage, `users/${user?.uid}/progress/${Date.now()}.jpg`);
      await uploadBytes(photoRef, bytes, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(photoRef);

      await updateDoc(doc(db, 'users', user?.uid as string), {
        progressPhotos: arrayUnion({ url, date: new Date().toISOString() }),
      });
      alert('Progress photo saved! 🎉');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to save photo. Check your Firebase Storage rules.');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { alert('Camera permission required.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.6 });
    if (!result.canceled) uploadPhoto(result.assets[0].uri);
  };

  return {
    user,
    timeframe, setTimeframe,
    lineData, currentWeight, startWeight, weightDiff, minVal, maxVal,
    latest, prev,
    firstPhoto, lastPhoto,
    isUploading, takePhoto
  };
}
