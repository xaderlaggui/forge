import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { ForgeTheme as T } from '../../../constants/ForgeTheme';
import { ExerciseState } from '../types';

interface WorkoutSetsTableProps {
  exercises: ExerciseState[];
  onToggleSet: (exIdx: number, setIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onOpenNumpad: (exIdx: number, setIdx: number, field: 'weight' | 'reps') => void;
}

export function WorkoutSetsTable({ exercises, onToggleSet, onAddSet, onOpenNumpad }: WorkoutSetsTableProps) {
  return (
    <View>
      {exercises.map((ex, exIdx) => (
        <View key={exIdx} style={styles.exerciseBlock}>
          <Text style={styles.exName} maxFontSizeMultiplier={1.2}>{ex.name}</Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colHead, { flex: 0.6 }]} maxFontSizeMultiplier={1.2}>SET</Text>
            <Text style={[styles.colHead, { flex: 1.4 }]} maxFontSizeMultiplier={1.2}>PREVIOUS</Text>
            <Text style={[styles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>LBS</Text>
            <Text style={[styles.colHead, { flex: 1 }]} maxFontSizeMultiplier={1.2}>REPS</Text>
            <Text style={[styles.colHead, { flex: 0.6, textAlign: 'center' }]} maxFontSizeMultiplier={1.2}>✓</Text>
          </View>

          {/* Set rows */}
          {ex.sets.map((set, setIdx) => (
            <View
              key={setIdx}
              style={[styles.row, set.done && styles.rowDone, setIdx < ex.sets.length - 1 && styles.rowBorder]}
            >
              <Text style={[styles.cell, { flex: 0.6, color: T.colors.t2 }]} maxFontSizeMultiplier={1.2}>{setIdx + 1}</Text>
              <Text style={[styles.cell, { flex: 1.4, color: T.colors.t3, fontSize: T.typography.sizes.bodyS }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {set.prev}
              </Text>

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
          ))}

          {/* Add set */}
          <TouchableOpacity style={styles.addSetBtn} onPress={() => onAddSet(exIdx)}>
            <Text style={styles.addSetText} maxFontSizeMultiplier={1.2}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
