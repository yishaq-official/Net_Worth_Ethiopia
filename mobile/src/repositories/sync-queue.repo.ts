import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '../db/client';
import type { SyncQueueRow } from '../db/schema';

export interface EnqueueMutationInput {
  mutationId: string;
  entityType: 'sale' | 'expense' | 'debt' | 'branch';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'SETTLE' | 'DELETE';
  payload: Record<string, any>;
  createdAt?: string;
}

let onQueueChangeListener: (() => void) | null = null;

/**
 * Repository for managing the transactional outbox queue (sync_queue table).
 * Captures offline mutations to be synchronized with the backend.
 */
export const syncQueueRepo = {
  /**
   * Registers a listener callback invoked when queue items are added or removed.
   */
  setOnQueueChange(listener: () => void): void {
    onQueueChangeListener = listener;
  },

  /**
   * Enqueues a mutation into the sync_queue.
   * Can accept an existing transaction database instance for atomic commits.
   */
  async enqueueMutation(
    mutation: EnqueueMutationInput,
    dbInstance?: SQLiteDatabase
  ): Promise<void> {
    const db = dbInstance ?? (await getDatabase());
    const now = mutation.createdAt ?? new Date().toISOString();
    const payloadStr = JSON.stringify(mutation.payload);

    await db.runAsync(
      `INSERT INTO sync_queue (mutation_id, entity_type, entity_id, action, payload, status, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', 0, ?)`,
      [
        mutation.mutationId,
        mutation.entityType,
        mutation.entityId,
        mutation.action,
        payloadStr,
        now,
      ]
    );

    try {
      onQueueChangeListener?.();
    } catch {}
  },

  /**
   * Retrieves pending mutations in FIFO order.
   */
  async getPendingMutations(limit = 50): Promise<SyncQueueRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<SyncQueueRow>(
      `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY id ASC LIMIT ?`,
      [limit]
    );
  },

  /**
   * Removes successfully pushed mutations from the queue.
   */
  async markMutationsProcessed(mutationIds: string[]): Promise<void> {
    if (!mutationIds.length) return;
    const db = await getDatabase();
    const placeholders = mutationIds.map(() => '?').join(',');
    await db.runAsync(
      `DELETE FROM sync_queue WHERE mutation_id IN (${placeholders})`,
      mutationIds
    );

    try {
      onQueueChangeListener?.();
    } catch {}
  },

  /**
   * Records a sync failure and increments retry counter with exponential backoff capping.
   */
  async incrementRetry(mutationId: string, error: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE sync_queue
       SET retry_count = retry_count + 1,
           last_error = ?,
           status = CASE WHEN retry_count + 1 >= 5 THEN 'failed' ELSE 'pending' END
       WHERE mutation_id = ?`,
      [error, mutationId]
    );
  },

  /**
   * Returns count of all currently pending mutations.
   */
  async getPendingCount(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM sync_queue WHERE status = 'pending'`
    );
    return result?.count ?? 0;
  },

  /**
   * Clears all queue items (for testing or hard reset).
   */
  async clearQueue(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM sync_queue`);
  },
};
