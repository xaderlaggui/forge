import { useForgeTheme } from "@/hooks/useForgeTheme";
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Camera, ChevronLeft, Share as ShareIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ForgeButton } from '../components/forge/ForgeButton';
import { InteractivePhotoCard } from '../components/forge/InteractivePhotoCard';
import { useWorkouts } from '../hooks/useWorkouts';
import { formatDuration } from '../utils/format';
import { StickerTheme } from '../components/forge/InteractivePhotoCard/InteractivePhotoCardTypes';
import { StickerShareModal } from '../components/forge/InteractivePhotoCard/StickerShareModal';
import { OffScreenStickerTemplate } from '../components/forge/InteractivePhotoCard/OffScreenStickerTemplate';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { T } = useForgeTheme();
  const s = useStyles(T);
  const { workouts, updateWorkout } = useWorkouts();
  const { user } = useAuthStore();

  const workout = workouts.find((w) => w.id === id);
  const viewShotRef = useRef<ViewShot>(null);
  const shareViewShotRef = useRef<ViewShot>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(workout?.photoUrl || null);
  const [useLbs, setUseLbs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stickerTheme, setStickerTheme] = useState<StickerTheme>('white');
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (workout && workout.photoUrl) {
      setPhotoUri(workout.photoUrl);
    }
  }, [workout]);

  if (!workout) {
    return (
      <View style={s.container}>
        <View style={s.headerMinimal}>
          <TouchableOpacity onPress={() => router.back()} style={s.borderedBackBtn}>
            <ChevronLeft size={20} color={T.colors.t1} />
          </TouchableOpacity>
        </View>
        <Text style={[s.title, { padding: 20 }]}>Workout not found</Text>
      </View>
    );
  }

  const isCardio = workout.type === 'run' || workout.type === 'walk' || workout.type === 'cardio';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // PRESERVE ORIGINAL DIMENSIONS
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);

      if (user?.uid) {
        setIsUploading(true);
        try {
          // 1. Read local file as base64
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // 2. Decode base64 to bytes
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          // 3. Upload to Supabase Storage bucket 'progress'
          const path = `workouts/${user.uid}/${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('progress')
            .upload(path, bytes, { contentType: 'image/jpeg' });

          if (uploadError) throw uploadError;

          // 4. Retrieve remote URL
          const { data: { publicUrl } } = supabase.storage
            .from('progress')
            .getPublicUrl(path);

          setPhotoUri(publicUrl);
          if (updateWorkout) {
            await updateWorkout({ ...workout, photoUrl: publicUrl });
          }
        } catch (e) {
          console.error('Error uploading photo to Supabase:', e);
          alert('Failed to save to cloud. Saved locally instead.');
          if (updateWorkout) {
            updateWorkout({ ...workout, photoUrl: uri });
          }
        } finally {
          setIsUploading(false);
        }
      } else {
        if (updateWorkout) {
          updateWorkout({ ...workout, photoUrl: uri });
        }
      }
    }
  };

  const openShareModal = () => setIsShareModalVisible(true);

  const handleShareExport = async (): Promise<void> => {
    setIsSharing(true);
    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (!shareViewShotRef.current?.capture) return;
      const uri = await shareViewShotRef.current.capture();
      await Sharing.shareAsync(uri, { dialogTitle: 'Share Workout' });
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      setIsSharing(false);
    }
  };

  // Calculations for Strength
  let totalVolumeKg = 0;
  workout.exercises?.forEach(ex => {
    ex.sets.forEach(set => {
      totalVolumeKg += (set.weight || 0) * (set.reps || 0);
    });
  });
  const totalVolume = useLbs ? Math.round(totalVolumeKg * 2.20462) : totalVolumeKg;

  const getActivityPlaceholder = (type?: string, notes?: string) => {
    const n = (notes || '').toLowerCase();
    const t = (type || '').toLowerCase();
    if (t === 'run' || n.includes('run')) return 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000&auto=format&fit=crop';
    if (t === 'cycle' || t === 'ride' || n.includes('cycle') || n.includes('bike')) return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop';
    if (n.includes('yoga') || n.includes('stretch')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop';
    if (t === 'walk' || n.includes('walk')) return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=1000&auto=format&fit=crop';
    // Default moody fitness background
    return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
  };

  const displayPhotoUri = photoUri || getActivityPlaceholder(workout.type, workout.notes);

  const renderCardioView = () => (
    <View style={{ flex: 1 }}>
      {photoUri ? (
        <ViewShot ref={viewShotRef} style={{ flex: 1, backgroundColor: '#0F0F12' }} options={{ format: 'jpg', quality: 0.9 }}>
          <InteractivePhotoCard
            photoUri={photoUri}
            workout={workout}
            pickImage={pickImage}
            shareImage={openShareModal}
            isUploading={isUploading}
            shareViewShotRef={shareViewShotRef}
          />
        </ViewShot>
      ) : (
        <View style={s.cardioContainer}>
          <ViewShot ref={viewShotRef} style={{ backgroundColor: T.colors.bg1, ...T.shadows.lift, borderRadius: T.radii.lg }} options={{ format: 'jpg', quality: 0.9 }}>
            <View style={[s.shareCard, { backgroundColor: T.colors.bg2, justifyContent: 'center', alignItems: 'center' }]}>
              <Image source={{ uri: displayPhotoUri }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>Tap 'Add Photo' to customize</Text>
              </View>
            </View>
          </ViewShot>

          <View style={s.cardioDetails}>
            <Text style={s.cTitle}>{workout.notes || 'Morning Activity'}</Text>
            <Text style={s.cDate}>{dayjs(workout.date).format('MMM D, YYYY')}</Text>

            <View style={s.cGrid}>
              <View style={s.cGridItem}>
                <Text style={s.cLabel}>Distance</Text>
                <Text style={s.cMainVal}>{workout.distanceKm || 0} km</Text>
              </View>
              <View style={s.cGridItem}>
                <Text style={s.cLabel}>Moving Time</Text>
                <Text style={s.cVal}>{formatDuration(workout.durationMin)}</Text>
              </View>
              <View style={s.cGridItem}>
                <Text style={s.cLabel}>Steps</Text>
                <Text style={s.cVal}>{workout.steps || 0}</Text>
              </View>
              <View style={s.cGridItem}>
                <Text style={s.cLabel}>Elevation Gain</Text>
                <Text style={s.cVal}>{workout.elevationGain || 0} m</Text>
              </View>
            </View>

            <View style={s.actions}>
              <ForgeButton
                label="Add Photo"
                leftIcon={<Camera size={18} color={T.colors.forge} />}
                onPress={pickImage}
                variant="secondary"
                style={{ flex: 1, marginRight: 8 }}
                disabled={isUploading}
              />
              <ForgeButton
                label="Share"
                leftIcon={<ShareIcon size={18} color="#000" />}
                onPress={openShareModal}
                disabled={false}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderStrengthView = () => (
    <View style={s.strengthContainer}>
      <Text style={s.sTitle}>{workout.notes || 'Strength Workout'}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Text style={s.sDate}>{dayjs(workout.date).format('dddd, MMM D, YYYY')}</Text>
        <View style={s.tagPill}>
          <Text style={s.tagText}>{workout.exercises?.length ?? 0} Exercises</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={s.sStatsGrid}>
        <View style={s.sStatCard}>
          <Text style={[s.sStatVal, (workout.durationMin ?? 0) >= 60 && { fontSize: 16 }]}>
            {formatDuration(workout.durationMin ?? 0)}
          </Text>
          <Text style={s.sStatLbl}>DURATION</Text>
        </View>
        <View style={s.sStatCard}>
          <Text style={s.sStatVal}>{totalVolume.toLocaleString()}</Text>
          <Text style={s.sStatLbl}>VOL ({useLbs ? 'LBS' : 'KG'})</Text>
        </View>
        <View style={s.sStatCard}>
          <Text style={s.sStatVal}>{workout.exercises?.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 0}</Text>
          <Text style={s.sStatLbl}>SETS</Text>
        </View>
        <TouchableOpacity style={[s.sStatCard, { borderColor: T.colors.forge + '40' }]} onPress={() => setUseLbs(!useLbs)}>
          <Text style={[s.sStatVal, { fontSize: 14 }]}>{useLbs ? 'LBS' : 'KG'}</Text>
          <Text style={s.sStatLbl}>UNIT</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.listHeader}>Exercises</Text>
      {workout.exercises?.map((ex, idx) => (
        <View key={idx} style={s.exRow}>
          <View style={s.exHeader}>
            <View style={s.exNumBadge}>
              <Text style={s.exNumText}>{idx + 1}</Text>
            </View>
            <Text style={s.exName}>{ex.name}</Text>
          </View>
          {/* Column headers */}
          <View style={s.setHeaderRow}>
            <Text style={s.setHeaderText}>SET</Text>
            <Text style={s.setHeaderText}>WEIGHT</Text>
            <Text style={s.setHeaderText}>REPS</Text>
          </View>
          {ex.sets.map((set, sIdx) => {
            const weight = useLbs ? Math.round((set.weight || 0) * 2.20462) : (set.weight || 0);
            return (
              <View key={sIdx} style={s.setRow}>
                <Text style={s.setNum}>{sIdx + 1}</Text>
                <Text style={s.setWeight}>{weight} {useLbs ? 'lbs' : 'kg'}</Text>
                <Text style={s.setReps}>{set.reps} reps</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.headerMinimal}>
        <TouchableOpacity style={s.borderedBackBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={T.colors.t1} />
        </TouchableOpacity>
      </View>
      {isCardio && photoUri ? (
        renderCardioView()
      ) : (
        <ScrollView contentContainerStyle={[s.content, { paddingTop: 110 }]} bounces={false}>
          {isCardio ? renderCardioView() : renderStrengthView()}
        </ScrollView>
      )}

      {/* Render the offscreen template and modal globally so they work in both states */}
      <OffScreenStickerTemplate
        workout={workout}
        stickerTheme={stickerTheme}
        shareViewShotRef={shareViewShotRef}
      />
      <StickerShareModal
        isVisible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        workout={workout}
        stickerTheme={stickerTheme}
        setStickerTheme={setStickerTheme}
        shareImage={handleShareExport}
        isSharing={isSharing}
        shareViewShotRef={shareViewShotRef}
      />
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  headerMinimal: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingTop: 54, paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 99,
  },
  borderedBackBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    borderWidth: 1, borderColor: T.colors.b1,
    backgroundColor: T.colors.bg1 + 'CC', // slightly translucent
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: '700', color: T.colors.t1 },
  content: { paddingBottom: 40 },

  // Cardio
  cardioContainer: {},
  shareCard: { width: '100%', aspectRatio: 1, position: 'relative', overflow: 'hidden' },
  darkGradient: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 300,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  routeLineOverlay: { ...StyleSheet.absoluteFillObject },
  shareStatsRow: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  shareCol: { alignItems: 'flex-start' },
  shareLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  shareVal: { fontSize: 24, color: '#FFF', fontWeight: '800' },
  brandText: { position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  cardioDetails: { padding: 20 },
  cTitle: { fontSize: 24, fontWeight: '800', color: T.colors.t1, marginBottom: 4 },
  cDate: { fontSize: 14, color: T.colors.t3, marginBottom: 20 },
  cGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  cGridItem: { width: '50%', marginBottom: 16 },
  cLabel: { fontSize: 12, color: T.colors.t3, marginBottom: 4 },
  cMainVal: { fontSize: 32, fontWeight: '800', color: T.colors.t1 },
  cVal: { fontSize: 20, fontWeight: '700', color: T.colors.t1 },

  actions: { flexDirection: 'row', marginTop: 10 },

  // Strength
  strengthContainer: { padding: 20, paddingBottom: 40 },
  sTitle: { fontSize: 26, fontWeight: '900', color: T.colors.t1, marginBottom: 4 },
  sDate: { fontSize: 13, color: T.colors.t3 },
  tagPill: { backgroundColor: T.colors.forgeDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { color: T.colors.forge, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  sStatsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    marginBottom: 28,
  },
  sStatCard: {
    flex: 1, minWidth: '40%',
    backgroundColor: T.colors.bg1, ...T.shadows.lift, borderRadius: T.radii.lg,
    borderWidth: 0.5, borderColor: T.colors.b1,
    paddingVertical: 16, paddingHorizontal: 12,
    alignItems: 'center',
  },
  sStatVal: { fontSize: 22, fontWeight: '900', color: T.colors.t1, marginBottom: 4 },
  sStatLbl: { fontSize: 9, fontWeight: '800', color: T.colors.t3, letterSpacing: 1, textTransform: 'uppercase' },

  listHeader: { fontSize: 13, fontWeight: '700', color: T.colors.t3, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },
  exRow: { marginBottom: 14, backgroundColor: T.colors.bg1, ...T.shadows.lift, borderRadius: T.radii.xl, borderWidth: 0.5, borderColor: T.colors.b1, overflow: 'hidden' },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 10 },
  exNumBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: T.colors.forgeDim, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontSize: 11, fontWeight: '800', color: T.colors.forge },
  exName: { fontSize: 15, fontWeight: '700', color: T.colors.t1, flex: 1 },

  setHeaderRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 6, backgroundColor: T.colors.bg2, borderTopWidth: 0.5, borderTopColor: T.colors.b1 },
  setHeaderText: { flex: 1, fontSize: 9, fontWeight: '800', color: T.colors.t3, letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center' },
  setRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: T.colors.b1 },
  setNum: { flex: 1, fontSize: 13, color: T.colors.t3, fontWeight: '600', textAlign: 'center' },
  setWeight: { flex: 1, fontSize: 14, color: T.colors.t1, fontWeight: '700', textAlign: 'center' },
  setReps: { flex: 1, fontSize: 14, color: T.colors.forge, fontWeight: '700', textAlign: 'center' },
});
