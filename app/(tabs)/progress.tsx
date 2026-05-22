import { useRouter } from 'expo-router';
import { AlertCircle, AlertTriangle, Check, History, Info } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Feature Modules
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { BodyMeasurementsCard } from '../../features/progress/components/BodyMeasurementsCard';
import { PhysiqueCoachBubble } from '../../features/progress/components/PhysiqueCoachBubble';
import { ProgressPhotos } from '../../features/progress/components/ProgressPhotos';
import { StatCard } from '../../features/progress/components/StatCard';
import { VolumeChart } from '../../features/progress/components/VolumeChart';
import { WeightChart } from '../../features/progress/components/WeightChart';
import { useProgressData } from '../../features/progress/hooks/useProgressData';

import { useScrollToHideNav } from '../../hooks/useScrollToHideNav';

export default function ProgressScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { onScroll } = useScrollToHideNav();

  const [weightTimeframe, setWeightTimeframe] = useState('7D');

  // Clean Architecture: Hook handles all formatting, storage logic, and firestore logic
  const {
    user,
    timeframe: volumeTimeframe, setTimeframe: setVolumeTimeframe,
    lineData, currentWeight, startWeight, weightDiff, minVal, maxVal,
    volumeLineData, weeklyVolumeData, monthlyVolumeData,
    currentVolume, volumeDiff, minVol, maxVol,
    activityDates,
    latest, prev,
    firstPhoto, lastPhoto,
    isUploading, takePhoto,
    weightUnit,
    bmiCalcText
  } = useProgressData(weightTimeframe);

  const bmi = user?.bmi ?? null;
  const bmiCategory = bmi === null ? '—'
    : bmi < 18.5 ? 'Low'
      : bmi < 25 ? 'Normal'
        : bmi < 30 ? 'High'
          : 'Obese';
  const bmiColor = bmi === null ? undefined
    : bmi < 18.5 ? '#42A5F5'  // blue — underweight
      : bmi < 25 ? '#4CAF50'  // green — normal
        : bmi < 30 ? '#FF9800'  // orange — overweight
          : '#F44336';              // red — obese
  const bmiIcon = bmi === null ? undefined
    : bmi < 18.5 ? Info
      : bmi < 25 ? Check
        : bmi < 30 ? AlertCircle
          : AlertTriangle;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} bounces={false}>

      {/* ── Composition: Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub} maxFontSizeMultiplier={1.2}>Your Journey</Text>
          <Text style={s.headerTitle} maxFontSizeMultiplier={1.2}>Progress</Text>
        </View>
        {/* Camera button */}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity
            style={s.cameraBtn}
            onPress={() => router.push('/workoutHistory')}
          >
            <History size={18} color={T.colors.t1} />
          </TouchableOpacity>
        </View>
      </View>
      {/* ── Composition: Key Stats ── */}
      <View style={s.statsRow}>
        {(() => {
          const rawGoal = (user as any)?.fitness_goal || (user as any)?.fitnessGoal;
          const goalDisplay = rawGoal === 'bulk' ? 'Bulking' : rawGoal === 'cut' ? 'Cutting' : rawGoal === 'maintain' ? 'Maintaining' : undefined;
          return (
            <>
              <StatCard label="Current" value={currentWeight} unit={weightUnit} delta={weightDiff} userGoal={rawGoal} />
              <StatCard label="Started" value={startWeight} unit={weightUnit} subText={goalDisplay} />
            </>
          );
        })()}
        <StatCard label="BMI" value={user?.bmi?.toFixed(1) ?? '—'} subText={bmiCategory} valueColor={bmiColor} Icon={bmiIcon} />
      </View>

      {/* ── Composition: Weight Chart ── */}
      <WeightChart
        timeframe={weightTimeframe}
        setTimeframe={setWeightTimeframe}
        weightDiff={weightDiff}
        lineData={lineData}
        minVal={minVal}
        maxVal={maxVal}
        weightUnit={weightUnit}
      />

      {/* ── Composition: Body Measurements ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Body Measurements</Text>
        <BodyMeasurementsCard
          latest={latest}
          prev={prev}
          onPressDetail={() => router.push('/measurements')}
        />
      </View>

      {/* ── Composition: Progressive Overload ── */}
      <VolumeChart
        volumeLineData={volumeLineData}
        weeklyVolumeData={weeklyVolumeData}
        monthlyVolumeData={monthlyVolumeData}
        currentVolume={currentVolume}
        volumeDiff={volumeDiff}
        minVol={minVol}
        maxVol={maxVol}
        timeframe={volumeTimeframe}
        setTimeframe={setVolumeTimeframe}
        weightUnit={weightUnit}
      />

      {/* ── Composition: Transformation ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Transformation</Text>
        <ProgressPhotos
          firstPhoto={firstPhoto}
          lastPhoto={lastPhoto}
          photosLength={(user as any)?.progress_photos?.length || 0}
          isUploading={isUploading}
          onTakePhoto={takePhoto}
        />

        <PhysiqueCoachBubble hasPhotos={!!(firstPhoto && lastPhoto)} onUploadPress={takePhoto} />
      </View>

    </ScrollView>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { paddingBottom: 30 },

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
