import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Checkbox from 'expo-checkbox';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';

export default function SignupScreen() {
  const theme = useTheme();
  const [isChecked, setChecked] = useState(false);

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
            <ThemedText style={styles.subtitle}>Start managing your finances today</ThemedText>
          </View>

          <AuthCard>
            <View style={styles.optionsRow}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? theme.primary : undefined}
              />
              <ThemedText style={styles.checkboxLabel}>
                I agree to the{' '}
                <Pressable onPress={() => console.log('Terms')}>
                  <ThemedText type="linkPrimary" style={[styles.termsLink, { color: theme.primary }]}>
                    Terms & Conditions
                  </ThemedText>
                </Pressable>
              </ThemedText>
            </View>

            <GoogleButton 
              title="Sign up with Google" 
              onPress={() => authClient.signIn.social({ provider: 'google' })} 
              disabled={!isChecked}
              style={styles.button}
            />

            <View style={styles.toggleContainer}>
              <ThemedText style={styles.toggleText}>Already have an account? </ThemedText>
              <Link href={"/(auth)/login" as any} asChild>
                <Pressable>
                  <ThemedText type="linkPrimary" style={[styles.toggleLink, { color: theme.primary }]}>
                    Log In
                  </ThemedText>
                </Pressable>
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 8,
    width: 16,
    height: 16,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsLink: {
    fontSize: 14,
    fontWeight: '600',
    // Using negative margin to align text correctly with checkbox text flow
    marginTop: -3,
  },
  button: {
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});
