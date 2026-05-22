import { useForgeTheme } from '@/hooks/useForgeTheme';
import { Camera, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MascotImage } from '../../../components/common/MascotImage';

interface Props {
  hasPhotos: boolean;
  onUploadPress: () => void;
}

export function PhysiqueCoachBubble({ hasPhotos, onUploadPress }: Props) {
  const { T } = useForgeTheme();
  const s = useStyles(T);

  const emptyText = "Upload a front-facing progress photo so I can scan your physique and track your muscle definition!";
  const analysisText = "Looking leaner! The consistency in your workouts is showing in your shoulder and chest definition compared to your starting photo. Keep crushing those upper body sessions!";

  const fullText = hasPhotos ? analysisText : emptyText;
  const [displayedText, setDisplayedText] = useState('');

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <View style={s.container}>
      <View style={s.mascotContainer}>
        <MascotImage
          mascot="bear_3_1"
          width={130}
          height={130}
          accessibilityLabel="Coach Mascot"
        />
      </View>
      <View style={s.bubbleWrapper}>
        <View style={s.triangleBorder} />
        <View style={s.triangle} />
        <View style={s.bubble}>
          <View style={s.header}>
            <Sparkles size={14} color={T.colors.forge} />
            <Text style={s.headerText}>PHYSIQUE ANALYSIS</Text>
          </View>
          <Text style={s.bodyText}>{displayedText}</Text>

          {!hasPhotos && (
            <TouchableOpacity style={s.button} onPress={onUploadPress} activeOpacity={0.7}>
              <Camera size={14} color={T.colors.forge} style={{ marginRight: 6 }} />
              <Text style={s.buttonText}>Upload Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center'
  },
  mascotContainer: {
    marginRight: 12,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
  },
  bubbleWrapper: {
    flex: 1,
    position: 'relative',
  },
  triangleBorder: {
    position: 'absolute',
    left: -9,
    top: 23,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: T.colors.b1,
    zIndex: 0,
  },
  triangle: {
    position: 'absolute',
    left: -7,
    top: 24,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: T.colors.bg1,
    zIndex: 2,
  },
  bubble: {
    backgroundColor: T.colors.bg1, ...T.shadows.lift,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: T.colors.b1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '800',
    color: T.colors.t1,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 13,
    color: T.colors.t2,
    lineHeight: 18,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: T.colors.forgeDim,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,92,46,0.2)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '800',
    color: T.colors.forge,
  }
});
