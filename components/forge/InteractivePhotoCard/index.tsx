import { ChevronUp, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useForgeTheme } from '@/hooks/useForgeTheme';
import { useStyles } from './InteractivePhotoCardStyles';
import { InteractivePhotoCardProps, StickerTheme } from './InteractivePhotoCardTypes';
import { OffScreenStickerTemplate } from './OffScreenStickerTemplate';
import { StatsPanel } from './StatsPanel';
import { StickerShareModal } from './StickerShareModal';

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
  const [stickerTheme, setStickerTheme] = useState<StickerTheme>('white');
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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
      [1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      swipeProgress.value,
      [0, 0.25],
      [0, 20],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const handleShareExport = async () => {
    setIsSharing(true);
    try {
      await new Promise(resolve => requestAnimationFrame(resolve)); // let ViewShot render
      await shareImage();
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
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

          {/* Preview Button overlay in resting state */}
          <Animated.View style={[styles.previewBtnWrapper, animatedHintStyle]}>
            <TouchableOpacity style={styles.previewBtn} onPress={togglePreview} activeOpacity={0.7}>
              <Text style={styles.previewBtnText}>Show Stats</Text>
              <ChevronUp size={16} color={T.colors.t1} />
            </TouchableOpacity>
          </Animated.View>

          {/* Floating brand text */}
          <View style={styles.brandOverlay}>
            <Sparkles size={11} color={T.colors.forge} />
            <Text style={styles.brandText}>Tracked with FORGE</Text>
          </View>

          <StatsPanel
            workout={workout}
            pickImage={pickImage}
            openShareModal={() => setIsShareModalVisible(true)}
            isUploading={isUploading}
            animatedStatsStyle={animatedStatsStyle}
          />

          <OffScreenStickerTemplate
            workout={workout}
            stickerTheme={stickerTheme}
            shareViewShotRef={shareViewShotRef}
          />
        </View>
      </GestureDetector>

      {/* New Sticker Share Modal */}
      <StickerShareModal
        isVisible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        workout={workout}
        stickerTheme={stickerTheme}
        setStickerTheme={setStickerTheme}
        shareImage={handleShareExport}
        isSharing={false}
        shareViewShotRef={shareViewShotRef}

      />
    </>
  );
}
