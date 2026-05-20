import { useForgeTheme } from '@/hooks/useForgeTheme';
import dayjs from 'dayjs';
import { Camera, ChevronUp, Share2, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { formatDuration } from '../../utils/format';

interface InteractivePhotoCardProps {
  photoUri: string;
  workout: any;
  pickImage: () => void;
  shareImage: () => void;
  isUploading: boolean;
  shareViewShotRef: React.RefObject<any>;
}

export function InteractivePhotoCard({
  photoUri,
  workout,
  pickImage,
  shareImage,
  isUploading,
  shareViewShotRef,
}: InteractivePhotoCardProps) {
  const { T, isDark } = useForgeTheme();
  const styles = useStyles(T, isDark);

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [stickerTheme, setStickerTheme] = useState<'white' | 'dark' | 'orange'>('white');

  // Animation values
  const swipeProgress = useSharedValue(0);
  const activeState = useSharedValue(0); // 0 = resting (cover), 1 = swiped up (contain)
  const startY = useSharedValue(0);

  // Fetch image dimensions to compute exact cover scale factor
  useEffect(() => {
    if (photoUri) {
      Image.getSize(
        photoUri,
        (w, h) => {
          if (w && h) {
            setImageAspect(w / h);
          }
        },
        (error) => {
          console.warn('Failed to retrieve image size, using fallback aspect ratio', error);
          setImageAspect(1.0); // Fallback to square
        }
      );
    }
  }, [photoUri]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  // Calculations for scale
  const cardWidth = layout.width || Dimensions.get('window').width;
  const cardHeight = layout.height || 480;
  const cardAspect = cardWidth / cardHeight;

  // Mathematically exact scale factor to cover the container in contain mode
  let coverScale = 1.5; // fallback
  if (imageAspect) {
    coverScale = imageAspect > cardAspect ? imageAspect / cardAspect : cardAspect / imageAspect;
  }

  // Fluid spring configuration
  const springConfig = {
    damping: 18,
    stiffness: 120,
    mass: 0.8,
  };

  // Swipe gesture detector (Pan)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = swipeProgress.value;
    })
    .onUpdate((event) => {
      const dragDistance = 160; // distance required to complete swipe
      if (activeState.value === 0) {
        const progress = -event.translationY / dragDistance;
        swipeProgress.value = Math.max(0, Math.min(1, progress));
      } else {
        const progress = 1 - (event.translationY / dragDistance);
        swipeProgress.value = Math.max(0, Math.min(1, progress));
      }
    })
    .onEnd((event) => {
      if (activeState.value === 0) {
        if (event.velocityY < -300 || swipeProgress.value > 0.4) {
          swipeProgress.value = withSpring(1, springConfig);
          activeState.value = 1;
        } else {
          swipeProgress.value = withSpring(0, springConfig);
          activeState.value = 0;
        }
      } else {
        if (event.velocityY > 300 || swipeProgress.value < 0.6) {
          swipeProgress.value = withSpring(0, springConfig);
          activeState.value = 0;
        } else {
          swipeProgress.value = withSpring(1, springConfig);
          activeState.value = 1;
        }
      }
    });

  const togglePreview = () => {
    if (activeState.value === 0) {
      swipeProgress.value = withSpring(1, springConfig);
      activeState.value = 1;
    } else {
      swipeProgress.value = withSpring(0, springConfig);
      activeState.value = 0;
    }
  };

  // Animated style for foreground image container
  const animatedImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      swipeProgress.value,
      [0, 1],
      [coverScale, 0.60],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      swipeProgress.value,
      [0, 1],
      [0, -55],
      Extrapolate.CLAMP
    );
    const borderRadius = interpolate(
      swipeProgress.value,
      [0, 1],
      [0, 20],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      borderRadius,
    };
  });

  // Animated style for details panel
  const animatedStatsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      swipeProgress.value,
      [0, 0.35, 1],
      [0, 0.2, 1],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      swipeProgress.value,
      [0, 1],
      [80, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Swipe hint prompt
  const animatedHintStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      swipeProgress.value,
      [0, 0.25],
      [0.85, 0],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  const animatedLiveStickerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      swipeProgress.value,
      [0.6, 1], // Fade in during the final half of swiping up
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  const getStickerColors = (theme: 'white' | 'dark' | 'orange') => {
    switch (theme) {
      case 'dark':
        return {
          text: '#111113',
          label: 'rgba(17, 17, 19, 0.65)',
          brand: '#111113',
          shoe: '#111113',
        };
      case 'orange':
        return {
          text: '#FFFFFF',
          label: 'rgba(255, 255, 255, 0.75)',
          brand: '#FF5C2E',
          shoe: '#FF5C2E',
        };
      case 'white':
      default:
        return {
          text: '#FFFFFF',
          label: 'rgba(255, 255, 255, 0.75)',
          brand: '#FFFFFF',
          shoe: '#FFFFFF',
        };
    }
  };

  const stickerColors = getStickerColors(stickerTheme);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.cardContainer} onLayout={onLayout}>
        {/* Background Layer: Blurred same image for premium context framing */}
        <Image
          source={{ uri: photoUri }}
          style={StyleSheet.absoluteFillObject}
          blurRadius={18}
        />
        {/* Semi-transparent Dark Tint Layer */}
        <View style={styles.blurTint} />

        {/* Foreground Layer: Crisp Crisp image transitioning cover -> contain */}
        <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
          <Image
            source={{ uri: photoUri }}
            style={styles.foregroundImage}
            resizeMode="contain"
          />

          {/* Dynamic Live Sticker Overlay on top of foreground photo (WISYWIG Live Preview) */}
          <Animated.View style={[styles.liveStickerOverlay, animatedLiveStickerStyle]}>
            {/* Header Row: Shoe Icon and Brand Wordmark */}
            <View style={styles.liveHeaderRow}>
              <View style={styles.liveShoeIcon}>
                <Svg width={24} height={15} viewBox="0 0 36 22" fill="none">
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
                    color: stickerColors.brand,
                    textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                  },
                ]}
              >
                TRACKED WITH FORGE
              </Text>
            </View>

            {/* Title: Activity notes or morning walk */}
            <Text
              style={[
                styles.liveNotes,
                {
                  color: stickerColors.text,
                  textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                },
              ]}
            >
              {workout.notes || 'Morning Workout'}
            </Text>

            {/* Stats Area (2-column layout matching Strava layout) */}
            <View style={styles.liveGrid}>
              {/* Left Column: Distance & Steps */}
              <View style={styles.liveColumn}>
                <View style={styles.liveStatBox}>
                  <Text
                    style={[
                      styles.liveStatLbl,
                      {
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
                        color: stickerColors.text,
                        textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                      },
                    ]}
                  >
                    km
                  </Text>
                </View>

                {workout.steps ? (
                  <View style={[styles.liveStatBox, { marginTop: 16 }]}>
                    <Text
                      style={[
                        styles.liveStatLbl,
                        {
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
                        color: stickerColors.text,
                        textShadowColor: stickerTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                      },
                    ]}
                  >
                    {formatDuration(workout.durationMin)}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Preview Button overlay in resting state */}
        <Animated.View style={[styles.previewBtnWrapper, animatedHintStyle]}>
          <TouchableOpacity style={styles.previewBtn} onPress={togglePreview} activeOpacity={0.7}>
            <Text style={styles.previewBtnText}>Show Preview</Text>
            <ChevronUp size={16} color={T.colors.t1} />
          </TouchableOpacity>
        </Animated.View>

        {/* Floating brand text */}
        <View style={styles.brandOverlay}>
          <Sparkles size={11} color={T.colors.forge} />
          <Text style={styles.brandText}>Tracked with FORGE</Text>
        </View>

        {/* Stats Details Panel Layer (Slides & Fades in) */}
        <Animated.View style={[styles.statsPanel, animatedStatsStyle]}>
          <Text style={styles.workoutDate}>{dayjs(workout.date).format('dddd, MMM D, YYYY')}</Text>

          {/* Sticker Style Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Sticker Theme Style</Text>
            <View style={styles.selectorRow}>
              {(['white', 'dark', 'orange'] as const).map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.selectorPill,
                    stickerTheme === theme && styles.selectorPillActive,
                  ]}
                  onPress={() => setStickerTheme(theme)}
                >
                  <View
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor:
                          theme === 'white'
                            ? '#FFFFFF'
                            : theme === 'dark'
                              ? '#111113'
                              : '#FF5C2E',
                        borderWidth: theme === 'white' ? 0.5 : 0,
                        borderColor: '#CCCCCC',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.selectorPillText,
                      stickerTheme === theme && styles.selectorPillTextActive,
                    ]}
                  >
                    {theme === 'white' ? 'White' : theme === 'dark' ? 'Slate' : 'Orange'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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

            <TouchableOpacity style={styles.actionBtnPrimary} onPress={shareImage}>
              <Share2 size={16} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.btnTextPrimary}>Share Sticker</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Dedicated Off-screen Share Card Template: Compact 1:1 Transparent PNG Sticker */}
        <ViewShot
          ref={shareViewShotRef}
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
              justifyContent: 'center',
            }}
          >
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
                    {formatDuration(workout.durationMin)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ViewShot>

      </View>
    </GestureDetector>
  );
}

