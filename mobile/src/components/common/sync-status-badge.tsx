import React from 'react';
import { View, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useNetworkSync } from '@/hooks/use-network-sync';
import {
  WifiIcon,
  WifiOffIcon,
  CloudUploadIcon,
  RefreshCwIcon,
} from '@/components/icons';

/**
 * Compact, iconic status indicator displaying live network and synchronization state.
 * Uses modern iconography (Wifi, WifiOff, CloudUpload, Refresh) instead of textual labels.
 */
export function SyncStatusBadge() {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetworkSync();

  const handlePress = () => {
    if (isSyncing) {
      Alert.alert('Syncing', 'A database synchronization is currently in progress.');
    } else if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        pendingCount > 0
          ? `Device is offline. You have ${pendingCount} local record(s) queued to sync once internet is restored.`
          : 'Device is offline. Changes are saved locally and will auto-sync when connection is restored.'
      );
    } else if (pendingCount > 0) {
      Alert.alert(
        'Pending Sync',
        `You have ${pendingCount} offline update(s) ready to sync.`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Sync Now', onPress: () => triggerSync() },
        ]
      );
    } else {
      Alert.alert(
        'Network Status',
        'Connected & Online. Your local database is fully up to date with the server.'
      );
    }
  };

  if (!isOnline) {
    return (
      <Pressable
        onPress={handlePress}
        style={[styles.indicatorBtn, styles.offlineBtn]}
        accessibilityLabel="Offline indicator"
        accessibilityRole="button"
        hitSlop={6}
      >
        <WifiOffIcon size={17} color="#D97706" strokeWidth={2.2} />
        {pendingCount > 0 ? (
          <View style={[styles.countBadge, styles.offlineCountBadge]}>
            <ThemedText style={styles.countText}>{pendingCount}</ThemedText>
          </View>
        ) : null}
      </Pressable>
    );
  }

  if (isSyncing) {
    return (
      <Pressable
        onPress={handlePress}
        style={[styles.indicatorBtn, styles.syncingBtn]}
        accessibilityLabel="Syncing in progress"
        accessibilityRole="button"
        hitSlop={6}
      >
        <RefreshCwIcon size={16} color="#059669" strokeWidth={2.2} />
        {pendingCount > 0 ? (
          <View style={[styles.countBadge, styles.syncingCountBadge]}>
            <ThemedText style={styles.countText}>
              {pendingCount > 99 ? '99+' : pendingCount}
            </ThemedText>
          </View>
        ) : null}
      </Pressable>
    );
  }

  if (pendingCount > 0) {
    return (
      <Pressable
        onPress={handlePress}
        style={[styles.indicatorBtn, styles.pendingBtn]}
        accessibilityLabel={`${pendingCount} changes to sync`}
        accessibilityRole="button"
        hitSlop={6}
      >
        <CloudUploadIcon size={17} color="#2563EB" strokeWidth={2.2} />
        <View style={[styles.countBadge, styles.pendingCountBadge]}>
          <ThemedText style={styles.countText}>
            {pendingCount > 99 ? '99+' : pendingCount}
          </ThemedText>
        </View>
      </Pressable>
    );
  }

  // Fully connected & synced: sleek Wifi icon without text label
  return (
    <Pressable
      onPress={handlePress}
      style={[styles.indicatorBtn, styles.onlineBtn]}
      accessibilityLabel="Connected & synced"
      accessibilityRole="button"
      hitSlop={6}
    >
      <WifiIcon size={17} color="#059669" strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  indicatorBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  onlineBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  offlineBtn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  syncingBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  pendingBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  offlineCountBadge: {
    backgroundColor: '#D97706',
  },
  syncingCountBadge: {
    backgroundColor: '#059669',
  },
  pendingCountBadge: {
    backgroundColor: '#2563EB',
  },
  countText: {
    fontFamily: 'Lexend_700Bold',
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
  },
});
