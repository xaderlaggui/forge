import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Pressable, Modal, FlatList
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat,
  withTiming, withSequence, Easing
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";

// ─────────────────────────────────────────────
// 1. Circular Arc Rest Timer Widget
// ─────────────────────────────────────────────
interface RestTimerWidgetProps {
  restTime: number;
  totalTime?: number;
  isResting: boolean;
  onSkip: () => void;
  onAddTime?: () => void;
  onTogglePause?: () => void;
}

export function RestTimerWidget({
  restTime, totalTime = 60, isResting,
  onSkip, onAddTime, onTogglePause
}: RestTimerWidgetProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const numpadStyles = useNumpadStyles(ForgeTheme);
  const SIZE = 88;
  const R = 40;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const progress = Math.max(restTime / totalTime, 0);
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 500 }), withTiming(1.0, { duration: 500 })),
      -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const mins = Math.floor(restTime / 60);
  const secs = (restTime % 60).toString().padStart(2, '0');

  return (
    <View style={useTimerStyles.container}>
      {/* +30s */}
      <TouchableOpacity style={useTimerStyles.sideBtn} onPress={onAddTime}>
        <Text style={useTimerStyles.sideBtnText}>+30s</Text>
      </TouchableOpacity>

      {/* Circle */}
      <Animated.View style={[useTimerStyles.circle, pulseStyle]}>
        <Pressable onPress={onTogglePause}>
          <Svg width={SIZE} height={SIZE} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={ForgeTheme.colors.bg2} strokeWidth={4} fill="none" />
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              stroke={ForgeTheme.colors.forge}
              strokeWidth={4}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              rotation="-90"
              originX={SIZE / 2}
              originY={SIZE / 2}
            />
          </Svg>
          <View style={useTimerStyles.circleInner}>
            <Text style={useTimerStyles.timerText}>{mins}:{secs}</Text>
            <Text style={useTimerStyles.timerSub}>{isResting ? 'Resting' : 'Paused'}</Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Skip */}
      <TouchableOpacity style={useTimerStyles.sideBtn} onPress={onSkip}>
        <Text style={useTimerStyles.sideBtnText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const useTimerStyles = (T: any) => StyleSheet.create({
          container: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: 'rgba(20,20,22,0.95)',
            borderRadius: 24, borderWidth: 0.5, borderColor: ForgeTheme.colors.b1,
            paddingHorizontal: 16, paddingVertical: 14,
            shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.4, shadowRadius: 40,
            elevation: 20,
          },
          sideBtn: {
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: ForgeTheme.colors.bg2,
            alignItems: 'center', justifyContent: 'center',
          },
          sideBtnText: { fontSize: 11, fontWeight: '600', color: ForgeTheme.colors.t2 },
          circle: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
          circleInner: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
          timerText: {
            fontFamily: undefined,
            fontSize: 24, fontWeight: '700',
            color: ForgeTheme.colors.forge,
            lineHeight: 28,
          },
          timerSub: { fontSize: 9, color: ForgeTheme.colors.t3, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
        });


// ─────────────────────────────────────────────
// 2. Custom Numpad Bottom Sheet
// ─────────────────────────────────────────────
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

interface NumpadBottomSheetProps {
  visible: boolean;
  value: string;
  label?: string;
  onValueChange: (val: string) => void;
  onDone: () => void;
  onClose: () => void;
}

export function NumpadBottomSheet({
  visible, value, label = 'Log Value',
  onValueChange, onDone, onClose
}: NumpadBottomSheetProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const numpadStyles = useNumpadStyles(ForgeTheme);
  const handleKey = useCallback((key: string) => {
    if (key === '⌫') {
      onValueChange(value.slice(0, -1));
    } else if (key === '.' && value.includes('.')) {
      return;
    } else {
      onValueChange(value + key);
    }
  }, [value, onValueChange]);

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={useNumpadStyles.overlay}>
        <View style={useNumpadStyles.sheet}>
          {/* Handle */}
          <View style={useNumpadStyles.handle} />

          {/* Header */}
          <View style={useNumpadStyles.header}>
            <Text style={useNumpadStyles.headerLabel}>{label}</Text>
            <TouchableOpacity onPress={onClose} style={useNumpadStyles.closeBtn}>
              <X size={18} color={ForgeTheme.colors.t3} />
            </TouchableOpacity>
          </View>

          {/* Display */}
          <View style={useNumpadStyles.display}>
            <Text style={useNumpadStyles.displayText}>{value || '—'}</Text>
          </View>

          {/* Keys */}
          <View style={useNumpadStyles.grid}>
            {KEYS.map((key) => (
              <TouchableOpacity
                key={key}
                style={useNumpadStyles.key}
                onPress={() => handleKey(key)}
                activeOpacity={0.6}
              >
                <Text style={useNumpadStyles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Done */}
          <TouchableOpacity style={useNumpadStyles.doneBtn} onPress={onDone}>
            <Text style={useNumpadStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const useNumpadStyles = (T: any) => StyleSheet.create({
          overlay: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          sheet: {
            backgroundColor: ForgeTheme.colors.bg1,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderTopWidth: 0.5, borderColor: ForgeTheme.colors.b1,
            paddingHorizontal: 16, paddingBottom: 36, paddingTop: 12,
            shadowColor: '#000', shadowOffset: { width: 0, height: -20 }, shadowOpacity: 0.5, shadowRadius: 40, elevation: 30,
          },
          handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: ForgeTheme.colors.bg3, alignSelf: 'center', marginBottom: 16 },
          header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
          headerLabel: { fontSize: 14, fontWeight: '600', color: ForgeTheme.colors.t1 },
          closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: ForgeTheme.colors.bg2, alignItems: 'center', justifyContent: 'center' },
          display: { alignItems: 'center', paddingVertical: 12 },
          displayText: { fontSize: 40, fontWeight: '700', color: ForgeTheme.colors.t1 },
          grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
          key: {
            width: '30%', height: 54, backgroundColor: ForgeTheme.colors.bg2,
            borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            flexGrow: 1,
          },
          keyText: { fontSize: 20, fontWeight: '500', color: ForgeTheme.colors.t1 },
          doneBtn: {
            backgroundColor: ForgeTheme.colors.forge, height: 54, borderRadius: 14,
            alignItems: 'center', justifyContent: 'center', marginTop: 4,
            shadowColor: ForgeTheme.colors.forge, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5,
          },
          doneBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
        });
