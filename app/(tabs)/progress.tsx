import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Camera, ChevronRight, Minus, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ForgeButton } from '../../components/forge/ForgeButton';
import { ForgeTheme as T } from '../../constants/ForgeTheme';
import { db, storage } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';

const SCREEN_W = Dimensions.get('window').width;

// ─── Types ─────────────────────────────────────────────────

interface WeightEntry { value: number; date: string }
interface MeasurementEntry { chest?: number; waist?: number; arms?: number; legs?: number }
interface StatCardProps { label: string; value: string | number; unit?: string; delta?: number; onPress?: () => void }

// ─── Sub-components ────────────────────────────────────────

function StatCard({ label, value, unit, delta, onPress }: StatCardProps) {
  const isDown = delta !== undefined && delta < 0;
  const isUp   = delta !== undefined && delta > 0;
  return (
    <TouchableOpacity style={sc.card} onPress={onPress} activeOpacity={0.75}>
      <Text style={sc.label} maxFontSizeMultiplier={1.2}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
        <Text style={sc.value} maxFontSizeMultiplier={1.2}>{value}</Text>
        {unit && <Text style={sc.unit} maxFontSizeMultiplier={1.2}>{unit}</Text>}
      </View>
      {delta !== undefined && (
        <View style={[sc.badge, isDown && sc.badgeDown, isUp && sc.badgeUp]}>
          {isDown ? <TrendingDown size={10} color={T.colors.green} /> : isUp ? <TrendingUp size={10} color={T.colors.red} /> : <Minus size={10} color={T.colors.t3} />}
          <Text style={[sc.badgeText, isDown && { color: T.colors.green }, isUp && { color: T.colors.red }]} maxFontSizeMultiplier={1.2}>
            {Math.abs(delta)} lbs
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: T.colors.bg1,
    borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1, padding: 14,
  },
  label: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t3, textTransform: 'uppercase', letterSpacing: 0.7 },
  value: { fontSize: 22, fontWeight: '800', color: T.colors.t1 },
  unit: { fontSize: T.typography.sizes.bodyS, color: T.colors.t2, fontWeight: '500' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: T.radii.full,
    backgroundColor: T.colors.bg2,
  },
  badgeDown: { backgroundColor: T.colors.greenDim },
  badgeUp:   { backgroundColor: T.colors.redDim  },
  badgeText: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t3 },
});

// ─── Measurement Card ───────────────────────────────────────

interface MeasCardProps { label: string; value?: number; prevValue?: number; onPress: () => void }
function MeasCard({ label, value, prevValue, onPress }: MeasCardProps) {
  const delta = value && prevValue ? +(value - prevValue).toFixed(1) : undefined;
  return (
    <TouchableOpacity style={measS.card} onPress={onPress} activeOpacity={0.75}>
      <Text style={measS.label} maxFontSizeMultiplier={1.2}>{label}</Text>
      <Text style={measS.val} maxFontSizeMultiplier={1.2}>{value ?? '—'}</Text>
      <Text style={measS.unit} maxFontSizeMultiplier={1.2}>inches</Text>
      {delta !== undefined && (
        <View style={[measS.badge, delta < 0 && measS.badgeDown, delta > 0 && measS.badgeUp]}>
          <Text style={[measS.badgeText, delta < 0 && { color: T.colors.green }, delta > 0 && { color: T.colors.red }]} maxFontSizeMultiplier={1.2}>
            {delta > 0 ? '+' : ''}{delta} in
          </Text>
        </View>
      )}
      <View style={measS.row}>
        <Text style={measS.updateText} maxFontSizeMultiplier={1.2}>Update</Text>
        <ChevronRight size={12} color={T.colors.forge} />
      </View>
    </TouchableOpacity>
  );
}

