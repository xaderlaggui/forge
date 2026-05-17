import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { Bot, Send, User as UserIcon, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Image,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence,
} from 'react-native-reanimated';
import { ForgeTheme as T } from '../constants/ForgeTheme';
import { groqComplete, GroqMessage } from '../services/groq';
import { db } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import { useNutrition } from '../hooks/useNutrition';
import { useWorkouts } from '../hooks/useWorkouts';

const BASE_SYSTEM_PROMPT = `You are FORGE Coach — an energetic, supportive AI fitness coach inside a workout tracking app.

BEHAVIOR RULES:
1. Keep replies SHORT (1–3 sentences). Be punchy and motivating.
2. If the user describes any physical activity (walking, running, gym, cycling, etc.), you MUST respond with valid JSON in this exact format — nothing else, no extra text:
   {"action":"log_activity","activityName":"<name>","durationMinutes":<number>,"notes":"<optional notes>","message":"<your motivating reply>"}
3. For all other messages, reply as plain conversational text (no JSON).
4. Never use markdown. Never use asterisks.`;

type Message = { id: string; text: string; isAi: boolean; logged?: boolean };

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: nutrition } = useNutrition();
  const { workouts } = useWorkouts();

  const [inputText, setInputText] = useState('');
  const [messages, setMessages]   = useState<Message[]>([
    { id: '1', text: "Hey! I'm your FORGE Coach. Tell me what you did today — like 'I ran 5km' — and I'll log it for you!", isAi: true },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Chat history for multi-turn context
  const historyRef = useRef<GroqMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

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
    const dynamicPrompt = `${BASE_SYSTEM_PROMPT}\n\nCURRENT ATHLETE CONTEXT:\nAthlete: ${user?.displayName || 'Athlete'}\nStreak: ${(user as any)?.streak ?? 0} days\nCalories logged today: ${caloriesEaten} kcal\nLast workout: ${recentWorkout ? (recentWorkout.notes || `${recentWorkout.exercises.length} exercises on ${recentWorkout.date}`) : 'None recently'}\nUse this context to personalize your advice when relevant!`;

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

      try {
        // Extract JSON if it's embedded in text
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.action === 'log_activity' && user?.uid) {
            await addDoc(collection(db, `users/${user.uid}/workouts`), {
              date: dayjs().format('YYYY-MM-DD'),
              notes: parsed.activityName,
              exercises: [],
              durationMin: parsed.durationMinutes ?? 0,
              calories: Math.round((parsed.durationMinutes ?? 0) * 5),
              createdAt: new Date().toISOString(),
            });
            displayText = `✅ Logged: ${parsed.activityName}${parsed.notes ? ` (${parsed.notes})` : ''}\n\n${parsed.message}`;
            logged = true;
          }
        }
      } catch {
        // Not JSON — that's fine, it's a normal response
      }

      historyRef.current.push({ role: 'assistant', content: raw });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: displayText, isAi: true, logged }]);

    } catch (err: any) {
      const errMsg = err?.message?.includes('not set')
        ? 'Add your EXPO_PUBLIC_GROQ_API_KEY in .env to chat with your coach!'
        : 'Sorry, I had trouble connecting. Try again in a moment!';
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: errMsg, isAi: true }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[s.msgRow, item.isAi ? s.msgRowAi : s.msgRowUser]}>
      {item.isAi && (
        <View style={s.avatarWrap}>
          <Image source={require('../assets/images/mascot_ai.png')} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
        </View>
      )}
      <View style={[s.bubble, item.isAi ? s.bubbleAi : s.bubbleUser]}>
        {item.logged && <Text style={s.loggedBadge} maxFontSizeMultiplier={1.2}>WORKOUT LOGGED</Text>}
        <Text style={[s.bubbleText, item.isAi ? s.bubbleTextAi : s.bubbleTextUser]} maxFontSizeMultiplier={1.2}>
          {item.text}
        </Text>
      </View>
      {!item.isAi && (
        <View style={[s.avatarWrap, { backgroundColor: T.colors.bg3 }]}>
          <UserIcon size={15} color={T.colors.t1} />
        </View>
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
          <View style={s.headerAvatar}>
            <Image source={require('../assets/images/mascot_ai.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
          </View>
          <View>
            <Text style={s.headerTitle} maxFontSizeMultiplier={1.2}>FORGE Coach</Text>
            <View style={s.onlineDot}>
              <View style={s.onlineDotCircle} />
              <Text style={s.onlineText} maxFontSizeMultiplier={1.2}>Online · Groq AI (Llama 3.3)</Text>
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
          <View style={s.avatarWrap}>
            <Image source={require('../assets/images/mascot_ai.png')} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
          </View>
          <View style={s.bubbleAi}>
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

const s = StyleSheet.create({
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
  msgRowAi:   { justifyContent: 'flex-start' },
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
  bubbleAi:   { backgroundColor: T.colors.bg1, borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: T.colors.b1 },
  bubbleUser: { backgroundColor: T.colors.forge, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: T.typography.sizes.bodyS, lineHeight: T.typography.sizes.bodyS * 1.5 },
  bubbleTextAi:   { color: T.colors.t1 },
  bubbleTextUser: { color: '#fff', fontWeight: '500' },

  loggedBadge: {
    fontSize: 9, fontWeight: '700', color: T.colors.forge,
    letterSpacing: 0.8, marginBottom: 5,
    textTransform: 'uppercase',
  },

  // Typing
  typingWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: T.spacing.page, paddingBottom: T.spacing.px2 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.colors.forge },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 14, paddingBottom: Platform.OS === 'ios' ? 28 : 14,
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
