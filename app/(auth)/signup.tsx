import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { MascotImage } from '../../components/common/MascotImage';
import { ForgeTheme as T } from '../../constants/ForgeTheme';
import { auth, db } from '../../services/firebase';

function InputField({
  icon, placeholder, value, onChangeText,
  fieldKey, secureTextEntry = false,
  keyboardType = 'default', returnKeyType = 'next',
  focusedField, setFocusedField
}: any) {
  return (
    <View style={[s.inputWrap, focusedField === fieldKey && s.inputWrapFocused]}>
      {React.cloneElement(icon, {
        color: focusedField === fieldKey ? T.colors.forge : T.colors.t3,
        size: 18,
      })}
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={T.colors.t3}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={fieldKey === 'email' ? 'none' : 'words'}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onFocus={() => setFocusedField(fieldKey)}
        onBlur={() => setFocusedField(null)}
      />
    </View>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(user, { displayName: name.trim() });
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name.trim(),
        createdAt: new Date().toISOString(),
        streak: 0,
        bmi: 0,
        height: 0,
        weight: 0,
        age: 0,
      });
      // Auth listener handles redirect to onboarding/tabs
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
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

          {/* Back to login */}
          <TouchableOpacity style={s.backRow} onPress={() => router.back()}>
            <Text style={s.backText}>← Back to Login</Text>
          </TouchableOpacity>

          <MascotImage
            mascot="welcome"
            width={150}
            height={150}
            animation="slideUp"
            accessibilityLabel="Forge the bear welcoming you to FORGE"
            style={{ alignSelf: 'center', marginBottom: 8 }}
          />
          {/* Brand */}
          <Text style={s.wordmark}>FORGE</Text>
          <Text style={s.title}>Create your account</Text>
          <Text style={s.subtitle}>Start building your best self today.</Text>

          {/* Fields */}
          <InputField
            fieldKey="name"
            icon={<User />}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            keyboardType="default"
            focusedField={focusedField}
            setFocusedField={setFocusedField}
          />
          <InputField
            fieldKey="email"
            icon={<Mail />}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            focusedField={focusedField}
            setFocusedField={setFocusedField}
          />
          <InputField
            fieldKey="password"
            icon={<Lock />}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            focusedField={focusedField}
            setFocusedField={setFocusedField}
          />
          <InputField
            fieldKey="confirm"
            icon={<Lock />}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            focusedField={focusedField}
            setFocusedField={setFocusedField}
          />

          {/* CTA */}
          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          {/* Terms */}
          <Text style={s.terms}>
            By signing up, you agree to our{' '}
            <Text style={{ color: T.colors.forge }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: T.colors.forge }}>Privacy Policy</Text>.
          </Text>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={s.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg0 },
  innerWrapper: { flex: 1 },
  inner: {
    flex: 1, paddingHorizontal: 24,
    paddingTop: 54, paddingBottom: 24,
    alignItems: 'center', justifyContent: 'center'
  },

  backRow: { alignSelf: 'flex-start', marginBottom: 28 },
  backText: { fontSize: 13, color: T.colors.t3, fontWeight: '500' },

  wordmark: {
    fontSize: 28, fontWeight: '800', letterSpacing: 4,
    color: T.colors.forge, marginBottom: 16,
    textShadowColor: 'rgba(255,92,46,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  title: { fontSize: 22, fontWeight: '700', color: T.colors.t1, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: T.colors.t2, textAlign: 'center', marginBottom: 32 },

  // Inputs
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    width: '100%', height: 56,
    backgroundColor: T.colors.bg2,
    borderRadius: 16, paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1, borderColor: 'transparent',
  },
  inputWrapFocused: {
    borderColor: T.colors.forge,
    backgroundColor: T.colors.bg1,
  },
  input: { flex: 1, fontSize: 15, color: T.colors.t1 },

  // Button
  btn: {
    width: '100%', height: 56,
    backgroundColor: T.colors.forge,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  terms: { fontSize: 11, color: T.colors.t3, textAlign: 'center', marginTop: 16, lineHeight: 18 },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 13, color: T.colors.t3 },
  footerLink: { fontSize: 13, color: T.colors.forge, fontWeight: '600' },
});