const measS = StyleSheet.create({
  card: {
    width: '48%', backgroundColor: T.colors.bg1,
    borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1, padding: 14,
  },
  label: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t3, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 },
  val: { fontSize: 24, fontWeight: '800', color: T.colors.t1 },
  unit: { fontSize: T.typography.sizes.label, color: T.colors.t2, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start', marginTop: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: T.radii.full,
    backgroundColor: T.colors.bg2,
  },
  badgeDown: { backgroundColor: T.colors.greenDim },
  badgeUp:   { backgroundColor: T.colors.redDim  },
  badgeText: { fontSize: 9, fontWeight: '700', color: T.colors.t3 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 2 },
  updateText: { fontSize: T.typography.sizes.label, color: T.colors.forge, fontWeight: '600' },
});

// ─── Main Screen ───────────────────────────────────────────

const TIMEFRAMES = ['7D', '1M', '3M', 'YTD'];

export default function ProgressScreen() {
  const router = useRouter();
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
    { value: user?.weight || 186, date: 'May 29' },
  ];
  const rawHistory: WeightEntry[] = user?.weightHistory?.length ? user.weightHistory : fallbackHistory;
  const lineData = rawHistory.map(item => ({ value: item.value, label: item.date.slice(0, 5) }));

  const currentWeight = rawHistory[rawHistory.length - 1].value;
  const startWeight   = rawHistory[0].value;
  const weightDiff    = +(currentWeight - startWeight).toFixed(1);

  const minVal = Math.min(...rawHistory.map(r => r.value));
  const maxVal = Math.max(...rawHistory.map(r => r.value));

  // ── Measurements ──
  const measurements: MeasurementEntry[] = user?.measurements?.length
    ? user.measurements
    : [{ chest: 41.5, waist: 33.0, arms: 15.2, legs: 24.8 }];
  const latest = measurements[measurements.length - 1];
  const prev   = measurements.length > 1 ? measurements[measurements.length - 2] : undefined;

  // ── Photos ──
  const photos = user?.progressPhotos?.length
    ? user.progressPhotos
    : [
        { url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80', date: '2026-01-01' },
        { url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80', date: new Date().toISOString() },
      ];
  const firstPhoto = photos[0];
  const lastPhoto  = photos[photos.length - 1];

  // ── Camera ──
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { alert('Camera permission required.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.6 });
    if (!result.canceled) uploadPhoto(result.assets[0].uri);
  };

  const uploadPhoto = async (uri: string) => {
    setIsUploading(true);
    try {
      // Read the local file as base64 (works reliably in Expo for file:// URIs)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 string → Uint8Array for Firebase uploadBytes
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const photoRef = ref(
        storage,
        `users/${user?.uid}/progress/${Date.now()}.jpg`
      );
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

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
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

      {/* ── Key Stats Row ── */}
      <View style={s.statsRow}>
        <StatCard label="Current" value={currentWeight} unit="lbs" delta={weightDiff} />
        <StatCard label="Started" value={startWeight} unit="lbs" />
        <StatCard label="BMI" value={user?.bmi?.toFixed(1) ?? '—'} />
      </View>

      {/* ── Weight Chart ── */}
      <View style={s.section}>
        {/* Timeframe pills */}
        <View style={s.tfRow}>
          {TIMEFRAMES.map(tf => (
            <TouchableOpacity
              key={tf}
              style={[s.tfPill, timeframe === tf && s.tfPillActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[s.tfText, timeframe === tf && s.tfTextActive]} maxFontSizeMultiplier={1.2}>{tf}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.chartCard}>
          <View style={s.chartHeader}>
            <Text style={s.chartTitle} maxFontSizeMultiplier={1.2}>Weight Trend</Text>
            <View style={[s.deltaBadge, weightDiff <= 0 ? s.deltaBadgeDown : s.deltaBadgeUp]}>
              {weightDiff <= 0 ? <TrendingDown size={12} color={T.colors.green} /> : <TrendingUp size={12} color={T.colors.red} />}
              <Text style={[s.deltaBadgeText, weightDiff <= 0 ? { color: T.colors.green } : { color: T.colors.red }]} maxFontSizeMultiplier={1.2}>
                {weightDiff > 0 ? '+' : ''}{weightDiff} lbs
              </Text>
            </View>
          </View>
          <View style={{ marginLeft: -16, marginRight: -4 }}>
            <LineChart
              data={lineData}
              areaChart
              hideDataPoints
              color={T.colors.forge}
              thickness={2.5}
              startFillColor={T.colors.forge}
              endFillColor={T.colors.forge}
              startOpacity={0.18}
              endOpacity={0}
              xAxisColor={T.colors.b1}
              yAxisColor="transparent"
              yAxisTextStyle={{ color: T.colors.t3, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: T.colors.t3, fontSize: 10 }}
              hideRules
              yAxisOffset={minVal - 5}
              maxValue={maxVal - minVal + 10}
              noOfSections={4}
              stepValue={Math.ceil((maxVal - minVal) / 4)}
              height={140}
              width={SCREEN_W - 72}
            />
          </View>
        </View>
      </View>

      {/* ── Body Measurements ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Body Measurements</Text>
        <View style={s.measGrid}>
          <MeasCard label="Chest"  value={latest.chest}  prevValue={prev?.chest}  onPress={() => router.push('/measurements')} />
          <MeasCard label="Waist"  value={latest.waist}  prevValue={prev?.waist}  onPress={() => router.push('/measurements')} />
          <MeasCard label="Arms"   value={latest.arms}   prevValue={prev?.arms}   onPress={() => router.push('/measurements')} />
          <MeasCard label="Legs"   value={latest.legs}   prevValue={prev?.legs}   onPress={() => router.push('/measurements')} />
        </View>
      </View>

      {/* ── Transformation Photos ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel} maxFontSizeMultiplier={1.2}>Transformation</Text>
        <View style={s.photoGrid}>
          {[{ photo: firstPhoto, badge: 'Before' }, { photo: lastPhoto, badge: 'Current' }].map(({ photo, badge }) => (
            <View key={badge} style={s.photoCard}>
              <Image source={{ uri: photo.url }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
              <View style={s.photoBadgeWrap}>
                <Text style={s.photoBadgeText} maxFontSizeMultiplier={1.2}>{badge}</Text>
              </View>
            </View>
          ))}
        </View>

        <ForgeButton
          label={isUploading ? 'Saving…' : 'Take Progress Photo'}
          onPress={takePhoto}
          disabled={isUploading}
          variant="secondary"
          leftIcon={<Camera size={15} color={T.colors.forge} />}
        />
      </View>

    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  content: { paddingBottom: 110 },

  // Header
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

  // Stats row
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: T.spacing.page, marginBottom: T.spacing.px5 },

  // Section
  section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
  sectionLabel: {
    fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: T.spacing.px3,
  },

  // Timeframe
  tfRow: { flexDirection: 'row', gap: 6, marginBottom: T.spacing.px3 },
  tfPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: T.radii.full,
    backgroundColor: T.colors.bg2,
  },
  tfPillActive: { backgroundColor: T.colors.forge },
  tfText: { fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3 },
  tfTextActive: { color: '#fff' },

  // Chart
  chartCard: {
    backgroundColor: T.colors.bg1,
    borderRadius: T.radii.xl, borderWidth: 0.5, borderColor: T.colors.b1,
    padding: T.spacing.px4, overflow: 'hidden',
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: T.spacing.px3 },
  chartTitle: { fontSize: T.typography.sizes.body, fontWeight: '600', color: T.colors.t1 },
  deltaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: T.radii.full,
    backgroundColor: T.colors.bg2,
  },
  deltaBadgeDown: { backgroundColor: T.colors.greenDim },
  deltaBadgeUp:   { backgroundColor: T.colors.redDim  },
  deltaBadgeText: { fontSize: T.typography.sizes.label, fontWeight: '700' },

  // Measurements
  measGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  // Photos
  photoGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  photoCard: {
    flex: 1, aspectRatio: 0.72,
    backgroundColor: T.colors.bg2,
    borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  photoBadgeWrap: {
    paddingVertical: 8, paddingHorizontal: 10,
    backgroundColor: 'rgba(10,10,11,0.75)',
  },
  photoBadgeText: {
    fontSize: T.typography.sizes.caption, fontWeight: '700', color: T.colors.t2,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
});
