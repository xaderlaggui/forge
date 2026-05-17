import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Flame, Droplet, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useNutrition } from '../../hooks/useNutrition';
import { useAiCoach } from '../../hooks/useAiCoach';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: nutrition, isLoading } = useNutrition();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D2FF00" />
      </View>
    );
  }

  const waterLiters = ((nutrition?.waterMl || 0) / 1000).toFixed(1);
  const activeCals = nutrition?.totalCalories || 0; // Using consumed for now until workout hook is ready
  
  // Goals
  const waterGoal = 2.4;
  const calGoal = 2400;

  // SVG Ring Calculations
  const r = 40;
  const c = 2 * Math.PI * r;
  const waterPercent = Math.min(parseFloat(waterLiters) / waterGoal, 1);
  const calPercent = Math.min(activeCals / calGoal, 1);
  
  const waterOffset = c - (waterPercent * c);
  const calOffset = c - (calPercent * c);

  const { data: aiTip, isLoading: isAiLoading } = useAiCoach();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user?.photoURL || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' }} 
              style={styles.avatar} 
            />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.greetingText}>GOOD MORNING</Text>
            <Text style={styles.nameText}>{user?.displayName || 'Athlete'}</Text>
          </View>
        </View>

        <View style={styles.streakBadge}>
          <Flame size={16} color="#D2FF00" />
          <Text style={styles.streakText}>{user?.streak || 0}</Text>
        </View>
      </View>

      {/* AI Coach Widget */}
      <View style={styles.aiContainer}>
        {/* Glow effect faked with LinearGradient */}
        <LinearGradient 
          colors={['rgba(210,255,0,0.15)', 'transparent']} 
          style={styles.aiGlow} 
        />
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconWrapper}>
              <Text style={styles.aiIconText}>AI</Text>
            </View>
            <Text style={styles.aiTitle}>AI COACH</Text>
          </View>
          {isAiLoading ? (
             <ActivityIndicator size="small" color="#D2FF00" style={{ alignSelf: 'flex-start' }} />
          ) : (
            <Text style={styles.aiMessage}>
              {aiTip?.split(/(\*.*?\*|`.*?`)/g).map((chunk: string, i: number) => {
                if (chunk.startsWith('*') && chunk.endsWith('*')) {
                  return <Text key={i} style={{ color: '#fff', fontWeight: 'bold' }}>{chunk.slice(1, -1)}</Text>;
                }
                return chunk;
              })}
            </Text>
          )}
        </View>
      </View>

      {/* Quick Metrics */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>DAILY PROGRESS</Text>
        
        <View style={styles.grid}>
          {/* Water Intake */}
          <View style={styles.metricCard}>
            <View style={styles.ringPlaceholder}>
              <Svg height="96" width="96" viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx="50" cy="50" r={r} fill="transparent" stroke="#16161A" strokeWidth="8" />
                <Circle cx="50" cy="50" r={r} fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray={c} strokeDashoffset={waterOffset} strokeLinecap="round" />
              </Svg>
              <View style={styles.ringCenterText}>
                <Droplet size={18} color="#3b82f6" style={{ marginBottom: 2 }} />
                <Text style={styles.ringValue}>{waterLiters}L</Text>
              </View>
            </View>
            <Text style={styles.metricLabel}>WATER</Text>
          </View>

          {/* Activity / Calories */}
          <View style={styles.metricCard}>
            <View style={styles.ringPlaceholder}>
              <Svg height="96" width="96" viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx="50" cy="50" r={r} fill="transparent" stroke="#16161A" strokeWidth="8" />
                <Circle cx="50" cy="50" r={r} fill="transparent" stroke="#D2FF00" strokeWidth="8" strokeDasharray={c} strokeDashoffset={calOffset} strokeLinecap="round" />
              </Svg>
              <View style={styles.ringCenterText}>
                <Activity size={18} color="#D2FF00" style={{ marginBottom: 2 }} />
                <Text style={styles.ringValue}>{activeCals}</Text>
              </View>
            </View>
            <Text style={styles.metricLabel}>ACTIVE CAL</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0C0E' },
  scrollContent: { padding: 24, paddingTop: 48 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#242429' },
  onlineDot: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, backgroundColor: '#22c55e', borderRadius: 7, borderWidth: 2, borderColor: '#0C0C0E' },
  greetingText: { color: '#8A8A93', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  nameText: { color: '#FFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#16161A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#242429', shadowColor: '#D2FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  streakText: { color: '#D2FF00', fontWeight: '900', fontSize: 16 },

  aiContainer: { position: 'relative', marginBottom: 32 },
  aiGlow: { position: 'absolute', inset: -2, borderRadius: 20 },
  aiCard: { backgroundColor: '#16161A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#242429' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  aiIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0C0C0E', borderWidth: 1, borderColor: '#242429', alignItems: 'center', justifyContent: 'center' },
  aiIconText: { color: '#D2FF00', fontSize: 10, fontWeight: '900' },
  aiTitle: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  aiMessage: { color: '#8A8A93', fontSize: 14, lineHeight: 22 },

  metricsSection: { marginBottom: 32 },
  sectionTitle: { color: '#8A8A93', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 16 },
  metricCard: { flex: 1, backgroundColor: '#16161A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#242429', alignItems: 'center' },
  
  ringPlaceholder: { width: 96, height: 96, marginBottom: 12, position: 'relative' },
  ringCenterText: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringValue: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  metricLabel: { color: '#8A8A93', fontSize: 11, fontWeight: '700', letterSpacing: 1 }
});