const useStyles = (T: any, isDark: boolean) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
      minHeight: 520,
      backgroundColor: T.colors.bg0,
      position: 'relative',
      overflow: 'hidden',
    },
    blurTint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(10, 10, 14, 0.65)' : 'rgba(245, 245, 247, 0.65)',
    },
    imageContainer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'transparent',
    },
    foregroundImage: {
      width: '100%',
      height: '100%',
    },
    previewBtnWrapper: {
      position: 'absolute',
      bottom: 40,
      alignSelf: 'center',
    },
    previewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(30, 30, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: T.colors.b1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    previewBtnText: {
      color: T.colors.t1,
      fontSize: 13,
      fontWeight: '700',
    },
    brandOverlay: {
      position: 'absolute',
      top: 61,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(15, 15, 18, 0.75)' : 'rgba(255, 255, 255, 0.75)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: T.colors.b1,
    },
    brandText: {
      color: T.colors.t1,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginLeft: 4,
      textTransform: 'uppercase',
    },
    statsPanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? 'rgba(15, 15, 20, 0.92)' : 'rgba(255, 255, 255, 0.92)',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: 1,
      borderTopColor: T.colors.b1,
      paddingTop: 20,
      paddingBottom: 24,
      paddingHorizontal: 22,
    },
    workoutNotes: {
      fontSize: 20,
      fontWeight: '800',
      color: T.colors.t1,
      textAlign: 'center',
      marginBottom: 3,
    },
    workoutDate: {
      fontSize: 12,
      fontWeight: '500',
      color: T.colors.t2,
      textAlign: 'center',
      marginBottom: 18,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      gap: 10,
    },
    statBox: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: T.colors.t2,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '800',
      color: T.colors.t1,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    actionBtnPrimary: {
      flex: 1,
      backgroundColor: T.colors.forge || '#E2F952',
      borderRadius: 14,
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnTextPrimary: {
      color: isDark ? '#000' : '#FFF',
      fontSize: 13,
      fontWeight: '700',
    },
    actionBtnSecondary: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      borderRadius: 14,
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnTextSecondary: {
      color: T.colors.t1,
      fontSize: 13,
      fontWeight: '600',
    },
    // Selector styles
    selectorContainer: {
      marginBottom: 20,
      width: '100%',
    },
    selectorLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: T.colors.t2,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 10,
      textAlign: 'center',
    },
    selectorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    selectorPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: T.colors.b1,
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    selectorPillActive: {
      borderColor: T.colors.forge,
      backgroundColor: isDark ? 'rgba(255, 92, 46, 0.1)' : 'rgba(255, 92, 46, 0.06)',
    },
    colorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 6,
    },
    selectorPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: T.colors.t2,
    },
    selectorPillTextActive: {
      color: T.colors.t1,
      fontWeight: '700',
    },
    // Live preview overlay styles
    liveStickerOverlay: {
      position: 'absolute',
      bottom: 28,
      left: 24,
      right: 24,
      backgroundColor: 'transparent',
    },
    liveHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    liveShoeIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    liveBrandText: {
      fontSize: 22,
      fontWeight: '900',
      fontStyle: 'italic',
      letterSpacing: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    liveNotes: {
      fontSize: 32,
      fontWeight: '900',
      marginBottom: 24,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1.5 },
      textShadowRadius: 3,
    },
    liveGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    liveColumn: {
      flex: 1,
    },
    liveStatBox: {
      alignItems: 'flex-start',
    },
    liveStatLbl: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 0.5 },
      textShadowRadius: 1.5,
    },
    liveStatVal: {
      fontSize: 44,
      fontWeight: '900',
      lineHeight: 48,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1.5 },
      textShadowRadius: 3,
    },
    liveStatUnit: {
      fontSize: 18,
      fontWeight: '900',
      marginTop: 2,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
