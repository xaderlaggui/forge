import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Check, Trash2 } from 'lucide-react-native';
import { ExerciseState } from '../types';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface WorkoutSetsTableProps {
  exercises: ExerciseState[];
  personalRecords?: Record<string, Record<string, number>>;
  onToggleSet: (exIdx: number, setIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onRemoveSet?: (exIdx: number, setIdx: number) => void;
  onOpenNumpad: (exIdx: number, setIdx: number, field: 'weight' | 'reps') => void;
}

export function WorkoutSetsTable({ exercises, personalRecords, onToggleSet, onAddSet, onRemoveSet, onOpenNumpad }: WorkoutSetsTableProps) {
    const { T } = useForgeTheme();
    const styles = useStyles(T);
  const renderRightActions = (exIdx: number, setIdx: number) => {
    return (
      <TouchableOpacity
        style={useStyles.deleteAction}
        onPress={() => onRemoveSet?.(exIdx, setIdx)}
      >
        <Trash2 size={20} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {exercises.map((ex, exIdx) => (
        <View key={exIdx} style={useStyles.exerciseBlock}>
          <Text style={useStyles.exName} maxFontSizeMultiplier={1.2}>{ex.name}</Text>

          {/* Table header */}
          <View style={useStyles.tableHeader}>
            <Text style={[useStyles.colHead, { flex: 0.6 }]} maxFontSizeMultiplier={1.2}>SET</Text>
            <Text style={[useStyles.colHead, { flex: 1.4 }]} maxFontSizeMultiplier={1.2}>PREVIOUS</Text>
            <Text style={[useStyles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>LBS</Text>
            <Text style={[useStyles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>REPS</Text>
            <Text style={[useStyles.colHead, { flex: 0.6, textAlign: 'center' }]} maxFontSizeMultiplier={1.2}>✓</Text>
          </View>

          {/* Set rows */}
          {ex.sets.map((set, setIdx) => {
            const currentWeight = Number(set.weight);
            const currentReps = set.reps.toString();
            const bestHistory = personalRecords?.[ex.name]?.[currentReps] || 0;
            const isPR = set.done && currentWeight > 0 && currentWeight > bestHistory;

            return (
            <Swipeable
              key={setIdx}
              renderRightActions={() => renderRightActions(exIdx, setIdx)}
              overshootRight={false}
            >
              <View
                style={[useStyles.row, set.done && useStyles.rowDone, setIdx < ex.sets.length - 1 && useStyles.rowBorder]}
              >
              <View style={{ flex: 0.6 }}>
                <Text style={[useStyles.cell, { color: T.colors.t2 }]} maxFontSizeMultiplier={1.2}>{setIdx + 1}</Text>
              </View>
              <View style={{ flex: 1.4 }}>
                {isPR && <Text style={useStyles.prBadge} maxFontSizeMultiplier={1.2}>NEW PR 🏆</Text>}
                <Text style={[useStyles.cell, { color: T.colors.t3, fontSize: T.typography.sizes.bodyS }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                  {set.prev}
                </Text>
              </View>

              <TouchableOpacity
                style={[useStyles.inputCell, { flex: 1 }, set.done && useStyles.inputCellDone]}
                onPress={() => onOpenNumpad(exIdx, setIdx, 'weight')}
              >
                <Text style={useStyles.inputCellText} maxFontSizeMultiplier={1.2}>{set.weight || '—'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[useStyles.inputCell, { flex: 1 }, set.done && useStyles.inputCellDone]}
                onPress={() => onOpenNumpad(exIdx, setIdx, 'reps')}
              >
                <Text style={useStyles.inputCellText} maxFontSizeMultiplier={1.2}>{set.reps || '—'}</Text>
              </TouchableOpacity>

              <View style={[{ flex: 0.6, alignItems: 'center' }]}>
                <TouchableOpacity
                  style={[useStyles.checkBtn, set.done && useStyles.checkBtnDone]}
                  onPress={() => onToggleSet(exIdx, setIdx)}
                >
                  <Check size={14} strokeWidth={3} color={set.done ? '#fff' : 'transparent'} />
                </TouchableOpacity>
              </View>
            </View>
            </Swipeable>
            );
          })}

          {/* Add set */}
          <TouchableOpacity style={useStyles.addSetBtn} onPress={() => onAddSet(exIdx)}>
            <Text style={useStyles.addSetText} maxFontSizeMultiplier={1.2}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
          exerciseBlock: {
            backgroundColor: T.colors.bg1,
            borderRadius: T.radii.xl, borderWidth: 0.5, borderColor: T.colors.b1,
            overflow: 'hidden', marginBottom: T.spacing.px5,
          },
          exName: { fontSize: T.typography.sizes.body, fontWeight: '700', color: T.colors.t1, padding: T.spacing.px4, paddingBottom: T.spacing.px3 },

          tableHeader: {
            flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10,
            borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
            backgroundColor: 'rgba(10,10,12,0.4)',
          },
          colHead: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t3, textTransform: 'uppercase', letterSpacing: 0.6 },

          row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
          rowBorder: { borderBottomWidth: 0.5, borderBottomColor: T.colors.b1 },
          rowDone: { backgroundColor: T.colors.forgeDim },

          cell: { fontSize: T.typography.sizes.bodyS, fontWeight: '500', color: T.colors.t1 },
          prBadge: {
            fontSize: 8, fontWeight: '800', color: T.colors.forge, letterSpacing: 0.5,
            marginBottom: 2,
          },

          inputCell: {
            backgroundColor: T.colors.bg2,
            borderRadius: T.radii.sm, height: 34,
            alignItems: 'center', justifyContent: 'center',
            marginHorizontal: 3,
            borderWidth: 1, borderColor: 'transparent',
          },
          inputCellDone: { borderColor: 'rgba(255,92,46,0.3)' },
          inputCellText: { fontSize: T.typography.sizes.body, fontWeight: '600', color: T.colors.t1 },

          checkBtn: {
            width: 28, height: 28, borderRadius: T.radii.full,
            backgroundColor: T.colors.bg3,
            borderWidth: 1.5, borderColor: T.colors.b1,
            alignItems: 'center', justifyContent: 'center',
          },
          checkBtnDone: {
            backgroundColor: T.colors.forge,
            borderColor: T.colors.forge,
            shadowColor: T.colors.forge,
            shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
          },

          addSetBtn: {
            paddingVertical: 14, alignItems: 'center',
            borderTopWidth: 0.5, borderTopColor: T.colors.b1,
          },
          addSetText: { fontSize: T.typography.sizes.bodyS, fontWeight: '600', color: T.colors.forge },

          deleteAction: {
            backgroundColor: T.colors.red,
            justifyContent: 'center',
            alignItems: 'center',
            width: 60,
          },
        });
