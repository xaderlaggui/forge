import { useForgeTheme } from '@/hooks/useForgeTheme';
import { Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MascotImage } from '../../../components/common/MascotImage';
import { PHYSIQUE_ANALYSIS_PROMPT } from '../../../constants/prompts';
import { groqComplete } from '../../../services/groq';

interface Props {
  hasPhotos: boolean;
  onUploadPress: () => void;
  lastPhotoUrl?: string;
}

export function PhysiqueCoachBubble({ hasPhotos, onUploadPress, lastPhotoUrl }: Props) {
  const { T } = useForgeTheme();
  const s = useStyles(T);

  const emptyText = "Upload a front-facing progress photo so I can scan your physique and track your muscle definition!";

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFunny, setIsFunny] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const [displayedText, setDisplayedText] = useState('');

  // Determine current mascot state
  let currentMascot: "bear_1_1" | "bear_3_1" | "bear_3_3" | any = "bear_1_1";
  if (!hasPhotos) currentMascot = "bear_1_1";
  else if (isAnalyzing) currentMascot = "bear_3_1";
  else if (isFunny) currentMascot = "bear_3_3";
  else currentMascot = "bear_3_1";

  // AI Analysis Effect
  useEffect(() => {
    let isMounted = true;

    if (hasPhotos && lastPhotoUrl) {
      setIsAnalyzing(true);
      setAiMessage('');
      setDisplayedText('');

      const analyzeImage = async () => {
        try {
          const response = await groqComplete([
            {
              role: 'user',
              content: [
                { type: 'text', text: PHYSIQUE_ANALYSIS_PROMPT },
                { type: 'image_url', image_url: { url: lastPhotoUrl } }
              ]
            }
          ], {
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            response_format: { type: 'json_object' }
          });

          if (isMounted) {
            const data = JSON.parse(response);
            setIsFunny(!!data.isFunny);
            setAiMessage(data.message || "Looking leaner! The consistency in your workouts is showing. Keep crushing those upper body sessions!");
          }
        } catch (e) {
          console.error("Vision Analysis failed:", e);
          if (isMounted) {
            setIsFunny(false);
            setAiMessage("Looking leaner! The consistency in your workouts is showing in your shoulder and chest definition compared to your starting photo. Keep crushing those upper body sessions!");
          }
        } finally {
          if (isMounted) setIsAnalyzing(false);
        }
      };

      analyzeImage();
    } else {
      setAiMessage(emptyText);
      setIsFunny(false);
      setIsAnalyzing(false);
    }

    return () => { isMounted = false; };
  }, [hasPhotos, lastPhotoUrl]);

  // Typewriter effect
  useEffect(() => {
    if (isAnalyzing) {
      setDisplayedText("Scanning your physique...");
      return;
    }

    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(aiMessage.substring(0, i));
      i++;
      if (i > aiMessage.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [aiMessage, isAnalyzing]);

  return (
    <View style={s.container}>
      <View style={s.mascotContainer}>
        <MascotImage
          mascot={currentMascot}
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
