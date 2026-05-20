import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { Camera, Share2 } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useStyles } from './InteractivePhotoCardStyles';
import { formatDuration } from '../../../utils/format';

interface StatsPanelProps {
  workout: any;
  pickImage: () => void;
  openShareModal: () => void;
  isUploading: boolean;
  animatedStatsStyle: any;
}

export function StatsPanel({
  workout,
  pickImage,
  openShareModal,
  isUploading,
  animatedStatsStyle,
}: StatsPanelProps) {
  const { T, isDark } = useForgeTheme();
  const styles = useStyles(T, isDark);

  return (
    <Animated.View style={[styles.statsPanel, animatedStatsStyle]}>
      <Text style={styles.workoutNotes}>{workout.notes || 'Morning Workout'}</Text>
      <Text style={styles.workoutDate}>{dayjs(workout.date).format('dddd, MMM D, YYYY')}</Text>

      {/* Reverted Stats Grid layout */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DISTANCE</Text>
          <Text style={styles.statValue}>{workout.distanceKm || '0.00'} km</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{formatDuration(workout.durationMin)}</Text>
        </View>
        {workout.steps ? (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>STEPS</Text>
            <Text style={styles.statValue}>{Number(workout.steps).toLocaleString()}</Text>
          </View>
        ) : null}
      </View>

      {/* Premium CTA Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={pickImage} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="small" color={T.colors.forge} />
          ) : (
            <>
              <Camera size={16} color={T.colors.forge} style={{ marginRight: 6 }} />
              <Text style={styles.btnTextSecondary}>Change Photo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtnPrimary} onPress={openShareModal}>
          <Share2 size={16} color="#000" style={{ marginRight: 6 }} />
          <Text style={styles.btnTextPrimary}>Share Sticker</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
