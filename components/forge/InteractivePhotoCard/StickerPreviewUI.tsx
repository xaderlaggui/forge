import { useForgeTheme } from '@/hooks/useForgeTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useStyles } from './InteractivePhotoCardStyles';
import { StickerTheme, getStickerColors } from './InteractivePhotoCardTypes';

interface StickerPreviewUIProps {
  workout: any;
  stickerTheme: StickerTheme;
}

export function StickerPreviewUI({ workout, stickerTheme }: StickerPreviewUIProps) {
  const { T, isDark } = useForgeTheme();
  const styles = useStyles(T, isDark);
  const stickerColors = getStickerColors(stickerTheme);

  const formatTimeParts = (minutes: number) => {
    if (!minutes || minutes <= 0) return { value: '0', unit: 'min' };
    if (minutes < 60) return { value: String(minutes), unit: 'min' };
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return { value: `${hrs}:${mins.toString().padStart(2, '0')}`, unit: 'hrs' };
  };
  const timeParts = formatTimeParts(workout.durationMin);

  return (
    <View style={[styles.modalStickerContainer, { padding: 30 }]}>
      <LinearGradient
        colors={[stickerColors.gradientStart, stickerColors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Header Row: Shoe Icon and Brand Wordmark */}
      <View style={styles.liveHeaderRow}>
        <View style={styles.liveShoeIcon}>
          <Svg width={18} height={11} viewBox="0 0 36 22" fill="none">
            <Path
              d="M2.5 13c0-3.5 2.5-6.5 5.5-6.5h1.5l3.5-4c1-1.2 2.8-1.5 4.2-0.7l6.8 3.7c1.5 0.8 2.5 2.4 2.5 4.1v1.9l4.5 0.5c1.7 0.2 3 1.6 3 3.3v1.2c0 1.9-1.5 3.5-3.4 3.5H7.5C4.7 20 2.5 17.8 2.5 15v-2z"
              stroke={stickerColors.shoe}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8.5 6.5c2 0 4 1.5 5.5 3m-4.5-3c1.5 0 3 1.5 4.5 3M17 2.5l-2.5 4M19.5 4l-2.5 4m9 5H13"
              stroke={stickerColors.shoe}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <Text
          style={[
            styles.liveBrandText,
            {
              fontSize: 16,
              color: stickerColors.brand,
              textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
            },
          ]}
        >
          FORGE
        </Text>
      </View>

      {/* Title: Activity notes or morning walk */}
      <Text
        style={[
          styles.liveNotes,
          {
            fontSize: 22,
            color: stickerColors.text,
            textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
          },
        ]}
      >
        {workout.notes || 'Morning Workout'}
      </Text>

      {/* Stats Area */}
      <View style={styles.liveGrid}>
        {/* Left Column: Distance & Steps */}
        <View style={styles.liveColumn}>
          <View style={styles.liveStatBox}>
            <Text
              style={[
                styles.liveStatLbl,
                {
                  fontSize: 11,
                  color: stickerColors.label,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                },
              ]}
            >
              Distance
            </Text>
            <Text
              style={[
                styles.liveStatVal,
                {
                  fontSize: 32,
                  lineHeight: 36,
                  color: stickerColors.text,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                },
              ]}
            >
              {workout.distanceKm || '0.00'}
            </Text>
            <Text
              style={[
                styles.liveStatUnit,
                {
                  fontSize: 14,
                  color: stickerColors.text,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                },
              ]}
            >
              km
            </Text>
          </View>

          {workout.pace ? (
            <View style={[styles.liveStatBox, { marginTop: 12 }]}>
              <Text
                style={[
                  styles.liveStatLbl,
                  {
                    fontSize: 11,
                    color: stickerColors.label,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  },
                ]}
              >
                Pace
              </Text>
              <Text
                style={[
                  styles.liveStatVal,
                  {
                    fontSize: 24,
                    lineHeight: 28,
                    color: stickerColors.text,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                  },
                ]}
              >
                {workout.pace.replace(/[^\d.]/g, '')}
              </Text>
              <Text
                style={[
                  styles.liveStatUnit,
                  {
                    fontSize: 14,
                    color: stickerColors.text,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  },
                ]}
              >
                km/h
              </Text>
            </View>
          ) : null}

          {workout.steps ? (
            <View style={[styles.liveStatBox, { marginTop: 12 }]}>
              <Text
                style={[
                  styles.liveStatLbl,
                  {
                    fontSize: 11,
                    color: stickerColors.label,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  },
                ]}
              >
                Steps
              </Text>
              <Text
                style={[
                  styles.liveStatVal,
                  {
                    fontSize: 32,
                    lineHeight: 36,
                    color: stickerColors.text,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                  },
                ]}
              >
                {Number(workout.steps).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right Column: Time */}
        <View style={styles.liveColumn}>
          <View style={styles.liveStatBox}>
            <Text
              style={[
                styles.liveStatLbl,
                {
                  fontSize: 11,
                  color: stickerColors.label,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                },
              ]}
            >
              Time
            </Text>
            <Text
              style={[
                styles.liveStatVal,
                {
                  fontSize: 32,
                  lineHeight: 36,
                  color: stickerColors.text,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                },
              ]}
            >
              {timeParts.value}
            </Text>
            <Text
              style={[
                styles.liveStatUnit,
                {
                  fontSize: 14,
                  color: stickerColors.text,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                },
              ]}
            >
              {timeParts.unit}
            </Text>
          </View>
          
          {workout.calories ? (
            <View style={[styles.liveStatBox, { marginTop: 12 }]}>
              <Text
                style={[
                  styles.liveStatLbl,
                  {
                    fontSize: 11,
                    color: stickerColors.label,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  },
                ]}
              >
                Calories
              </Text>
              <Text
                style={[
                  styles.liveStatVal,
                  {
                    fontSize: 32,
                    lineHeight: 36,
                    color: stickerColors.text,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                  },
                ]}
              >
                {workout.calories}
              </Text>
              <Text
                style={[
                  styles.liveStatUnit,
                  {
                    fontSize: 14,
                    color: stickerColors.text,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  },
                ]}
              >
                kcal
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
