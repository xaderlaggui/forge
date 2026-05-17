import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { ForgeTheme as T } from '../../constants/ForgeTheme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Entrance animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  React.useEffect(() => {
    opacity.value    = withDelay(100, withTiming(1,  { duration: 600, easing: Easing.out(Easing.exp) }));
    translateY.value = withDelay(100, withTiming(0,  { duration: 600, easing: Easing.out(Easing.exp) }));
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Auth listener in _layout.tsx handles redirect
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[s.inner, animStyle]}>

          {/* Brand */}
          <View style={s.brandRow}>
            <Text style={s.wordmark}>FORGE</Text>
          </View>
          <Text style={s.subtitle}>Sign in to track your progress.</Text>

          {/* Email */}
          <View style={[s.inputWrap, focusedField === 'email' && s.inputWrapFocused]}>
            <Mail size={18} color={focusedField === 'email' ? T.colors.forge : T.colors.t3} />
            <TextInput
              style={s.input}
              placeholder="Email address"
              placeholderTextColor={T.colors.t3}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={[s.inputWrap, focusedField === 'password' && s.inputWrapFocused]}>
            <Lock size={18} color={focusedField === 'password' ? T.colors.forge : T.colors.t3} />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={T.colors.t3}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Get Started</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Google/Apple SSO placeholders */}
          <View style={s.ssoRow}>
            <TouchableOpacity style={s.ssoBtn} activeOpacity={0.75}>
              <Text style={s.ssoIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ssoBtn} activeOpacity={0.75}>
              <Text style={s.ssoIcon}>🍎</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={s.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  scroll: { flexGrow: 1 },
  inner: {
    flex: 1, paddingHorizontal: 24,
    paddingTop: 100, paddingBottom: 48,
    alignItems: 'center',
  },

  // Brand
  brandRow: { marginBottom: 10 },
  wordmark: {
    fontSize: 36, fontWeight: '800', letterSpacing: 5,
    color: T.colors.forge,
    textShadowColor: 'rgba(255,92,46,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  subtitle: { fontSize: 14, color: T.colors.t2, textAlign: 'center', marginBottom: 40 },

  // Inputs
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    width: '100%', height: 56,
    backgroundColor: T.colors.bg2,
    borderRadius: 16, paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: 'transparent',
  },
  inputWrapFocused: {
    borderColor: T.colors.forge,
    backgroundColor: T.colors.bg1,
  },
  input: {
    flex: 1, fontSize: 15, color: T.colors.t1,
  },

  // Button
  btn: {
    width: '100%', height: 56,
    backgroundColor: T.colors.forge,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginTop: 6,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginVertical: 28 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: T.colors.b1 },
  dividerText: { fontSize: 11, color: T.colors.t3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 },

  // SSO
  ssoRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  ssoBtn: {
    flex: 1, height: 56,
    backgroundColor: T.colors.bg1, borderRadius: 16,
    borderWidth: 0.5, borderColor: T.colors.b1,
    alignItems: 'center', justifyContent: 'center',
  },
  ssoIcon: { fontSize: 20 },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 13, color: T.colors.t3 },
  footerLink: { fontSize: 13, color: T.colors.forge, fontWeight: '600' },
});
