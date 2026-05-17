import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { useRoutines, RoutineTemplate } from '../../../hooks/useRoutines';
import { ForgeSkeleton } from '../../../components/forge/ForgeSkeleton';
import { useForgeTheme } from "@/hooks/useForgeTheme";

function Badge({ split }: { split?: string }) {
    const { T } = useForgeTheme();
    const s = useS(T);
  if (!split) return null;
  const colors: Record<string, { bg: string, text: string }> = {
    push: { bg: 'rgba(255, 92, 46, 0.15)', text: '#FF5C2E' },
    pull: { bg: 'rgba(10, 132, 255, 0.15)', text: '#0A84FF' },
    legs: { bg: 'rgba(48, 209, 88, 0.15)', text: '#30D158' },
    full: { bg: 'rgba(191, 90, 242, 0.15)', text: '#BF5AF2' },
  };
  const c = colors[split] || { bg: T.colors.bg2, text: T.colors.t2 };
  
  return (
    <View style={[useS.badge, { backgroundColor: c.bg }]}>
      <Text style={[useS.badgeText, { color: c.text }]}>{split.toUpperCase()}</Text>
    </View>
  );
}

export function RoutineList() {
    const { T } = useForgeTheme();
    const s = useS(T);
  const router = useRouter();
  const { routines, isLoading } = useRoutines();

  if (isLoading) {
    return (
      <View style={useS.list}>
        <ForgeSkeleton width="100%" height={150} radius={T.radii.lg} style={{ marginBottom: 12 }} />
        <ForgeSkeleton width="100%" height={150} radius={T.radii.lg} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={useS.list} showsVerticalScrollIndicator={false}>
      <ForgeButton 
        label="+ Create Custom Routine" 
        onPress={() => router.push('/buildRoutine')} 
        style={{ marginBottom: T.spacing.px6 }}
      />

      {routines.length === 0 ? (
        <View style={useS.emptyState}>
          <Text style={useS.emptyText} maxFontSizeMultiplier={1.2}>
            You haven't built any custom routines yet.
          </Text>
        </View>
      ) : (
        routines.map(routine => (
          <View key={routine.id} style={useS.card}>
            <View style={useS.cardTop}>
              <Text style={useS.cardTitle}>{routine.name}</Text>
              <Badge split={routine.split} />
            </View>
            <Text style={useS.cardMeta}>
              {routine.exercises.length} exercises • ~{routine.exercises.length * 10} min
            </Text>
            
            <View style={useS.exList}>
              {routine.exercises.map((ex, idx) => (
                <View key={idx} style={useS.exRow}>
                  <View style={useS.exDot} />
                  <Text style={useS.exName} numberOfLines={1}>{ex.name}</Text>
                  <Text style={useS.exPreset}>{ex.preset || `${ex.sets}×${ex.reps}`}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={useS.startBtn}
              onPress={() => router.push({ pathname: '/activeWorkout', params: { routineId: routine.id } })}
              activeOpacity={0.8}
            >
              <Text style={useS.startBtnText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const useS = (T: any) => StyleSheet.create({
          list: { padding: T.spacing.page, paddingBottom: 100 },
          card: {
            backgroundColor: T.colors.bg1, padding: T.spacing.px4,
            borderRadius: 16, marginBottom: T.spacing.px3,
            borderWidth: 0.5, borderColor: T.colors.b1,
          },
          cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
          cardTitle: { fontSize: 16, fontWeight: '800', color: T.colors.t1 },
          badge: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3 },
          badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
          cardMeta: { fontSize: 12, color: T.colors.t3, marginBottom: 12 },
          
          exList: { gap: 6, marginBottom: 16 },
          exRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
          exDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.colors.b1, flexShrink: 0 },
          exName: { color: T.colors.t2, fontSize: 13, flex: 1 },
          exPreset: { color: T.colors.t3, fontSize: 11, fontWeight: '600' },

          startBtn: { backgroundColor: T.colors.forge, padding: 12, borderRadius: 12, alignItems: 'center' },
          startBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
          
          emptyState: { padding: T.spacing.px7, alignItems: 'center' },
          emptyText: {
            textAlign: 'center', color: T.colors.t3, fontWeight: '500',
            fontSize: T.typography.sizes.bodyS, lineHeight: T.typography.sizes.bodyS * 1.5,
          },
        });
