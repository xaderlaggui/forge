import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { ForgeTheme as T } from '../../constants/ForgeTheme';

// Feature Modules
import { useProgressData } from '../../features/progress/hooks/useProgressData';
import { StatCard } from '../../features/progress/components/StatCard';
import { MeasurementCard } from '../../features/progress/components/MeasurementCard';
import { WeightChart } from '../../features/progress/components/WeightChart';
import { ProgressPhotos } from '../../features/progress/components/ProgressPhotos';

export default function ProgressScreen() {
  const router = useRouter();

  // Clean Architecture: Hook handles all formatting, storage logic, and firestore logic
  const {
    user, timeframe, setTimeframe,
    lineData, currentWeight, startWeight, weightDiff, minVal, maxVal,
    latest, prev,
    firstPhoto, lastPhoto,
    isUploading, takePhoto
  } = useProgressData();

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── Composition: Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub} maxFontSizeMultiplier={1.2}>Your Journey</Text>
          <Text style={s.headerTitle} maxFontSizeMultiplier={1.2}>Progress</Text>
        </View>
        <TouchableOpacity style={s.cameraBtn} onPress={takePhoto} disabled={isUploading}>
          {isUploading
            ? <ActivityIndicator size="small" color={T.colors.forge} />
            : <Camera size={18} color={T.colors.forge} />}
        </TouchableOpacity>
      </View>

      {/* ── Composition: Key Stats ── */}
      <View style={s.statsRow}>
        <StatCard label="Current" value={currentWeight} unit="lbs" delta={weightDiff} />
        <StatCard label="Started" value={startWeight} unit="lbs" />
        <StatCard label="BMI" value={user?.bmi?.toFixed(1) ?? '—'} />
      </View>

      {/* ── Composition: Weight Chart ── */}
      <WeightChart 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        weightDiff={weightDiff} 
        lineData={lineData} 
        minVal={minVal} 
        maxVal={maxVal} 
      />

      {/* ── Composition: Body Measurements ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Body Measurements</Text>
        <View style={s.measGrid}>
          <MeasurementCard label="Chest" value={latest?.chest} prevValue={prev?.chest} onPress={() => router.push('/measurements')} />
          <MeasurementCard label="Waist" value={latest?.waist} prevValue={prev?.waist} onPress={() => router.push('/measurements')} />
          <MeasurementCard label="Arms"  value={latest?.arms}  prevValue={prev?.arms}  onPress={() => router.push('/measurements')} />
          <MeasurementCard label="Legs"  value={latest?.legs}  prevValue={prev?.legs}  onPress={() => router.push('/measurements')} />
        </View>
      </View>

      {/* ── Composition: Transformation ── */}
      <ProgressPhotos 
        firstPhoto={firstPhoto} 
        lastPhoto={lastPhoto} 
        isUploading={isUploading} 
        onTakePhoto={takePhoto} 
      />

      {/* ── Composition: Links ── */}
      <View style={s.section}>
        <TouchableOpacity style={s.linkCard} onPress={() => router.push('/workoutHistory')}>
          <Text style={s.linkTitle} maxFontSizeMultiplier={1.2}>Workout History</Text>
          <Text style={s.linkSub} maxFontSizeMultiplier={1.2}>View your past sessions and volume</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { paddingBottom: 110 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: T.spacing.page, paddingTop: 60, paddingBottom: T.spacing.px4,
  },
  headerSub: { fontSize: T.typography.sizes.bodyS, color: T.colors.t2, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: T.typography.sizes.h1, fontWeight: '700', color: T.colors.t1 },
  cameraBtn: {
    width: 40, height: 40, borderRadius: T.radii.md,
    backgroundColor: T.colors.forgeDim,
    borderWidth: 0.5, borderColor: 'rgba(255,92,46,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: T.spacing.px3,
  },
  measGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  linkCard: {
    backgroundColor: T.colors.bg1,
    borderWidth: 1, borderColor: T.colors.b1,
    borderRadius: T.radii.lg,
    padding: T.spacing.px4,
    alignItems: 'center', justifyContent: 'center',
  },
  linkTitle: { fontSize: T.typography.sizes.body, fontWeight: '700', color: T.colors.forge, marginBottom: 4 },
  linkSub: { fontSize: T.typography.sizes.caption, color: T.colors.t3 },
});
