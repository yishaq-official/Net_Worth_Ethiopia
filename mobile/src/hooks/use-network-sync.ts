import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { syncEngine, type SyncEvent } from '@/service/sync-engine';
import { syncQueueRepo } from '@/repositories/sync-queue.repo';
import { useBusinessStore } from '@/store/business-store';
import { isSQLiteAvailable } from '@/db/client';
import { showInAppToast } from '@/store/toast-store';

export interface NetworkSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  lastError: string | null;
  triggerSync: () => Promise<void>;
}

/**
 * Checks whether the native ExpoNetwork module is linked in the running binary.
 */
export function isNetworkModuleAvailable(): boolean {
  try {
    return Boolean(requireOptionalNativeModule('ExpoNetwork'));
  } catch {
    return false;
  }
}

function getNetworkModule(): any | null {
  if (!isNetworkModuleAvailable()) return null;
  try {
    return require('expo-network');
  } catch {
    return null;
  }
}

/**
 * Hook to automate offline synchronization across network reconnects,
 * app foreground resume events, and periodic polling.
 */
export function useNetworkSync(): NetworkSyncState {
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBusinessId = activeBusiness?.id;

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(syncEngine.getIsSyncing());
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const activeBusinessIdRef = useRef(activeBusinessId);
  activeBusinessIdRef.current = activeBusinessId;

  const triggerSync = useCallback(async () => {
    const bizId = activeBusinessIdRef.current;
    if (!bizId) return;

    try {
      await syncEngine.sync(bizId);
    } catch (err: any) {
      console.warn('[useNetworkSync] Sync trigger failed:', err?.message);
    }
  }, []);

  // 1. Subscribe to SyncEngine lifecycle events
  useEffect(() => {
    // Initial pending count query (only if local SQLite is active)
    if (isSQLiteAvailable()) {
      syncQueueRepo.getPendingCount().then(setPendingCount).catch(() => {});
    }

    const unsubscribe = syncEngine.subscribe((event: SyncEvent) => {
      setIsSyncing(event.type === 'sync_start');
      setPendingCount(event.pendingCount);

      if (event.type === 'sync_success') {
        setLastSyncTime(event.timestamp);
        setLastError(null);

        // Display subtle toast when offline mutations are successfully pushed to cloud
        if (event.pushedCount && event.pushedCount > 0) {
          showInAppToast({
            title: 'Offline Sync Complete',
            message: `All ${event.pushedCount} offline update${event.pushedCount === 1 ? '' : 's'} synced to cloud.`,
            variant: 'payment',
            duration: 3500,
          });
        }
      } else if (event.type === 'sync_error') {
        setLastError(event.error ?? 'Sync failed');
      }
    });

    return unsubscribe;
  }, []);

  // 2. Monitor Network connectivity changes via expo-network (if available)
  useEffect(() => {
    let isMounted = true;
    const NetworkModule = getNetworkModule();

    if (!NetworkModule) {
      // Fallback: assume online when native network module is not compiled into the APK
      setIsOnline(true);
      return;
    }

    // Initial check
    NetworkModule.getNetworkStateAsync()
      .then((state: any) => {
        if (!isMounted) return;
        const online = Boolean(state.isConnected && (state.isInternetReachable ?? true));
        setIsOnline(online);
        if (online && activeBusinessId) {
          triggerSync();
        }
      })
      .catch(() => {});

    // Reconnection listener
    const subscription = NetworkModule.addNetworkStateListener((state: any) => {
      if (!isMounted) return;
      const online = Boolean(state.isConnected && (state.isInternetReachable ?? true));
      setIsOnline((prev) => {
        // If we transitioned from offline to online, trigger sync
        if (!prev && online) {
          triggerSync();
        }
        return online;
      });
    });

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, [activeBusinessId, triggerSync]);


  // 3. Monitor AppState (app foreground resume)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isOnline) {
        triggerSync();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [isOnline, triggerSync]);

  // 4. Periodic background heartbeat timer (every 3 minutes while online)
  useEffect(() => {
    if (!isOnline) return;

    const timer = setInterval(() => {
      if (AppState.currentState === 'active') {
        triggerSync();
      }
    }, 3 * 60 * 1000);

    return () => clearInterval(timer);
  }, [isOnline, triggerSync]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    lastError,
    triggerSync,
  };
}
