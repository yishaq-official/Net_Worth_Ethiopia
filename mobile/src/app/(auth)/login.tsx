import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';

const signupMessage =
  "That Google account does not have a NetWorth account yet. Please register first and accept the terms before logging in.";

export default function LoginScreen() {
  const theme = useTheme();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: Linking.createURL('/'),
        errorCallbackURL: Linking.createURL(
          `/(auth)/signup?message=${encodeURIComponent(signupMessage)}`
        ),
      });

      if (error) {
        router.replace({
          pathname: '/(auth)/signup',
          params: { message: signupMessage },
        });
      }
    } catch {
      router.replace({
        pathname: '/(auth)/signup',
        params: { message: signupMessage },
      });
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundGrid />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: '#FFFFFF' }]}>
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.logoImg}
                contentFit="contain"
              />
            </View>
            <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Log in to continue to NetWorth</ThemedText>
          </View>

          <AuthCard>
            <GoogleButton 
              title="Log in with Google" 
              onPress={handleGoogleLogin} 
              style={styles.button}
            />

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.linkText, { color: theme.primary }]}>Sign up</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </AuthCard>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB', // Using the hardcoded body background from HTML for consistency
  },
  safeArea: {
    flex: 1,
    zIndex: 2, // Above the grid
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80, // To match HTML design spacing
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 3,
  },
  logoImg: {
    height: 40,
    width: 150, // Added estimated width for logo
  },
  title: {
    color: '#fff',
    fontSize: 26,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
