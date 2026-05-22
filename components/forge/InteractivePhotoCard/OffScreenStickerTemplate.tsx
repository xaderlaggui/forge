import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { StickerTheme, getStickerColors } from './InteractivePhotoCardTypes';

interface OffScreenStickerTemplateProps {
  workout: any;
  stickerTheme: StickerTheme;
  shareViewShotRef: React.RefObject<any>;
}

export function OffScreenStickerTemplate({ workout, stickerTheme, shareViewShotRef }: OffScreenStickerTemplateProps) {
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
    <ViewShot
      ref={shareViewShotRef}
      // @ts-ignore - collapsable is required for React Fabric but missing from types
      collapsable={false}
      style={{
        position: 'absolute',
        left: -9999,
        width: 720,
        height: 720,
        backgroundColor: 'transparent',
        overflow: 'hidden',
      }}
      options={{ format: 'png', quality: 1.0 }}
    >
      {/* Stats Panel overlaid directly on the transparent canvas */}
      <View
        style={{
          position: 'absolute',
          top: 60,
          bottom: 60,
          left: 60,
          right: 60,
          padding: 40,
          justifyContent: 'center',
        }}
      >
        <LinearGradient
          colors={[stickerColors.gradientStart, stickerColors.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Header Row: Shoe Icon and Brand Wordmark */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={40} height={24} viewBox="0 0 36 22" fill="none">
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
            style={{
              color: stickerColors.brand,
              fontSize: 32,
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: 1.5,
              textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2.5,
            }}
          >
            FORGE
          </Text>
        </View>

        {/* Title: Activity notes or morning walk */}
        <Text
          style={{
            fontSize: 44,
            fontWeight: '900',
            color: stickerColors.text,
            marginBottom: 36,
            textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
            textShadowOffset: { width: 0, height: 1.5 },
            textShadowRadius: 3.5,
          }}
        >
          {workout.notes || 'Morning Workout'}
        </Text>

        {/* Stats Area (2-column layout matching Strava layout) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* Left Column: Distance & Steps */}
          <View style={{ flex: 1 }}>
            <View style={{ alignItems: 'flex-start' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: stickerColors.label,
                  marginBottom: 6,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Distance
              </Text>
              <Text
                style={{
                  fontSize: 64,
                  fontWeight: '900',
                  color: stickerColors.text,
                  lineHeight: 72,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                  textShadowOffset: { width: 0, height: 1.5 },
                  textShadowRadius: 3.5,
                }}
              >
                {workout.distanceKm || '0.00'}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '900',
                  color: stickerColors.text,
                  marginTop: 4,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                km
              </Text>
            </View>

            {workout.steps ? (
              <View style={{ alignItems: 'flex-start', marginTop: 32 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: stickerColors.label,
                    marginBottom: 6,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Steps
                </Text>
                <Text
                  style={{
                    fontSize: 64,
                    fontWeight: '900',
                    color: stickerColors.text,
                    lineHeight: 72,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                    textShadowOffset: { width: 0, height: 1.5 },
                    textShadowRadius: 3.5,
                  }}
                >
                  {Number(workout.steps).toLocaleString()}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Right Column: Time */}
          <View style={{ flex: 1 }}>
            <View style={{ alignItems: 'flex-start' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: stickerColors.label,
                  marginBottom: 6,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Time
              </Text>
              <Text
                style={{
                  fontSize: 64,
                  fontWeight: '900',
                  color: stickerColors.text,
                  lineHeight: 72,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                  textShadowOffset: { width: 0, height: 1.5 },
                  textShadowRadius: 3.5,
                }}
              >
                {timeParts.value}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '900',
                  color: stickerColors.text,
                  marginTop: 4,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {timeParts.unit}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ViewShot>
  );
}
