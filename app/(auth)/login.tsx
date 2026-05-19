import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  Image,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { MascotImages } from '../../constants/mascotImages';
import { supabase } from '../../services/supabase';

export default function LoginScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Entrance animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  React.useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) }));
    translateY.value = withDelay(100, withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) }));
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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      // onAuthStateChange in _layout.tsx handles redirect
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
      <View style={s.innerWrapper}>
        <Animated.View style={[s.inner, animStyle]}>

          <View style={{ width: 210, height: 210, borderRadius: 100, backgroundColor: T.colors.forgeDim, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={MascotImages.welcome}
              style={{ width: 210, height: 210, resizeMode: 'contain' }}
              accessibilityLabel="Forge the bear waving hello"
            />
          </View>
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
              ? <ActivityIndicator color="#000" />
              : <Text style={s.btnText}>Log In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Google/Apple SSO */}
          <View style={s.ssoRow}>
            <TouchableOpacity style={s.ssoBtn} activeOpacity={0.75}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path fill={T.colors.t1} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <Path fill={T.colors.t1} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <Path fill={T.colors.t1} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <Path fill={T.colors.t1} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={s.ssoBtn} activeOpacity={0.75}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path fill={T.colors.t1} d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.52.88 3.2 1.02.66-.21 2.36-1.32 4.14-1.06 1.34.1 2.65.68 3.44 1.77-2.91 1.62-2.45 5.5.53 6.64-1.12 1.83-2.19 3.54-3.31 4.6zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </Svg>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const useS = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  innerWrapper: { flex: 1 },
  inner: {
    flex: 1, paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingBottom: 24,
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
  btnText: { color: '#000000', fontSize: 16, fontWeight: '700' },

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
