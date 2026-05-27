import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useRouter } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert,
  Keyboard, KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity, TouchableWithoutFeedback,
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
import { supabase } from '../../services/supabase';

function InputField({
  icon, placeholder, value, onChangeText,
  fieldKey, secureTextEntry = false,
  keyboardType = 'default', returnKeyType = 'next',
  focusedField, setFocusedField, onSubmitEditing,
  validationState
}: any) {
  const { T } = useForgeTheme();
  const s = useS(T);

  let borderColor = 'transparent';
  if (validationState === 'error') borderColor = '#ef4444';
  else if (validationState === 'success') borderColor = '#4ade80';
  else if (focusedField === fieldKey) borderColor = T.colors.forge;

  return (
    <View style={[
      s.inputWrap,
      focusedField === fieldKey && s.inputWrapFocused,
      validationState && { borderColor, borderWidth: 1 }
    ]}>
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
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

export default function SignupScreen() {
  const { T } = useForgeTheme();
  const s = useS(T);
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const [hasLength, setHasLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  React.useEffect(() => {
    setHasLength(password.length >= 8);
    setHasUpper(/[A-Z]/.test(password));
    setHasSpecial(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setPasswordsMatch(password.length > 0 && password === confirmPassword);
  }, [password, confirmPassword]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  React.useEffect(() => {
    if (!isValidEmail) {
      setEmailAvailable(null);
      setEmailTaken(false);
      return;
    }

    const checkEmail = async () => {
      const { data, error } = await supabase.rpc('is_email_taken', { lookup_email: email.trim().toLowerCase() });
      if (!error && data !== null) {
        setEmailTaken(data);
        setEmailAvailable(!data);
      }
    };

    const timer = setTimeout(checkEmail, 600);
    return () => clearTimeout(timer);
  }, [email, isValidEmail]);

  const allPasswordRulesMet = hasLength && hasUpper && hasSpecial && hasNumber;
  const isValid = allPasswordRulesMet && passwordsMatch && name.trim() && isValidEmail && !emailTaken;

  // Entrance animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) }));
    translateY.value = withDelay(100, withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) }));

    const kbs = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const kbw = Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true));
    const kbh = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    const kbwh = Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false));
    return () => { kbs.remove(); kbw.remove(); kbh.remove(); kbwh.remove(); };
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleSignup = async () => {
    if (!isValid) {
      Alert.alert('Invalid Form', 'Please ensure all fields and password requirements are met.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            display_name: name.trim(),
          },
        },
      });
      if (error) throw error;

      // Supabase returns an empty identities array if the email is already in use
      if (data.user?.identities?.length === 0) {
        setEmailTaken(true);
        return;
      }

      // Navigate to OTP screen
      router.push({
        pathname: './otp',
        params: { email: email.trim(), name: name.trim() }
      });

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={s.innerWrapper}>
        <Animated.View style={[s.inner, animStyle]}>

          {/* Back to login */}
          <TouchableOpacity style={s.backRow} onPress={() => router.back()}>
            <Text style={s.backText}>← Back to Login</Text>
          </TouchableOpacity>

          {!isKeyboardVisible && (
            <MascotImage
              mascot="welcome"
              width={150}
              height={150}
              animation="slideUp"
              accessibilityLabel="Forge the bear welcoming you to FORGE"
              style={{ alignSelf: 'center', marginBottom: 8 }}
            />
          )}

          {!isKeyboardVisible && (
            <>
              <Text style={s.wordmark}>FORGE</Text>
              <Text style={s.title}>Create your account</Text>
              <Text style={s.subtitle}>Start building your best self today.</Text>
            </>
          )}

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
            validationState={emailTaken || (email.length > 0 && !isValidEmail) ? 'error' : (emailAvailable ? 'success' : null)}
          />
          {email.length > 0 && !isValidEmail && (
            <Text style={s.emailTakenText}>Invalid email format</Text>
          )}
          {emailTaken && (
            <Text style={s.emailTakenText}>Email already taken</Text>
          )}
          <InputField
            fieldKey="password"
            icon={<Lock />}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            focusedField={focusedField}
            setFocusedField={setFocusedField}
            validationState={password.length > 0 ? (allPasswordRulesMet ? 'success' : 'error') : null}
          />
          {/* Password Validation Rules */}
          {password.length > 0 && !allPasswordRulesMet && (
            <View style={s.validationContainer}>
              {!hasLength && (
                <Text style={s.ruleFail}>• Minimum 8 characters</Text>
              )}
              {!hasUpper && (
                <Text style={s.ruleFail}>• At least 1 uppercase letter</Text>
              )}
              {!hasSpecial && (
                <Text style={s.ruleFail}>• At least 1 special character</Text>
              )}
              {!hasNumber && (
                <Text style={s.ruleFail}>• At least 1 number</Text>
              )}
            </View>
          )}

          <InputField
            fieldKey="confirmPassword"
            icon={<Lock />}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            focusedField={focusedField}
            setFocusedField={setFocusedField}
            onSubmitEditing={handleSignup}
            validationState={confirmPassword.length > 0 ? (passwordsMatch ? 'success' : 'error') : null}
          />

          {/* Confirm Match Indicator */}
          {confirmPassword.length > 0 && !passwordsMatch && (
            <Text style={s.matchText}>✕ Passwords do not match</Text>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[s.btn, (!isValid || loading) && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Continue</Text>
            }
          </TouchableOpacity>

          {/* Terms + Footer — hidden when keyboard is up */}
          {!isKeyboardVisible && (
            <>
              <Text style={s.terms}>
                By signing up, you agree to our{' '}
                <Text style={{ color: T.colors.forge }}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={{ color: T.colors.forge }}>Privacy Policy</Text>.
              </Text>

              <View style={s.footer}>
                <Text style={s.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={s.footerLink}>Log in</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const useS = (T: any) => StyleSheet.create({
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

  // Validation
  validationContainer: { width: '100%', marginBottom: 12, paddingHorizontal: 4 },
  ruleFail: { fontSize: 13, color: T.colors.danger || '#ef4444', marginBottom: 4 },
  matchText: { fontSize: 13, alignSelf: 'flex-start', paddingHorizontal: 4, marginBottom: 12, marginTop: -4, color: T.colors.danger || '#ef4444' },
  emailTakenText: { fontSize: 13, alignSelf: 'flex-start', paddingHorizontal: 4, marginBottom: 12, marginTop: -4, color: T.colors.danger || '#ef4444', fontWeight: '500' },

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
