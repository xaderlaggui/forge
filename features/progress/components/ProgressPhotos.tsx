import { useForgeTheme } from "@/hooks/useForgeTheme";
import { Camera, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';

interface ProgressPhotosProps {
  firstPhoto?: { url: string; date: string } | null;
  lastPhoto?: { url: string; date: string } | null;
  photosLength: number;
  isUploading: boolean;
  onTakePhoto: (targetIndex?: number) => void;
}

export function ProgressPhotos({
  firstPhoto, lastPhoto, photosLength, isUploading, onTakePhoto
}: ProgressPhotosProps) {
  const { T } = useForgeTheme();
  const s = useS(T);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    date: string;
    badge: string;
    index: number;
  } | null>(null);

  const handlePressPhoto = (photo: { url: string; date: string } | null | undefined, badge: string, index: number) => {
    if (photo?.url) {
      setSelectedPhoto({ url: photo.url, date: photo.date, badge, index });
      setModalVisible(true);
    } else {
      // If photo doesn't exist, trigger camera to take/add it
      onTakePhoto(index);
    }
  };

  const handleChangePhoto = () => {
    if (!selectedPhoto) return;
    setModalVisible(false);
    onTakePhoto(selectedPhoto.index);
  };

  return (
    <View style={s.section}>
      <View style={s.photoGrid}>
        {[
          { photo: firstPhoto, badge: 'Before', index: 0 },
          { photo: lastPhoto, badge: 'Current', index: Math.max(0, photosLength - 1) }
        ].map(({ photo, badge, index }) => (
          <View key={badge} style={{ flex: 1, aspectRatio: 0.72, ...T.shadows.lift, borderRadius: T.radii.lg }}>
            <TouchableOpacity
              style={s.photoCard}
              onPress={() => handlePressPhoto(photo, badge, index)}
              activeOpacity={0.85}
            >
              {photo?.url ? (
                <Image source={{ uri: photo.url }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: 0.3 }]}>
                  <Camera size={24} color={T.colors.t2} />
                </View>
              )}
              <View style={s.photoBadgeWrap}>
                <Text style={s.photoBadgeText} maxFontSizeMultiplier={1.2}>{badge}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={s.modalOverlay}>
            {/* Safe Area Close Button */}
            <TouchableOpacity style={s.closeBtn} onPress={() => setModalVisible(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>

            <View style={s.modalContent}>
              <Text style={s.modalBadgeText} maxFontSizeMultiplier={1.2}>
                {selectedPhoto.badge} Photo
              </Text>
              
              <Image source={{ uri: selectedPhoto.url }} style={s.modalImage} resizeMode="contain" />

              <View style={s.metaWrap}>
                <Text style={s.dateText} maxFontSizeMultiplier={1.2}>
                  Taken: {dayjs(selectedPhoto.date).format('MMMM D, YYYY')}
                </Text>
                
                <TouchableOpacity style={s.changePhotoBtn} onPress={handleChangePhoto} disabled={isUploading}>
                  <Camera size={16} color="#fff" />
                  <Text style={s.changePhotoText} maxFontSizeMultiplier={1.2}>
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
  section: { marginBottom: T.spacing.px6 },
  photoGrid: { flexDirection: 'row', gap: 10 },
  photoCard: {
    flex: 1, backgroundColor: T.colors.bg2,
    borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  photoBadgeWrap: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(10,10,11,0.75)' },
  photoBadgeText: {
    fontSize: T.typography.sizes.caption, fontWeight: '700', color: T.colors.t2,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 11, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalContent: {
    width: '90%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  modalBadgeText: {
    fontSize: T.typography.sizes.h3,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    borderRadius: T.radii.xl,
    backgroundColor: T.colors.bg1,
  },
  metaWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  dateText: {
    fontSize: T.typography.sizes.body,
    color: T.colors.t3,
    fontWeight: '500',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: T.colors.forge,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: T.radii.full,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: T.typography.sizes.body,
    fontWeight: '600',
  },
});
