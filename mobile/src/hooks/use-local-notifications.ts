import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  requestNotificationPermissions,
  hasNotificationPermissions,
  triggerInstantLocalNotification,
  scheduleLocalNotification,
  setupNotificationResponseListener,
  type LocalNotificationPayload,
  type ScheduleNotificationOptions,
} from '@/lib/local-notification-scheduler';
import { setupNotificationChannels } from '@/lib/local-notification-channels';
import { useBusinessStore } from '@/store/business-store';
import { evaluateAndNotifyDubeDebts } from '@/service/dube-reminder.service';
import { localNotificationLogRepo } from '@/repositories/local-notification-log.repo';

export function useLocalNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsReady(true);
      return;
    }

    let isMounted = true;

    async function init() {
      // 1. Configure Android notification channels
      await setupNotificationChannels();

      // 2. Check existing permissions or request
      const granted = await requestNotificationPermissions();
      if (isMounted) {
        setHasPermission(granted);
        setIsReady(true);
      }
    }

    init();

    // 3. Setup tap handler
    const cleanup = setupNotificationResponseListener();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  // Evaluate customer credit (Dube) due dates once per day per active business
  useEffect(() => {
    if (!isReady || !activeBusiness?.id) return;

    evaluateAndNotifyDubeDebts(activeBusiness.id);
    localNotificationLogRepo.pruneOldLogs(30);
  }, [isReady, activeBusiness?.id]);

  const triggerNotification = useCallback(
    async (payload: LocalNotificationPayload) => {
      return triggerInstantLocalNotification(payload);
    },
    []
  );

  const scheduleNotification = useCallback(
    async (options: ScheduleNotificationOptions) => {
      return scheduleLocalNotification(options);
    },
    []
  );

  const checkPermission = useCallback(async () => {
    const granted = await hasNotificationPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  return {
    isReady,
    hasPermission,
    checkPermission,
    triggerNotification,
    scheduleNotification,
  };
}
