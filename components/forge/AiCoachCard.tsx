import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MessageSquare, ChevronRight } from 'lucide-react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { TypewriterText } from './TypewriterText';

interface AiCoachCardProps {
  tip: string | null | undefined;
  isLoading?: boolean;
  onChatPress: () => void;
}

export function AiCoachCard({ tip, isLoading, onChatPress }: AiCoachCardProps) {
  const { T } = useForgeTheme();
    const { T: ForgeTheme } = useForgeTheme();
    const styles = useStyles(ForgeTheme);
  return (
    <View style={styles.card}>
      {/* Left forge accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <MessageSquare size={18} color={T.colors.forge} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Personalized</Text>

          {isLoading ? (
            <ActivityIndicator size="small" color={T.colors.forge} style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : (
            <TypewriterText
              style={styles.tipText}
              numberOfLines={3}
              text={tip || "You're doing great! Keep pushing your limits today."}
              delay={18}
              animate={!!tip}
            />
          )}

          <TouchableOpacity style={styles.chatBtn} onPress={onChatPress} activeOpacity={0.7}>
            <Text style={styles.chatBtnText}>Chat with Coach</Text>
            <ChevronRight size={14} color={T.colors.forge} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
          card: {
            backgroundColor: T.colors.bg1,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: T.colors.b1,
            overflow: 'hidden',
            flexDirection: 'row',
            shadowColor: T.colors.forge,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.04,
            shadowRadius: 20,
            elevation: 3,
          },
          accentBar: {
            width: 3,
            backgroundColor: T.colors.forge,
          },
          row: {
            flex: 1,
            flexDirection: 'row',
            gap: 12,
            padding: 16,
          },
          iconWrap: {
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: T.colors.bg2,
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          },
          content: { flex: 1 },
          label: {
            fontSize: 10, fontWeight: '700',
            color: T.colors.forge,
            textTransform: 'uppercase', letterSpacing: 0.6,
            marginBottom: 6,
          },
          tipText: { fontSize: 13, color: T.colors.t1, lineHeight: 20 },
          chatBtn: {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: T.colors.bg2,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            marginTop: 12,
          },
          chatBtnText: { fontSize: 12, fontWeight: '600', color: T.colors.forge },
        });
