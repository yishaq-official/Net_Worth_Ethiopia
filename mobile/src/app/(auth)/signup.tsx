import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import Checkbox from 'expo-checkbox';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';

const signupNotice =
  'Google sign-up is only available after you accept the Terms of Service and Privacy Policy.';

export default function SignupScreen() {
  const theme = useTheme();
  const [isChecked, setChecked] = useState(false);
  const { message } = useLocalSearchParams<{ message?: string }>();
  const notice = typeof message === 'string' && message.length > 0 ? message : signupNotice;

  const handleGoogleSignup = async () => {
    if (!isChecked) return;

    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        requestSignUp: true,
        callbackURL: Linking.createURL('/signup-success'),
      });

      if (error) {
        router.replace({
          pathname: '/(auth)/signup',
          params: {
            message:
              'We could not start Google sign-up right now. Please try again or use the form below to continue.',
          },
        });
      }
    } catch {
      router.replace({
        pathname: '/(auth)/signup',
        params: {
          message:
            'We could not start Google sign-up right now. Please try again or use the form below to continue.',
        },
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
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Sign up to start tracking your net worth</ThemedText>
          </View>

          <AuthCard>
            <View style={styles.noticeBox}>
              <ThemedText style={styles.noticeEyebrow}>Registration required</ThemedText>
              <ThemedText style={styles.noticeTitle}>Google account not registered yet</ThemedText>
              <ThemedText style={styles.noticeText}>
                {notice}
              </ThemedText>
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? theme.primary : undefined}
              />
              <ThemedText style={styles.checkboxLabel}>I agree to the Terms of Service and Privacy Policy</ThemedText>
            </View>
            
            <View style={!isChecked && styles.disabledContainer}>
              <GoogleButton 
                title="Sign up with Google" 
                onPress={handleGoogleSignup} 
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.linkText, { color: theme.primary }]}>Log in</ThemedText>
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
    backgroundColor: '#E5E7EB',
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
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
    width: 150,
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
  noticeBox: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },
  noticeEyebrow: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 13,
    flex: 1,
  },
  disabledContainer: {
    opacity: 0.5,
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
