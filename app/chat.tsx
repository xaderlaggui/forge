import { MascotImages } from '@/constants/mascotImages';
import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { Flame, MapPin, Send, Timer, User as UserIcon, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SpriteMascot } from '../components/forge/SpriteMascot';
import { TypewriterText } from '../components/forge/TypewriterText';
import { COACH_SYSTEM_PROMPT } from '../constants/prompts';
import { getSpriteForActivity } from '../features/sprites/activity-sprite-map';
import { useNutrition } from '../hooks/useNutrition';
import { useWorkouts } from '../hooks/useWorkouts';
import { groqComplete, GroqMessage } from '../services/groq';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';



import { chatbotSpriteController } from '../features/sprites/ChatbotSpriteController';

interface LoggedActivity {
  activityName: string;
  type: string;
  durationMinutes: number;
  distanceKm?: number | null;
  calories?: number;
}

type Message = { id: string; text: string; isAi: boolean; logged?: boolean; activity?: LoggedActivity; spriteId?: string };

export default function ChatScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: nutrition } = useNutrition();
  const { workouts } = useWorkouts();
  const queryClient = useQueryClient();

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I'm your FORGE Coach. Tell me what you did today — like 'I ran 5km' — and I'll log it for you!",
      isAi: true,
      spriteId: 'smiling-coach'
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Chat history for multi-turn context
  const historyRef = useRef<GroqMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  // Track which AI message IDs have already finished typing (so they don't re-animate)
  const animatedIds = useRef<Set<string>>(new Set(['1'])); // '1' = initial greeting, show instantly

  // ── Bouncing dots animation ──
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);
  useEffect(() => {
    dot1.value = withRepeat(withSequence(withTiming(-5, { duration: 300 }), withTiming(0, { duration: 300 })), -1, true);
    setTimeout(() => { dot2.value = withRepeat(withSequence(withTiming(-5, { duration: 300 }), withTiming(0, { duration: 300 })), -1, true); }, 100);
    setTimeout(() => { dot3.value = withRepeat(withSequence(withTiming(-5, { duration: 300 }), withTiming(0, { duration: 300 })), -1, true); }, 200);
  }, []);
  const dot1Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const dot2Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const dot3Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText('');

    const userBubble: Message = { id: Date.now().toString(), text: userMsg, isAi: false };
    setMessages(prev => [...prev, userBubble]);
    setIsTyping(true);

    // Build message history
    historyRef.current.push({ role: 'user', content: userMsg });

    const recentWorkout = workouts?.[0];
    const caloriesEaten = nutrition?.totalCalories ?? 0;
    const dynamicPrompt = `${COACH_SYSTEM_PROMPT}\n\nCURRENT ATHLETE CONTEXT:\nAthlete: ${user?.displayName || 'Athlete'}\nStreak: ${(user as any)?.streak ?? 0} days\nCalories logged today: ${caloriesEaten} kcal\nLast workout: ${recentWorkout ? (recentWorkout.notes || `${recentWorkout.exercises.length} exercises on ${recentWorkout.date}`) : 'None recently'}\nUse this context to personalize your advice when relevant!`;

    try {
      const raw = await groqComplete(
        [
          { role: 'system', content: dynamicPrompt },
          ...historyRef.current,
        ],
        { max_tokens: 200, temperature: 0.75 }
      );

      // Try to parse as an activity log action
      let displayText = raw;
      let logged = false;

      let activity: LoggedActivity | undefined;

      try {
        // Extract JSON if it's embedded in text
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.action === 'log_activity' && user?.uid) {
            const actType = parsed.type || 'strength';
            const duration = parsed.durationMinutes ?? 0;
            const distance = parsed.distanceKm ?? null;

            // Rely on AI's calculated calories, fallback to basic formula
            const estCalories = parsed.calories ?? Math.round(duration * (actType === 'run' ? 10 : actType === 'walk' ? 4 : 5));
            const pace = parsed.pace ?? null;
            const steps = parsed.steps ?? null;

            let finalActivityName = parsed.activityName || 'Workout';
            finalActivityName = finalActivityName.charAt(0).toUpperCase() + finalActivityName.slice(1);

            const workoutId = `chat_${Date.now()}`;
            const { error } = await supabase.from('workouts').insert({
              id: workoutId,
              user_id: user.uid,
              date: dayjs().format('YYYY-MM-DD'),
              notes: finalActivityName,
              type: actType,
              exercises: [],
              "durationMin": duration,
              calories: estCalories,
              distanceKm: distance,
              pace: pace,
              steps: steps,
              created_at: new Date().toISOString(),
            });
            if (error) throw error;

            // Refresh workouts cache so history updates
            queryClient.invalidateQueries({ queryKey: ['workouts', user.uid] });

            displayText = parsed.message || 'Activity logged!';
            logged = true;
            activity = {
              activityName: finalActivityName,
              type: actType,
              durationMinutes: duration,
              distanceKm: distance,
              calories: estCalories,
            };
          }
        }
      } catch {
        // Not JSON — that's fine, it's a normal response
      }

      historyRef.current.push({ role: 'assistant', content: raw });
      const newMsgId = (Date.now() + 1).toString();
      const spriteConfig = chatbotSpriteController.getSpriteForMessage(userMsg, false, false);

      // Override activity-specific sprites for the avatar
      let finalSpriteId = 'smiling-coach';
      if (logged) {
        finalSpriteId = 'thumbs-up';
      }

      setMessages(prev => [...prev, {
        id: newMsgId,
        text: displayText,
        isAi: true,
        logged,
        activity,
        spriteId: finalSpriteId
      }]);

    } catch (err: any) {
      const errMsg = err?.message?.includes('not set')
        ? 'Add your EXPO_PUBLIC_GROQ_API_KEY in .env to chat with your coach!'
        : 'Sorry, I had trouble connecting. Try again in a moment!';

      const errorSpriteConfig = chatbotSpriteController.getSpriteForMessage(userMsg, false, true);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errMsg,
        isAi: true,
        spriteId: errorSpriteConfig.spriteId
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };


  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[s.msgRow, item.isAi ? s.msgRowAi : s.msgRowUser]}>
      {item.isAi && (
        <View style={[s.avatarWrap, { backgroundColor: 'transparent' }]}>
          <Image
            source={item.spriteId ? chatbotSpriteController.getAssetSource(item.spriteId) : MascotImages.coach}
            style={{ width: 45, height: 45, resizeMode: 'contain', position: 'absolute', bottom: 1, left: -13 }}
          />
        </View>
      )}
      <View style={[s.bubble, item.isAi ? s.bubbleAi : s.bubbleUser]}>
        {/* Activity Card */}
        {item.logged && item.activity && (
          <View style={s.activityCard}>
            <View style={{ marginRight: 12, alignSelf: 'center', marginLeft: -5 }}>
              <SpriteMascot spriteId={getSpriteForActivity(item.activity.activityName, item.activity.type)} size="md" />
            </View>
            <View style={s.activityCardInfo}>
              <Text style={s.activityCardBadge}>{capitalize(item.activity.type)} Logged ✓</Text>
              <Text style={s.activityCardName}>{item.activity.activityName}</Text>
              <View style={s.activityCardStats}>
                {item.activity.durationMinutes > 0 && (
                  <View style={s.activityStat}>
                    <Timer size={11} color={T.colors.t3} />
                    <Text style={s.activityStatText}>{item.activity.durationMinutes} min</Text>
                  </View>
                )}
                {item.activity.distanceKm != null && item.activity.distanceKm > 0 && (
                  <View style={s.activityStat}>
                    <MapPin size={11} color={T.colors.forge} />
                    <Text style={[s.activityStatText, { color: T.colors.forge, fontWeight: '700' }]}>{item.activity.distanceKm} km</Text>
                  </View>
                )}
                {(item.activity.calories ?? 0) > 0 && (
                  <View style={s.activityStat}>
                    <Flame size={11} color={T.colors.t3} />
                    <Text style={s.activityStatText}>~{item.activity.calories} kcal</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        {item.isAi ? (
          <TypewriterText
            style={[s.bubbleText, s.bubbleTextAi]}
            maxFontSizeMultiplier={1.2}
            text={item.text}
            delay={15}
            animate={!animatedIds.current.has(item.id)}
            onComplete={() => {
              animatedIds.current.add(item.id);
            }}
          />
        ) : (
          <Text style={[s.bubbleText, s.bubbleTextUser]} maxFontSizeMultiplier={1.2}>
            {item.text}
          </Text>
        )}
      </View>
      {!item.isAi && (
        <TouchableOpacity onPress={() => router.push('/settings')} activeOpacity={0.8}>
          <View style={[s.avatarWrap, { backgroundColor: T.colors.bg3, overflow: 'hidden' }]}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            ) : (
              <UserIcon size={15} color={T.colors.t1} />
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View>
            <Text style={s.headerTitle} maxFontSizeMultiplier={1.2}>FORGE Coach</Text>
            <View style={s.onlineDot}>
              <View style={s.onlineDotCircle} />
              <Text style={s.onlineText} maxFontSizeMultiplier={1.2}>Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <X size={18} color={T.colors.t2} />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={s.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Typing indicator ── */}
      {isTyping && (
        <View style={s.typingWrap}>
          <View style={[s.avatarWrap, { backgroundColor: 'transparent' }]}>
            <Image source={MascotImages.coach} style={{ width: 40, height: 35, resizeMode: 'contain', position: 'absolute', bottom: -5, left: -8 }} />
          </View>
          <View style={[s.bubble, s.bubbleAi, { minHeight: 38, justifyContent: 'center', paddingVertical: 0 }]}>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <Animated.View style={[s.typingDot, dot1Style]} />
              <Animated.View style={[s.typingDot, dot2Style]} />
              <Animated.View style={[s.typingDot, dot3Style]} />
            </View>
          </View>
        </View>
      )}

      {/* ── Input ── */}
      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          placeholder="Tell me what you did today..."
          placeholderTextColor={T.colors.t3}
          value={inputText}
          onChangeText={setInputText}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          multiline
          maxFontSizeMultiplier={1.2}
        />
        <TouchableOpacity
          style={[s.sendBtn, !inputText.trim() && { opacity: 0.4 }]}
          onPress={handleSend}
          disabled={!inputText.trim() || isTyping}
        >
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: T.spacing.px3, paddingHorizontal: T.spacing.page,
    borderBottomWidth: 0.5, borderBottomColor: T.colors.b1,
    backgroundColor: T.colors.bg1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: T.radii.full,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,92,46,0.25)',
  },
  headerTitle: { fontSize: T.typography.sizes.body, fontWeight: '700', color: T.colors.t1 },
  onlineDot: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDotCircle: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.colors.green },
  onlineText: { fontSize: T.typography.sizes.caption, color: T.colors.t3, fontWeight: '500' },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: T.colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },

  // List
  list: { padding: T.spacing.page, gap: 12, paddingBottom: T.spacing.px2 },

  // Bubbles
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowAi: { justifyContent: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  avatarWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: T.colors.forgeDim,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: T.radii.lg,
  },
  bubbleAi: { backgroundColor: T.colors.bg1, borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: T.colors.b1 },
  bubbleUser: { backgroundColor: T.colors.forge, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: T.typography.sizes.bodyS, lineHeight: T.typography.sizes.bodyS * 1.5 },
  bubbleTextAi: { color: T.colors.t1 },
  bubbleTextUser: { color: '#fff', fontWeight: '500' },

  loggedBadge: {
    fontSize: 9, fontWeight: '700', color: T.colors.forge,
    letterSpacing: 0.8, marginBottom: 5,
    textTransform: 'uppercase',
  },

  // Activity Card inside chat bubble
  activityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.colors.bg2, borderRadius: T.radii.lg,
    padding: 10, marginBottom: 10,
    borderWidth: 0.5, borderColor: T.colors.b1,
  },
  activityCardImage: {
    width: 48, height: 48,
  },
  activityCardInfo: { flex: 1 },
  activityCardBadge: {
    fontSize: 9, fontWeight: '800', color: T.colors.forge,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2,
  },
  activityCardName: {
    fontSize: 14, fontWeight: '700', color: T.colors.t1, marginBottom: 4,
  },
  activityCardStats: {
    flexDirection: 'row', gap: 10, flexWrap: 'wrap',
  },
  activityStat: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  activityStatText: {
    fontSize: 11, fontWeight: '600', color: T.colors.t3,
  },

  // Typing
  typingWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: T.spacing.page, paddingBottom: T.spacing.px2 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.colors.forge },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 14, paddingBottom: Platform.OS === 'ios' ? 55 : 14,
    borderTopWidth: 0.5, borderTopColor: T.colors.b1,
    backgroundColor: T.colors.bg1,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: T.colors.bg2,
    borderRadius: T.radii.full, paddingHorizontal: T.spacing.px4, paddingVertical: 12,
    fontSize: T.typography.sizes.bodyS, color: T.colors.t1,
    borderWidth: 0.5, borderColor: T.colors.b1,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: T.colors.forge,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
});
