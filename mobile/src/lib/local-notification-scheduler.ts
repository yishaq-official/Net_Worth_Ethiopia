import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { NOTIFICATION_CHANNELS, setupNotificationChannels } from './local-notification-channels';

/**
 * Configure global foreground presentation behavior.
 * When the app is foregrounded, local notifications will still present an alert banner, sound, and badge.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface LocalNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
  subtitle?: string;
}

export interface ScheduleNotificationOptions extends LocalNotificationPayload {
  triggerSeconds?: number;
  triggerDate?: Date;
}

/**
 * Request system notification permissions on the client device.
 * Safe across Android, iOS, and Web.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      await setupNotificationChannels();
      return true;
    }

    return false;
  } catch (error) {
    console.warn('[requestNotificationPermissions] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Check whether system notification permissions are currently granted.
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Fire an immediate local notification directly to the system tray.
 */
export async function triggerInstantLocalNotification(
  payload: LocalNotificationPayload
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const granted = await hasNotificationPermissions();
    if (!granted) {
      const allowed = await requestNotificationPermissions();
      if (!allowed) return null;
    }

    const channelId = payload.channelId || NOTIFICATION_CHANNELS.DUBE_REMINDERS.id;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        subtitle: payload.subtitle,
        data: payload.data || {},
        sound: 'default',
        color: '#065F46', // NetWorth Emerald
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: null, // null trigger means fire immediately
    });

    return identifier;
  } catch (error) {
    console.warn('[triggerInstantLocalNotification] Failed to trigger notification:', error);
    return null;
  }
}

/**
 * Schedule a local notification to fire after a delay or at a specific target date.
 */
export async function scheduleLocalNotification(
  options: ScheduleNotificationOptions
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const granted = await hasNotificationPermissions();
    if (!granted) {
      const allowed = await requestNotificationPermissions();
      if (!allowed) return null;
    }

    const channelId = options.channelId || NOTIFICATION_CHANNELS.DUBE_REMINDERS.id;

    let trigger: Notifications.NotificationTriggerInput = null;

    if (options.triggerDate) {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: options.triggerDate,
        ...(Platform.OS === 'android' ? { channelId } : {}),
      };
    } else if (options.triggerSeconds && options.triggerSeconds > 0) {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: options.triggerSeconds,
        repeats: false,
        ...(Platform.OS === 'android' ? { channelId } : {}),
      };
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        subtitle: options.subtitle,
        data: options.data || {},
        sound: 'default',
        color: '#065F46',
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger,
    });

    return identifier;
  } catch (error) {
    console.warn('[scheduleLocalNotification] Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a specific scheduled notification by ID.
 */
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.warn(`[cancelScheduledNotification] Failed to cancel ${identifier}:`, error);
  }
}

/**
 * Cancel all currently pending scheduled notifications.
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('[cancelAllScheduledNotifications] Failed to cancel all scheduled:', error);
  }
}

/**
 * Setup global response listener for notification taps.
 * Deep-links into the destination screen when user taps the notification.
 */
export function setupNotificationResponseListener(): () => void {
  if (Platform.OS === 'web') return () => {};

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    try {
      const data = response.notification.request.content.data;
      if (data?.route && typeof data.route === 'string') {
        router.push(data.route as any);
      }
    } catch (error) {
      console.warn('[setupNotificationResponseListener] Error handling notification tap:', error);
    }
  });

  return () => {
    subscription.remove();
  };
}
