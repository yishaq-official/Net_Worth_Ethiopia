import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <BackgroundGrid />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: theme.background }]}>
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.logoImg}
                contentFit="contain"
              />
            </View>
            <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Securely log in to your account</ThemedText>
          </View>

          <AuthCard>
            <GoogleButton 
              title="Continue with Google" 
              onPress={() => console.log('Login with Google')} 
              style={styles.button}
            />

            <View style={styles.toggleContainer}>
              <ThemedText style={styles.toggleText}>Don't have an account? </ThemedText>
              <Link href={"/(auth)/signup" as any} asChild>
                <Pressable>
                  <ThemedText type="linkPrimary" style={[styles.toggleLink, { color: theme.primary }]}>
                    Sign Up
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#6B7280', // Text muted
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});
