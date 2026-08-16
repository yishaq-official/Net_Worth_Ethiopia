import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function SignupSuccessScreen() {
  const theme = useTheme();
  
  useEffect(() => {
    const finalizeSignup = async () => {
      try {
        await authClient.updateUser({
          acceptedTerms: true,
        } as any);
        
        // Let the layout handle the final redirect once the session updates,
        // or forcefully redirect to dashboard here:
        router.replace('/');
      } catch (err) {
        console.error("Failed to finalize signup:", err);
      }
    };
    
    finalizeSignup();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText style={styles.text}>Finalizing your account...</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
});
