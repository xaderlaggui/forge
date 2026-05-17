import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Camera } from 'lucide-react-native';
import { ForgeButton } from '../../../components/forge/ForgeButton';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface ProgressPhotosProps {
  firstPhoto?: { url: string; date: string } | null;
  lastPhoto?: { url: string; date: string } | null;
  isUploading: boolean;
  onTakePhoto: () => void;
}

export function ProgressPhotos({ firstPhoto, lastPhoto, isUploading, onTakePhoto }: ProgressPhotosProps) {
    const { T } = useForgeTheme();
    const s = useS(T);
  return (
    <View style={useS.section}>
      <Text style={useS.sectionLabel} maxFontSizeMultiplier={1.2}>Transformation</Text>
      <View style={useS.photoGrid}>
        {[{ photo: firstPhoto, badge: 'Before' }, { photo: lastPhoto, badge: 'Current' }].map(({ photo, badge }) => (
          <View key={badge} style={useS.photoCard}>
            {photo?.url ? (
              <Image source={{ uri: photo.url }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: 0.3 }]}>
                <Camera size={24} color={T.colors.t2} />
              </View>
            )}
            <View style={useS.photoBadgeWrap}>
              <Text style={useS.photoBadgeText} maxFontSizeMultiplier={1.2}>{badge}</Text>
            </View>
          </View>
        ))}
      </View>

      <ForgeButton
        label={isUploading ? 'Saving…' : 'Take Progress Photo'}
        onPress={onTakePhoto}
        disabled={isUploading}
        variant="secondary"
        leftIcon={<Camera size={15} color={T.colors.forge} />}
      />
    </View>
  );
}

const useS = (T: any) => StyleSheet.create({
          section: { marginHorizontal: T.spacing.page, marginBottom: T.spacing.px6 },
          sectionLabel: {
            fontSize: T.typography.sizes.label, fontWeight: '600', color: T.colors.t3,
            textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: T.spacing.px3,
          },
          photoGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
          photoCard: {
            flex: 1, aspectRatio: 0.72, backgroundColor: T.colors.bg2,
            borderRadius: T.radii.lg, borderWidth: 0.5, borderColor: T.colors.b1,
            overflow: 'hidden', justifyContent: 'flex-end',
          },
          photoBadgeWrap: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(10,10,11,0.75)' },
          photoBadgeText: {
            fontSize: T.typography.sizes.caption, fontWeight: '700', color: T.colors.t2,
            textTransform: 'uppercase', letterSpacing: 1.2,
          },
        });
