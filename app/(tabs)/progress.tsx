import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebase';
import { Camera } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export default function ProgressScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [timeframe, setTimeframe] = useState('1M');

  // Use real user weight history if available, else seed initial data for the design
  const rawHistory = user?.weightHistory?.length 
    ? user.weightHistory 
    : [
        { value: 195, date: 'May 1' },
        { value: 193, date: 'May 8' },
        { value: 190, date: 'May 15' },
        { value: 188, date: 'May 22' },
        { value: user?.weight || 185, date: 'May 29' },
      ];

  const lineData = rawHistory.map(item => ({
    value: item.value,
    label: item.date.slice(0, 5) // short date for label
  }));

  const currentWeight = rawHistory[rawHistory.length - 1].value;
  const startWeight = rawHistory[0].value;
  const weightDiff = currentWeight - startWeight;
  const diffPrefix = weightDiff > 0 ? '+' : '';

  const [isUploading, setIsUploading] = useState(false);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const photoRef = ref(storage, `users/${user?.uid}/progress/${Date.now()}.jpg`);
      await uploadBytes(photoRef, blob);
      const url = await getDownloadURL(photoRef);

      const userDocRef = doc(db, 'users', user?.uid as string);
      await updateDoc(userDocRef, {
        progressPhotos: arrayUnion({
          url,
          date: new Date().toISOString()
        })
      });
      alert("Progress photo saved!");
    } catch (error) {
      console.error(error);
      alert("Could not save photo.");
    } finally {
      setIsUploading(false);
    }
  };

  // Resolve photos
  const photos = user?.progressPhotos?.length ? user.progressPhotos : [
    { url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', date: '2026-01-01' },
    { url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', date: new Date().toISOString() }
  ];
  const firstPhoto = photos[0];
  const lastPhoto = photos[photos.length - 1];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>YOUR <Text style={{ color: '#D2FF00' }}>PROGRESS</Text></Text>
        <Text style={styles.subtitle}>Consistency compounds.</Text>
      </View>

      {/* Analytics Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.sectionTitle}>WEIGHT TREND</Text>
          
          <View style={styles.timeframeToggle}>
            {["7D", "1M", "3M", "YTD"].map((tf) => (
              <TouchableOpacity 
                key={tf} 
                onPress={() => setTimeframe(tf)}
                style={[styles.tfBtn, timeframe === tf && styles.tfBtnActive]}
              >
                <Text style={[styles.tfText, timeframe === tf && styles.tfTextActive]}>{tf}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.weightHeader}>
            <Text style={styles.currentWeight}>{currentWeight}<Text style={styles.weightUnit}>lbs</Text></Text>
            <View style={[styles.badge, weightDiff > 0 && { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Text style={[styles.badgeText, weightDiff > 0 && { color: '#ef4444' }]}>{diffPrefix}{weightDiff} lbs</Text>
            </View>
          </View>
          
          <View style={{ marginTop: 20, marginLeft: -20 }}>
            <LineChart
              data={lineData}
              areaChart
              hideDataPoints
              color="#D2FF00"
              thickness={3}
              startFillColor="#D2FF00"
              endFillColor="#D2FF00"
              startOpacity={0.3}
              endOpacity={0}
              xAxisColor="transparent"
              yAxisColor="transparent"
              yAxisTextStyle={{ color: '#8A8A93', fontSize: 10, fontWeight: '600' }}
              xAxisLabelTextStyle={{ color: '#8A8A93', fontSize: 10, fontWeight: '600' }}
              hideRules
              yAxisOffset={180}
              stepValue={5}
              maxValue={200}
              noOfSections={4}
              height={180}
            />
          </View>
        </View>
      </View>

      {/* Photo Grid */}
      <View style={styles.photoSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>TRANSFORMATION</Text>
          <TouchableOpacity onPress={takePhoto} style={styles.cameraBtn} disabled={isUploading}>
            <Camera size={14} color="#000" strokeWidth={3} />
            <Text style={styles.cameraBtnText}>{isUploading ? 'SAVING...' : 'TAKE PHOTO'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.photoGrid}>
          {/* Before Photo */}
          <View style={styles.photoWrapper}>
            <Image 
              source={{ uri: firstPhoto.url }} 
              style={[styles.photo, { opacity: 0.7 }]} 
            />
            <View style={styles.photoOverlay}>
              <View style={styles.badgeBefore}>
                <Text style={styles.badgeBeforeText}>BEFORE</Text>
              </View>
              <Text style={styles.photoDate}>{firstPhoto.date.slice(0, 10)}</Text>
            </View>
          </View>
          
          {/* Current Photo */}
          <View style={[styles.photoWrapper, styles.photoCurrentWrapper]}>
            <Image 
              source={{ uri: lastPhoto.url }} 
              style={styles.photo} 
            />
            <View style={styles.photoOverlay}>
              <View style={styles.badgeCurrent}>
                <Text style={styles.badgeCurrentText}>CURRENT</Text>
              </View>
              <Text style={styles.photoDate}>{lastPhoto.date.slice(0, 10)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Body Measurements Section */}
      <View style={styles.measurementSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>BODY MEASUREMENTS</Text>
          <TouchableOpacity onPress={() => router.push('/measurements')} style={styles.cameraBtn}>
            <Text style={styles.cameraBtnText}>UPDATE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.measurementsCard}>
          {(() => {
            const latest = user?.measurements?.length ? user.measurements[user.measurements.length - 1] : { chest: 42, waist: 34, arms: 15, legs: 24 };
            return (
              <View style={styles.measurementGrid}>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>CHEST</Text>
                  <Text style={styles.mValue}>{latest.chest || '--'} <Text style={styles.mUnit}>in</Text></Text>
                </View>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>WAIST</Text>
                  <Text style={styles.mValue}>{latest.waist || '--'} <Text style={styles.mUnit}>in</Text></Text>
                </View>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>ARMS</Text>
                  <Text style={styles.mValue}>{latest.arms || '--'} <Text style={styles.mUnit}>in</Text></Text>
                </View>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>LEGS</Text>
                  <Text style={styles.mValue}>{latest.legs || '--'} <Text style={styles.mUnit}>in</Text></Text>
                </View>
              </View>
            );
          })()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0C0E' },
  scrollContent: { padding: 24, paddingTop: 48, paddingBottom: 100 },
  
  header: { marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#8A8A93' },
  
  chartSection: { marginBottom: 40 },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#8A8A93', letterSpacing: 1 },
  
  timeframeToggle: { flexDirection: 'row', backgroundColor: '#16161A', borderRadius: 20, borderWidth: 1, borderColor: '#242429', padding: 4 },
  tfBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tfBtnActive: { backgroundColor: '#242429' },
  tfText: { fontSize: 10, fontWeight: '800', color: '#8A8A93' },
  tfTextActive: { color: '#FFF' },

  chartCard: { backgroundColor: '#16161A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#242429' },
  weightHeader: { flexDirection: 'row', alignItems: 'center' },
  currentWeight: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  weightUnit: { fontSize: 14, color: '#8A8A93', marginLeft: 4 },
  badge: { backgroundColor: 'rgba(210,255,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 12 },
  badgeText: { color: '#D2FF00', fontSize: 10, fontWeight: '800' },

  photoSection: {},
  photoGrid: { flexDirection: 'row', gap: 16, marginTop: 16 },
  photoWrapper: { flex: 1, aspectRatio: 0.75, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#242429', position: 'relative' },
  photoCurrentWrapper: { borderColor: '#D2FF00', shadowColor: '#D2FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.5)' },
  badgeBefore: { backgroundColor: 'rgba(0,0,0,0.7)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  badgeBeforeText: { color: '#D2FF00', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  badgeCurrent: { backgroundColor: '#D2FF00', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  badgeCurrentText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  photoDate: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  
  cameraBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D2FF00', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  cameraBtnText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  measurementSection: { marginTop: 40 },
  measurementsCard: { backgroundColor: '#16161A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#242429' },
  measurementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  mCol: { width: '45%' },
  mLabel: { color: '#8A8A93', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  mValue: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  mUnit: { color: '#8A8A93', fontSize: 12, fontWeight: '700' }
});
