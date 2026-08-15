import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Checkbox from 'expo-checkbox';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';

export default function TermsScreen() {
  const theme = useTheme();
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await authClient.updateUser({
        acceptedTerms: true,
      } as any);
      router.replace('/');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundGrid />
      <View style={styles.content}>
        <AuthCard>
          <ThemedText style={styles.title}>Complete Your Profile</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please review and accept our Terms and Conditions to continue using NetWorth.
          </ThemedText>
          
          <View style={styles.checkboxContainer}>
            <Checkbox
              style={styles.checkbox}
              value={isChecked}
              onValueChange={setChecked}
              color={isChecked ? theme.primary : undefined}
            />
            <ThemedText style={styles.checkboxLabel}>I agree to the Terms and Conditions</ThemedText>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, !isChecked && styles.buttonDisabled, { backgroundColor: theme.primary }]}
            disabled={!isChecked || loading}
            onPress={handleAccept}
          >
            {loading ? (
               <ActivityIndicator color={theme.background} />
            ) : (
               <ThemedText style={[styles.buttonText, { color: theme.background }]}>Continue</ThemedText>
            )}
          </TouchableOpacity>
        </AuthCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
