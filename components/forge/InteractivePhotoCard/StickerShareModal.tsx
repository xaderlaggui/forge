import { useForgeTheme } from '@/hooks/useForgeTheme';
import * as MediaLibrary from 'expo-media-library';
import { Download, Share2, X } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStyles } from './InteractivePhotoCardStyles';
import { StickerTheme } from './InteractivePhotoCardTypes';
import { StickerPreviewUI } from './StickerPreviewUI';

interface StickerShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  workout: any;
  stickerTheme: StickerTheme;
  setStickerTheme: (theme: StickerTheme) => void;
  shareImage: () => void;
  isSharing: boolean;
  shareViewShotRef: React.RefObject<any>;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHONE_WIDTH = SCREEN_WIDTH * 0.6;
const PHONE_HEIGHT = PHONE_WIDTH * (16 / 8);
const ITEM_WIDTH = SCREEN_WIDTH;

const themes: StickerTheme[] = ['white', 'dark', 'orange'];

const themeLabels: Record<StickerTheme, string> = {
  white: 'Dark',
  dark: 'Light',
  orange: 'Ember',
};

const themeScreenBg: Record<StickerTheme, string> = {
  white: '#4a4a5c', // Mid-grey so dark gradient is visible
  dark: '#8e8e96',  // Medium tone so light gradient pops
  orange: '#1a1a2e', // Deep navy to contrast warm orange
};

export function StickerShareModal({
  isVisible,
  onClose,
  workout,
  stickerTheme,
  setStickerTheme,
  shareImage,
  isSharing,
  shareViewShotRef,
}: StickerShareModalProps) {
  const { T, isDark } = useForgeTheme();
  const styles = useStyles(T, isDark);
  const [isSaving, setIsSaving] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Sync carousel position with active theme on viewable change
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null && index !== undefined) {
          setStickerTheme(themes[index]);
        }
      }
    },
    [setStickerTheme]
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleSaveSticker = async () => {
    try {
      setIsSaving(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to save stickers.'
        );
        setIsSaving(false);
        return;
      }

      // Capture the off-screen sticker template
      if (shareViewShotRef?.current?.capture) {
        const uri = await shareViewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved!', 'Sticker has been saved to your photo library.');
      }
    } catch (e) {
      console.log('Error saving sticker', e);
      Alert.alert('Error', 'Failed to save sticker. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPhoneMockup = ({ item: theme }: { item: StickerTheme }) => {
    const screenBg = themeScreenBg[theme];
    const isPhoneDark = theme === 'white' || theme === 'orange';
    const phoneBorder = isPhoneDark ? '#222' : '#222';

    return (
      <View style={localStyles.carouselItem}>
        <View style={localStyles.phoneShadowContainer}>
          {/* Solid narrow view that casts shadows outwards only to the left and right sides */}
          <View style={localStyles.phoneSideShadow} />

          <View
            style={[
              localStyles.phoneMockup,
              {
                borderColor: phoneBorder,
              },
            ]}
          >
            {/* Dynamic Island / Notch */}
            <View
              style={[
                localStyles.dynamicIsland,
                { backgroundColor: '#000' },
              ]}
            />

            {/* Phone Screen */}
            <View style={[localStyles.phoneScreen, { backgroundColor: screenBg }]}>
              <View style={localStyles.stickerScaleWrapper}>
                <StickerPreviewUI workout={workout} stickerTheme={theme} />
              </View>
            </View>
          </View>
        </View>

        {/* Theme Label */}
        <Text
          style={[
            localStyles.themeLabel,
            {
              color: stickerTheme === theme ? T.colors.t1 : T.colors.t3,
              fontWeight: stickerTheme === theme ? '800' : '600',
            },
          ]}
        >
          {themeLabels[theme]}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={localStyles.backdrop}>
        <View
          style={[
            localStyles.container,
            { backgroundColor: T.colors.bg1 },
          ]}
        >
          {/* Header */}
          <View style={localStyles.header}>
            <Text style={[localStyles.title, { color: T.colors.t1 }]}>
              Share Sticker
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                localStyles.closeBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <X size={18} color={T.colors.t2} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={[localStyles.subtitle, { color: T.colors.t3 }]}>
            Swipe to preview themes
          </Text>

          {/* Paging Carousel - 1 phone per page */}
          <View style={localStyles.carouselWrapper}>
            <FlatList
              ref={flatListRef}
              data={themes}
              renderItem={renderPhoneMockup}
              keyExtractor={(item) => item}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              initialScrollIndex={themes.indexOf(stickerTheme)}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
            />

            {/* Page Dots */}
            <View style={localStyles.dotsRow}>
              {themes.map((theme) => (
                <View
                  key={theme}
                  style={[
                    localStyles.dot,
                    {
                      backgroundColor:
                        stickerTheme === theme
                          ? T.colors.forge
                          : isDark
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(0,0,0,0.12)',
                    },
                    stickerTheme === theme && localStyles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={localStyles.footer}>
            {/* Save Sticker Button */}
            <TouchableOpacity
              style={[
                localStyles.btnSave,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.05)',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.08)',
                },
              ]}
              onPress={handleSaveSticker}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={T.colors.t1} />
              ) : (
                <>
                  <Download size={16} color={T.colors.t1} style={{ marginRight: 6 }} />
                  <Text style={[localStyles.btnSaveText, { color: T.colors.t1 }]}>
                    Save Sticker
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={[
                localStyles.btnShare,
                { backgroundColor: T.colors.forge || '#E2F952' },
              ]}
              onPress={shareImage}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Share2 size={16} color="#000" style={{ marginRight: 6 }} />
                  <Text style={localStyles.btnShareText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    height: SCREEN_HEIGHT * 0.88,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  phoneShadowContainer: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    position: 'relative',
  },
  phoneSideShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 36,
    bottom: 0,
    borderRadius: 36,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 15,
  },
  phoneMockup: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    borderWidth: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000', // ensures solid masking
  },
  dynamicIsland: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 90,
    height: 28,
    borderRadius: 20,
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    position: 'relative',
  },
  stickerScaleWrapper: {
    position: 'absolute',
    bottom: -15,
    left: -20,
    right: -20,
    height: 280,
    justifyContent: 'flex-end',
    transform: [{ scale: 0.78 }],
  },
  themeLabel: {
    marginTop: 20,
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotActive: {
    width: 22,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 12,
  },
  btnSave: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveText: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnShare: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnShareText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
