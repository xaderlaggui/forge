import { useForgeTheme } from '@/hooks/useForgeTheme';
import { Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MascotImage } from '../../../components/common/MascotImage';

const TIPS = [
  "To optimize your metabolism, make sure you're drinking at least 2 liters of water a day.",
  "Eating a protein-rich breakfast can reduce cravings later in the day.",
  "Don't fear healthy fats! Avocados and nuts are great for hormone balance.",
  "Try to eat a rainbow of vegetables to ensure you're getting a variety of micronutrients.",
  "If your goal is to build muscle, ensure you're eating in a slight caloric surplus.",
  "Meal prepping on weekends can save you hours during busy weekdays.",
  "Carbs are fuel! Focus on complex carbs like sweet potatoes and oats for sustained energy."
];

interface Props {
  onGeneratePress: () => void;
  activePlanExists?: boolean;
}

export function NutritionCoachBubble({ onGeneratePress, activePlanExists }: Props) {
  const { T } = useForgeTheme();
  const s = useStyles(T);

  // Pick a random tip once
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [displayedText, setDisplayedText] = useState('');

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(tip.substring(0, i));
      i++;
      if (i > tip.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [tip]);

  return (
    <View style={s.container}>
      <View style={s.mascotContainer}>
        <MascotImage
          mascot="nutrition"
          width={130}
          height={130}
          accessibilityLabel="Nutrition Coach Mascot"
        />
      </View>
      <View style={s.bubbleWrapper}>
        <View style={s.triangleBorder} />
        <View style={s.triangle} />
        <View style={s.bubble}>
          <View style={s.header}>
            <Sparkles size={14} color={T.colors.forge} />
            <Text style={s.headerText}>AI COACH TIP</Text>
          </View>
          <Text style={s.bodyText}>{displayedText}</Text>

          <TouchableOpacity style={s.button} onPress={onGeneratePress} activeOpacity={0.7}>
            <Text style={s.buttonText}>
              {activePlanExists ? 'Show Weekly Meal Plan' : 'Generate Meal Plan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: T.spacing.page,
    marginTop: 16,
    marginBottom: 24,
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
  // The border triangle (slightly larger, placed behind)
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
  // The inner triangle (matches background color)
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
    backgroundColor: T.colors.bg1,
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
    minHeight: 54, // Prevent layout jump as text types out
    marginBottom: 12,
  },
  button: {
    backgroundColor: T.colors.forgeDim,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,92,46,0.2)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '800',
    color: T.colors.forge,
  }
});
