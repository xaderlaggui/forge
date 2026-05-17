import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";

interface MuscleTagChipProps {
  label: string;
}

export function MuscleTagChip({ label }: MuscleTagChipProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const styles = useStyles(ForgeTheme);
  return (
    <View style={useStyles.chip}>
      <Text style={useStyles.chipText}>{label}</Text>
    </View>
  );
}

interface WorkoutListItemProps {
  title: string;
  date: string;
  icon?: string;
  stat?: string;
  isLast?: boolean;
  onPress?: () => void;
}

export function WorkoutListItem({ title, date, icon = '🔥', stat, isLast, onPress }: WorkoutListItemProps) {
    const { T: ForgeTheme } = useForgeTheme();
    const styles = useStyles(ForgeTheme);
  return (
    <TouchableOpacity
      style={[useStyles.row, !isLast && useStyles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={useStyles.iconWrap}>
        <Text style={useStyles.iconEmoji}>{icon}</Text>
      </View>
      <View style={useStyles.textWrap}>
        <Text style={useStyles.title} numberOfLines={1}>{title}</Text>
        <Text style={useStyles.date}>{date}</Text>
      </View>
      {!!stat && <Text style={useStyles.stat}>{stat}</Text>}
    </TouchableOpacity>
  );
}

const useStyles = (T: any) => StyleSheet.create({
          // MuscleTagChip
          chip: {
            paddingHorizontal: 10, paddingVertical: 3,
            borderRadius: 100,
            backgroundColor: ForgeTheme.colors.bg3,
          },
          chipText: { color: ForgeTheme.colors.t1, fontSize: 11, fontWeight: '500' },

          // WorkoutListItem
          row: {
            flexDirection: 'row', alignItems: 'center', gap: 12,
            paddingVertical: 12, paddingHorizontal: 16,
          },
          rowBorder: { borderBottomWidth: 0.5, borderBottomColor: ForgeTheme.colors.b1 },
          iconWrap: {
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: ForgeTheme.colors.bg2,
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          },
          iconEmoji: { fontSize: 18 },
          textWrap: { flex: 1 },
          title: { fontSize: 14, fontWeight: '500', color: ForgeTheme.colors.t1 },
          date: { fontSize: 11, color: ForgeTheme.colors.t3, marginTop: 2 },
          stat: { fontSize: 11, fontWeight: '600', color: '#34C759' },
        });
