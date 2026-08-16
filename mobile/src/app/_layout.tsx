import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { authClient } from '@/lib/auth-client';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      if (!inAuthGroup) {
        // Prevent redirect loop if already in auth group
        router.replace('/(auth)/login');
      }
    } else {
      if (inAuthGroup) {
        if (segments[1] === 'signup-success') {
          // Let signup-success do its thing and then redirect
        } else {
          router.replace('/');
        }
      }
    }
  }, [session, isPending, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
