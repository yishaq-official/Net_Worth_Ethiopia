import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { authClient } from '@/lib/auth-client';

export default function HomeScreen() {
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Welcome to NetWorth</ThemedText>
        <ThemedText style={styles.subtitle}>Dashboard coming soon!</ThemedText>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Log out</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 16,
  },
  subtitle: {
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#111827',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
