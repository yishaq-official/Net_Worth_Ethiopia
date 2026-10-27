import { getDatabase, isSQLiteAvailable } from '../db/client';
import type { LocalNotificationLogRow } from '../db/schema';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Repository for local SQLite notification deduplication logs.
 * Prevents redundant system alerts and repeated daily prompts.
 */
export const localNotificationLogRepo = {
  /**
   * Checks whether a notification with the given deduplication key has already been dispatched today.
   */
  async hasBeenNotifiedToday(dedupeKey: string): Promise<boolean> {
    if (!isSQLiteAvailable()) return false;

    try {
      const db = await getDatabase();
      const todayPrefix = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

      const existing = await db.getFirstAsync<LocalNotificationLogRow>(
        `SELECT id FROM local_notification_log 
         WHERE dedupe_key = ? AND notified_at >= ? LIMIT 1`,
        [dedupeKey, `${todayPrefix}T00:00:00.000Z`]
      );

      return Boolean(existing);
    } catch (error) {
      console.warn('[localNotificationLogRepo.hasBeenNotifiedToday] Error checking log:', error);
      return false;
    }
  },

  /**
   * Logs a dispatched notification to SQLite for deduplication.
   */
  async recordNotification(
    dedupeKey: string,
    type: 'dube_reminder' | 'payment_alert' | 'milestone',
    referenceId?: string | null
  ): Promise<void> {
    if (!isSQLiteAvailable()) return;

    try {
      const db = await getDatabase();
      const id = generateUUID();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT OR REPLACE INTO local_notification_log (id, dedupe_key, type, reference_id, notified_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, dedupeKey, type, referenceId ?? null, now]
      );
    } catch (error) {
      console.warn('[localNotificationLogRepo.recordNotification] Error writing log:', error);
    }
  },

  /**
   * Prunes log entries older than the retention threshold (default: 30 days).
   */
  async pruneOldLogs(daysToKeep = 30): Promise<void> {
    if (!isSQLiteAvailable()) return;

    try {
      const db = await getDatabase();
      const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

      await db.runAsync(
        `DELETE FROM local_notification_log WHERE notified_at < ?`,
        [cutoff]
      );
    } catch (error) {
      console.warn('[localNotificationLogRepo.pruneOldLogs] Error pruning old logs:', error);
    }
  },
};
