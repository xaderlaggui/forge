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
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Camera, ChevronUp, Clock, Footprints, Share2, Sparkles, TrendingUp } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useForgeTheme } from '@/hooks/useForgeTheme';
import { formatDuration } from '../../utils/format';

interface InteractivePhotoCardProps {
  photoUri: string;
  workout: any;
  pickImage: () => void;
  shareImage: () => void;
  isUploading: boolean;
}

export function InteractivePhotoCard({
  photoUri,
  workout,
  pickImage,
  shareImage,
  isUploading,
}: InteractivePhotoCardProps) {
  const { T } = useForgeTheme();
  const styles = useStyles(T);

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [imageAspect, setImageAspect] = useState<number | null>(null);

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
        </Animated.View>

        {/* Swipe indicator overlay in resting state */}
        <Animated.View style={[styles.hintOverlay, animatedHintStyle]} pointerEvents="none">
          <ChevronUp size={20} color="#FFF" />
          <Text style={styles.hintText}>Swipe up for stats</Text>
        </Animated.View>

        {/* Floating brand text */}
        <View style={styles.brandOverlay}>
          <Sparkles size={11} color={T.colors.forge} />
          <Text style={styles.brandText}>Tracked with FORGE</Text>
        </View>

        {/* Stats Details Panel Layer (Slides & Fades in) */}
        <Animated.View style={[styles.statsPanel, animatedStatsStyle]}>
          <Text style={styles.workoutNotes}>{workout.notes || 'Morning Activity'}</Text>
          <Text style={styles.workoutDate}>{dayjs(workout.date).format('dddd, MMM D, YYYY')}</Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <TrendingUp size={16} color={T.colors.forge} style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{workout.distanceKm || 0} km</Text>
            </View>

            <View style={styles.statBox}>
              <Footprints size={16} color={T.colors.forge} style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>STEPS</Text>
              <Text style={styles.statValue}>{workout.steps || 0}</Text>
            </View>

            <View style={styles.statBox}>
              <Clock size={16} color={T.colors.forge} style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>MOVING TIME</Text>
              <Text style={styles.statValue}>{formatDuration(workout.durationMin)}</Text>
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
              <Text style={styles.btnTextPrimary}>Share Card</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const useStyles = (T: any) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
      minHeight: 520,
      backgroundColor: '#0F0F12',
      position: 'relative',
      overflow: 'hidden',
    },
    blurTint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 10, 14, 0.65)',
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
    hintOverlay: {
      position: 'absolute',
      bottom: 28,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hintText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginTop: 4,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    brandOverlay: {
      position: 'absolute',
      top: 61,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(15, 15, 18, 0.75)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    brandText: {
      color: '#ECECEF',
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
      backgroundColor: 'rgba(15, 15, 20, 0.92)',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.08)',
      paddingTop: 20,
      paddingBottom: 24,
      paddingHorizontal: 22,
    },
    workoutNotes: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFF',
      textAlign: 'center',
      marginBottom: 3,
    },
    workoutDate: {
      fontSize: 12,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.5)',
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
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.4)',
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFF',
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
      color: '#000',
      fontSize: 13,
      fontWeight: '700',
    },
    actionBtnSecondary: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      borderRadius: 14,
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnTextSecondary: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '600',
    },
  });
