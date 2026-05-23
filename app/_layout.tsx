import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForgeTheme } from '@/hooks/useForgeTheme';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'splash',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const { setUser, setLoading } = useAuthStore();
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Explicitly restore session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              displayName: profile?.display_name || '',
              isOnboarded: profile?.is_onboarded || false,
              ...profile,
            } as any);
          } catch (e) {
            console.error('Error fetching user profile:', e);
            setUser({ uid: session.user.id, email: session.user.email || '', displayName: '', isOnboarded: false } as any);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

function RootLayoutNav() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const { T, isDark } = useForgeTheme();
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: T.colors.forge,
      background: T.colors.bg0,
      card: T.colors.bg1,
      text: T.colors.t1,
      border: T.colors.b1,
      notification: T.colors.forge,
    },
  };

  useEffect(() => {
    // Wait for both fonts and auth state to resolve
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSplash    = segments[0] === 'splash';

    // Never redirect while on splash or while segments haven't resolved yet.
    // The splash screen is the sole gatekeeper for initial navigation.
    if (inSplash || !segments[0]) return;

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
    } else if (user) {
      const currentRoute = segments.join('/');
      const isSignupFlow = currentRoute.includes('password') || currentRoute.includes('hooray') || currentRoute.includes('otp') || currentRoute.includes('signup');

      // Do not navigate away if the user is in the middle of signup
      if (isSignupFlow) {
        return;
      }

      if (!user.isOnboarded && currentRoute !== 'personalize') {
        router.replace('/personalize');
      } else if (user.isOnboarded && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={navTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="splash" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="personalize" options={{ presentation: 'modal', gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="addMeal"      options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true }} />
            <Stack.Screen name="measurements" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true }} />
            <Stack.Screen name="chat"         options={{ presentation: 'modal', sheetGrabberVisible: true }} />
            <Stack.Screen name="activeWorkout" />
            <Stack.Screen name="workoutHistory" />
            <Stack.Screen name="workoutDetail" />
            <Stack.Screen name="editProfile" />
            <Stack.Screen name="privacySecurity" />
            <Stack.Screen name="aiPlan" />
            <Stack.Screen name="buildRoutine" />
            <Stack.Screen name="plan-generator" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
