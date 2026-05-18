import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup       = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inSplash          = segments[0] === 'splash';

    // Don't redirect while splash is animating or segments haven't resolved yet
    if (inSplash || !segments[0]) return;

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (user) {
      if (!user.isOnboarded && !inOnboardingGroup) {
        router.replace('/(onboarding)');
      } else if (user.isOnboarded && (inAuthGroup || inOnboardingGroup)) {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="addMeal"      options={{ presentation: 'modal' }} />
          <Stack.Screen name="measurements" options={{ presentation: 'modal' }} />
          <Stack.Screen name="chat"         options={{ presentation: 'modal' }} />
          <Stack.Screen name="activeWorkout" />
          <Stack.Screen name="workoutHistory" />
          <Stack.Screen name="workoutDetail" />
          <Stack.Screen name="editProfile" />
          <Stack.Screen name="privacySecurity" />
          <Stack.Screen name="aiPlan" />
          <Stack.Screen name="buildRoutine" />
          <Stack.Screen name="plan-generator" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
