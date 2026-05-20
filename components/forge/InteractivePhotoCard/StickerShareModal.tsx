import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X, Share2, Phone } from 'lucide-react-native';
import { useForgeTheme } from '@/hooks/useForgeTheme';
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
}

export function StickerShareModal({
  isVisible,
  onClose,
  workout,
  stickerTheme,
  setStickerTheme,
  shareImage,
  isSharing,
}: StickerShareModalProps) {
  const { T, isDark } = useForgeTheme();
  const styles = useStyles(T, isDark);

  const themes: StickerTheme[] = ['white', 'dark', 'orange'];

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Sticker Theme</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <X size={20} color={T.colors.t1} />
            </TouchableOpacity>
          </View>

          {/* Carousel / Phone Mockups */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modalCarouselContainer}
            snapToInterval={220 + 16}
            decelerationRate="fast"
          >
            {themes.map((theme) => {
              const isSelected = stickerTheme === theme;
              // Slate (dark) uses white screen, others use black
              const screenBg = theme === 'dark' ? '#FFFFFF' : '#000000';

              return (
                <TouchableOpacity
                  key={theme}
                  activeOpacity={0.9}
                  onPress={() => setStickerTheme(theme)}
                  style={[
                    styles.mockupWrapper,
                    isSelected && styles.mockupWrapperActive,
                  ]}
                >
                  <View style={[styles.phoneMockup, { backgroundColor: screenBg }]}>
                    {/* Simulated Notch */}
                    <View style={styles.phoneNotch} />
                    
                    {/* The Sticker inside the phone */}
                    <StickerPreviewUI workout={workout} stickerTheme={theme} />
                  </View>
                  <Text style={[styles.mockupLabel, isSelected && { color: T.colors.t1, fontWeight: '800' }]}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Export Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={shareImage}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Share2 size={16} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.btnTextPrimary}>Export & Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
