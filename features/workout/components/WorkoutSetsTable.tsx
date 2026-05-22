import { useForgeTheme } from "@/hooks/useForgeTheme";
import { Check, Trash2, Trophy } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ExerciseState } from '../types';

interface WorkoutSetsTableProps {
  exercises: ExerciseState[];
  personalRecords?: Record<string, Record<string, number>>;
  onToggleSet: (exIdx: number, setIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onRemoveSet?: (exIdx: number, setIdx: number) => void;
  onOpenNumpad: (exIdx: number, setIdx: number, field: 'weight' | 'reps') => void;
}

export function WorkoutSetsTable({ exercises, personalRecords, onToggleSet, onAddSet, onRemoveSet, onOpenNumpad }: WorkoutSetsTableProps) {
  const { T, isDark } = useForgeTheme();
  const styles = useStyles(T, isDark);
  const renderRightActions = (exIdx: number, setIdx: number) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => onRemoveSet?.(exIdx, setIdx)}
      >
        <Trash2 size={20} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {exercises.map((ex, exIdx) => (
        <View key={exIdx} style={styles.exerciseBlock}>


          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colHead, { flex: 0.6 }]} maxFontSizeMultiplier={1.2}>SET</Text>
            <Text style={[styles.colHead, { flex: 1.4 }]} maxFontSizeMultiplier={1.2}>PREVIOUS</Text>
            <Text style={[styles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>LBS</Text>
            <Text style={[styles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>REPS</Text>
            <View style={{ flex: 0.6, alignItems: 'center' }}>
              <Check size={11} color={T.colors.t2} strokeWidth={3} />
            </View>
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
                  style={[styles.row, set.done && styles.rowDone, setIdx < ex.sets.length - 1 && styles.rowBorder]}
                >
                  <View style={{ flex: 0.6 }}>
                    <Text style={[styles.cell, { color: T.colors.t2 }]} maxFontSizeMultiplier={1.2}>{setIdx + 1}</Text>
                  </View>
                  <View style={{ flex: 1.4 }}>
                    {isPR && (
                      <View style={styles.prBadge}>
                        <Trophy size={10} color={T.colors.gold ?? '#FFD700'} />
                        <Text style={styles.prBadgeText} maxFontSizeMultiplier={1.2}>NEW PR</Text>
                      </View>
                    )}
                    <Text style={[styles.cell, { color: T.colors.t3, fontSize: T.typography.sizes.bodyS }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                      {set.prev}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.inputCell, { flex: 1 }, set.done && styles.inputCellDone]}
                    onPress={() => onOpenNumpad(exIdx, setIdx, 'weight')}
                  >
                    <Text style={styles.inputCellText} maxFontSizeMultiplier={1.2}>{set.weight || '—'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.inputCell, { flex: 1 }, set.done && styles.inputCellDone]}
                    onPress={() => onOpenNumpad(exIdx, setIdx, 'reps')}
                  >
                    <Text style={styles.inputCellText} maxFontSizeMultiplier={1.2}>{set.reps || '—'}</Text>
                  </TouchableOpacity>

                  <View style={[{ flex: 0.6, alignItems: 'center' }]}>
                    <TouchableOpacity
                      style={[styles.checkBtn, set.done && styles.checkBtnDone]}
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
          <TouchableOpacity style={styles.addSetBtn} onPress={() => onAddSet(exIdx)}>
            <Text style={styles.addSetText} maxFontSizeMultiplier={1.2}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const useStyles = (T: any, isDark: boolean) => StyleSheet.create({
  exerciseBlock: {
    backgroundColor: T.colors.bg1,
    ...T.shadows.lift, borderRadius: T.radii.xl, borderWidth: 0.5, borderColor: T.colors.b1,
    overflow: 'hidden'
  },
  exName: { fontSize: T.typography.sizes.body, fontWeight: '700', color: T.colors.t1, padding: T.spacing.px4, paddingBottom: T.spacing.px3 },

  tableHeader: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 20,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
    backgroundColor: T.colors.bg2,
  },
  colHead: { fontSize: T.typography.sizes.caption, fontWeight: '600', color: T.colors.t2, textTransform: 'uppercase', letterSpacing: 0.6 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: T.colors.b1 },
  rowDone: { backgroundColor: T.colors.forgeDim },

  cell: { fontSize: T.typography.sizes.bodyS, fontWeight: '500', color: T.colors.t1 },
  prBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: 3,
  },
  prBadgeText: {
    fontSize: 8, fontWeight: '800', color: T.colors.gold ?? '#FFD700', letterSpacing: 0.5,
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
