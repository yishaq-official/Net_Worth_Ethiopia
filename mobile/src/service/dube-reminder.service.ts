import { getDatabase, isSQLiteAvailable } from '@/db/client';
import { NOTIFICATION_CHANNELS } from '@/lib/local-notification-channels';
import { triggerInstantLocalNotification } from '@/lib/local-notification-scheduler';
import { localNotificationLogRepo } from '@/repositories/local-notification-log.repo';
import { showInAppToast } from '@/store/toast-store';
import { router } from 'expo-router';

interface DueDebtItem {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  amount: number;
  due_date: string;
  status: string;
}

/**
 * Service to inspect local SQLite customer credit (Dube) records,
 * and dispatch timely, deduplicated system notifications and in-app toasts
 * for debts that are due today or overdue.
 */
export async function evaluateAndNotifyDubeDebts(businessId: string): Promise<void> {
  if (!businessId || !isSQLiteAvailable()) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const dedupeKey = `dube_daily_${businessId}_${todayStr}`;

  // 1. Check if we already alerted the user today for this business
  const alreadyNotified = await localNotificationLogRepo.hasBeenNotifiedToday(dedupeKey);
  if (alreadyNotified) return;

  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<DueDebtItem>(
      `SELECT id, customer_name, customer_phone, amount, due_date, status
       FROM local_sale
       WHERE sale_type = 'dube'
         AND status = 'pending'
         AND business_id = ?
         AND due_date IS NOT NULL
         AND date(due_date) <= date('now')
       ORDER BY due_date ASC`,
      [businessId]
    );

    if (!rows || rows.length === 0) return;

    const overdueDebts = rows.filter((r) => r.due_date.slice(0, 10) < todayStr);
    const dueTodayDebts = rows.filter((r) => r.due_date.slice(0, 10) === todayStr);

    const totalCount = rows.length;
    const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    let title: string;
    let body: string;

    if (totalCount === 1) {
      const debt = rows[0];
      const name = debt.customer_name || 'Customer';
      const isOverdue = debt.due_date.slice(0, 10) < todayStr;
      title = isOverdue ? `Overdue Dube: ${name}` : `Dube Due Today: ${name}`;
      body = `${Number(debt.amount).toLocaleString()} ETB is due. Tap to open debt notebook.`;
    } else if (overdueDebts.length > 0) {
      title = `${overdueDebts.length} Overdue Customer ${overdueDebts.length === 1 ? 'Debt' : 'Debts'}`;
      body = `Totaling ${totalAmount.toLocaleString()} ETB across ${totalCount} debts. Tap to review.`;
    } else {
      title = `${dueTodayDebts.length} Customer ${dueTodayDebts.length === 1 ? 'Debt' : 'Debts'} Due Today`;
      body = `Totaling ${totalAmount.toLocaleString()} ETB. Tap to review your notebook.`;
    }

    // 2. Dispatch system tray notification
    await triggerInstantLocalNotification({
      title,
      body,
      channelId: NOTIFICATION_CHANNELS.DUBE_REMINDERS.id,
      data: {
        url: '/bidr',
        type: 'dube_reminder',
        businessId,
      },
    });

    // 3. Dispatch in-app toast banner
    showInAppToast({
      title,
      message: body,
      variant: 'warning',
      amount: `ETB ${totalAmount.toLocaleString()}`,
      action: {
        label: 'View Debt Notebook',
        onPress: () => router.push('/bidr'),
      },
    });

    // 4. Record to deduplication log
    await localNotificationLogRepo.recordNotification(dedupeKey, 'dube_reminder', businessId);
  } catch (error) {
    console.warn('[evaluateAndNotifyDubeDebts] Failed to evaluate dube reminders:', error);
  }
}
