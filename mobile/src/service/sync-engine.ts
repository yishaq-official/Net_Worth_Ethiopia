import { authClient, baseURL } from '@/lib/auth-client';
import { syncQueueRepo } from '../repositories/sync-queue.repo';
import { localSalesRepo } from '../repositories/local-sales.repo';
import { localExpensesRepo } from '../repositories/local-expenses.repo';
import { localBidrRepo } from '../repositories/local-bidr.repo';
import { localBusinessRepo } from '../repositories/local-business.repo';
import { getDatabase, isSQLiteAvailable } from '../db/client';

export type SyncEventType = 'sync_start' | 'sync_success' | 'sync_error' | 'queue_updated';

export interface SyncEvent {
  type: SyncEventType;
  pendingCount: number;
  timestamp: string;
  error?: string;
  pushedCount?: number;
  pulledCount?: number;
}

export type SyncEventListener = (event: SyncEvent) => void;

class SyncEngine {
  private isSyncing = false;
  private listeners = new Set<SyncEventListener>();

  /**
   * Subscribes a listener to sync engine events. Returns unsubscribe function.
   */
  subscribe(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(
    type: SyncEventType,
    pendingCount: number,
    error?: string,
    pushedCount?: number,
    pulledCount?: number
  ) {
    const event: SyncEvent = {
      type,
      pendingCount,
      timestamp: new Date().toISOString(),
      error,
      pushedCount,
      pulledCount,
    };
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.warn('[Sync Engine] Error in event listener:', err);
      }
    });
  }

  /**
   * Notifies subscribers of live changes in local pending mutation queue count.
   */
  async notifyQueueUpdated(): Promise<void> {
    if (!isSQLiteAvailable()) return;
    try {
      const count = await syncQueueRepo.getPendingCount();
      this.notify('queue_updated', count);
    } catch {}
  }

  /**
   * Returns whether a sync cycle is currently active.
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Main synchronization execution method.
   * Performs Push (upstream) followed by Pull (downstream delta).
   */
  async sync(businessId: string): Promise<{
    pushedCount: number;
    pulledCount: number;
    pendingCount: number;
  }> {
    if (!businessId || !isSQLiteAvailable()) {
      return { pushedCount: 0, pulledCount: 0, pendingCount: 0 };
    }

    if (this.isSyncing) {
      const pending = await syncQueueRepo.getPendingCount();
      return { pushedCount: 0, pulledCount: 0, pendingCount: pending };
    }

    this.isSyncing = true;
    let pendingCount = await syncQueueRepo.getPendingCount();
    this.notify('sync_start', pendingCount);

    let pushedCount = 0;
    let pulledCount = 0;

    try {
      // ==========================================
      // PHASE 1: PUSH QUEUED OFFLINE MUTATIONS
      // ==========================================
      const pendingMutations = await syncQueueRepo.getPendingMutations(50);

      if (pendingMutations.length > 0) {
        const formattedMutations = pendingMutations.map((m) => {
          let parsedPayload: Record<string, any> = {};
          try {
            parsedPayload = JSON.parse(m.payload);
          } catch {
            parsedPayload = {};
          }
          return {
            mutationId: m.mutation_id,
            entityType: m.entity_type,
            action: m.action,
            entityId: m.entity_id,
            timestamp: m.created_at,
            payload: parsedPayload,
          };
        });

        try {
          const { data, error } = await authClient.$fetch(
            `${baseURL}/api/sync/push`,
            {
              method: 'POST',
              body: JSON.stringify({
                businessId,
                mutations: formattedMutations,
              }),
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (error) {
            throw new Error(error.message || 'Push request failed');
          }

          const responseData = (data as any)?.data ?? data;
          const processedIds: string[] = responseData?.processedMutationIds ?? [];

          if (processedIds.length > 0) {
            await syncQueueRepo.markMutationsProcessed(processedIds);
            pushedCount = processedIds.length;

            // Mark local entities matching processed mutations as synced
            const db = await getDatabase();
            for (const item of pendingMutations) {
              if (processedIds.includes(item.mutation_id)) {
                if (item.entity_type === 'sale' || item.entity_type === 'debt') {
                  await db.runAsync(
                    `UPDATE local_sale SET sync_status = 'synced' WHERE id = ?`,
                    [item.entity_id]
                  );
                } else if (item.entity_type === 'expense') {
                  await db.runAsync(
                    `UPDATE local_expense SET sync_status = 'synced' WHERE id = ?`,
                    [item.entity_id]
                  );
                }
              }
            }
          }

          const rejected: Array<{ mutationId: string; reason: string }> =
            responseData?.rejectedMutations ?? [];
          for (const rej of rejected) {
            await syncQueueRepo.incrementRetry(rej.mutationId, rej.reason);
          }
        } catch (pushErr: any) {
          console.warn('[Sync Engine] Push failed, marking retries:', pushErr?.message);
          for (const item of pendingMutations) {
            await syncQueueRepo.incrementRetry(
              item.mutation_id,
              pushErr?.message || 'Network error during push'
            );
          }
        }
      }

      // ==========================================
      // PHASE 2: PULL REMOTE DELTA CHANGES
      // ==========================================
      const lastPulledAt = await localBusinessRepo.getSyncMetadata('last_pulled_at');
      const pullUrl = lastPulledAt
        ? `${baseURL}/api/sync/pull?businessId=${encodeURIComponent(businessId)}&since=${encodeURIComponent(lastPulledAt)}`
        : `${baseURL}/api/sync/pull?businessId=${encodeURIComponent(businessId)}`;

      try {
        const { data: pullData, error: pullError } = await authClient.$fetch(
          pullUrl,
          { method: 'GET' }
        );

        if (!pullError && pullData) {
          const payload = (pullData as any)?.data ?? pullData;
          const changes = payload?.changes;

          if (changes) {
            // Upsert sales & debts
            if (Array.isArray(changes.sales) && changes.sales.length > 0) {
              const instantSales = changes.sales.filter(
                (s: any) => s.saleType !== 'dube'
              );
              const debts = changes.sales.filter(
                (s: any) => s.saleType === 'dube'
              );

              if (instantSales.length > 0) {
                await localSalesRepo.upsertSyncedSales(instantSales);
              }
              if (debts.length > 0) {
                await localBidrRepo.upsertSyncedDebts(debts);
              }
              pulledCount += changes.sales.length;
            }

            // Upsert expenses
            if (Array.isArray(changes.expenses) && changes.expenses.length > 0) {
              await localExpensesRepo.upsertSyncedExpenses(changes.expenses);
              pulledCount += changes.expenses.length;
            }

            // Cache operating branches
            if (Array.isArray(changes.branches) && changes.branches.length > 0) {
              await localBusinessRepo.cacheBranches(businessId, changes.branches);
              pulledCount += changes.branches.length;
            }
          }

          // Advance sync cursor
          if (payload?.serverTimestamp) {
            await localBusinessRepo.setSyncMetadata(
              'last_pulled_at',
              payload.serverTimestamp
            );
          }
        }
      } catch (pullErr: any) {
        console.warn('[Sync Engine] Pull delta failed:', pullErr?.message);
      }

      pendingCount = await syncQueueRepo.getPendingCount();
      this.notify('sync_success', pendingCount, undefined, pushedCount, pulledCount);

      return { pushedCount, pulledCount, pendingCount };
    } catch (err: any) {
      console.error('[Sync Engine] Fatal cycle error:', err);
      pendingCount = await syncQueueRepo.getPendingCount();
      this.notify('sync_error', pendingCount, err?.message || 'Sync cycle error');
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();

// Connect outbox queue updates to sync engine event bus
syncQueueRepo.setOnQueueChange(() => {
  syncEngine.notifyQueueUpdated();
});
