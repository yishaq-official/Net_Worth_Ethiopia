import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const NOTIFICATION_CHANNELS = {
  PAYMENT_ALERTS: {
    id: 'payment_alerts',
    name: 'Incoming Payment Alerts',
    description: 'Real-time alerts for received bank and mobile money payments',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#10B981', // Emerald
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  },
  DUBE_REMINDERS: {
    id: 'dube_reminders',
    name: 'Customer Credit & Due Dates',
    description: 'Reminders for customer debts due today or overdue',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 200, 200],
    lightColor: '#D97706', // Amber
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  },
  MILESTONES: {
    id: 'milestones',
    name: 'Sales Milestones & Goals',
    description: 'Celebratory alerts when daily revenue targets are surpassed',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 150, 150],
    lightColor: '#8B5CF6', // Purple
    sound: 'default',
    enableVibrate: false,
    showBadge: false,
  },
} as const;

export type NotificationChannelKey = keyof typeof NOTIFICATION_CHANNELS;

/**
 * Configure dedicated native notification channels for Android 8.0+ (API 26+).
 * Safe to call on iOS and Web (no-op).
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    for (const channel of Object.values(NOTIFICATION_CHANNELS)) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: channel.importance,
        vibrationPattern: [...channel.vibrationPattern],
        lightColor: channel.lightColor,
        sound: channel.sound,
        enableVibrate: channel.enableVibrate,
        showBadge: channel.showBadge,
      });
    }
  } catch (error) {
    console.warn('[setupNotificationChannels] Failed to configure Android channels:', error);
  }
}
