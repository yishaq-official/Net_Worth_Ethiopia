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
      // User is logged in, check if terms are accepted
      const checkTerms = async () => {
        const user = session.user as any;
        
        if (user && !user.acceptedTerms) {
          // Did not pre-accept, send to terms screen if not already there
          if (segments[1] !== 'terms') {
            router.replace('/(auth)/terms');
          }
        } else if (inAuthGroup) {
          router.replace('/');
        }
      };
      
      checkTerms();
    }
  }, [session, isPending, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
