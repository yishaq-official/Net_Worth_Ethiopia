import '../global.css';
import '@/lib/online-manager-polyfill';
import { useEffect } from 'react';
import { DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { authClient } from '@/lib/auth-client';
import { useBusinessStore } from '@/store/business-store';
import { initLocalDatabase } from '@/db/migrations';
import { useNetworkSync } from '@/hooks/use-network-sync';
import { useLocalNotifications } from '@/hooks/use-local-notifications';
import { InAppToast } from '@/components/common/in-app-toast';

import { Platform, Text, TextInput } from 'react-native';
import {
  useFonts,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
} from '@expo-google-fonts/lexend';

// Configure default font for React Native Text & TextInput host components
if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.style = { fontFamily: 'Lexend_400Regular' };

if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.style = { fontFamily: 'Lexend_400Regular' };

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap';
  document.head.appendChild(link);
}

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

import { useAuthRole } from '@/hooks/use-auth-role';

export default function TabLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
    'Lexend': Lexend_400Regular,
    'Lexend-Regular': Lexend_400Regular,
    'Lexend-Medium': Lexend_500Medium,
    'Lexend-SemiBold': Lexend_600SemiBold,
    'Lexend-Bold': Lexend_700Bold,
  });

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();

  // Unified role detection & automatic invite claim hook
  const { role, isResolving } = useAuthRole();

  // Background offline sync lifecycle watcher
  useNetworkSync();

  // Local notification channels & permission initialization
  useLocalNotifications();

  // Initialize local SQLite database schema and indexes on mount
  useEffect(() => {
    initLocalDatabase().catch((err) => {
      console.error('[SQLite] Failed to initialize local database:', err);
    });
  }, []);

  useEffect(() => {
    if (isResolving || role === 'loading') return;

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === '(auth)';
    const inBusinessGroup = currentSegment === '(business)';
    const inStaffGroup = currentSegment === 'staff';

    switch (role) {
      case 'unauthenticated':
        if (!inAuthGroup) {
          router.replace('/(auth)/login');
        }
        break;

      case 'sales':
        // Sales Staff: Strictly restricted to /staff counter interface
        // Block access to owner tabs, health metrics, and business wizard
        if (!inStaffGroup) {
          router.replace('/staff' as any);
        }
        break;

      case 'owner':
        // Business Owner: Access to owner tabs, health, daily digest
        // Prevent access to auth, onboarding create-business, or staff interface
        if (inAuthGroup || (inBusinessGroup && segments[1] === 'create-business') || inStaffGroup) {
          router.replace('/');
        }
        break;

      case 'new_user':
        // Brand new user without staff assignment or registered business -> Onboarding
        if (!inBusinessGroup) {
          router.replace('/(business)/create-business');
        }
        break;
    }
  }, [role, isResolving, segments, router]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
      <InAppToast />
    </ThemeProvider>
  );
}
