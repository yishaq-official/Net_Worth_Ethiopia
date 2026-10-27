import { router } from 'expo-router';
import { NOTIFICATION_CHANNELS } from '@/lib/local-notification-channels';
import { triggerInstantLocalNotification } from '@/lib/local-notification-scheduler';
import { localNotificationLogRepo } from '@/repositories/local-notification-log.repo';
import { showInAppToast } from '@/store/toast-store';
import { BANK_PROVIDERS } from '@/constants/text-fetching';
import type { ParsedBankTransaction } from '@/types/text-fetching';

function getProviderDisplayName(providerKey: string): string {
  const provider = BANK_PROVIDERS[providerKey as keyof typeof BANK_PROVIDERS];
  if (provider?.displayName) return provider.displayName;
  if (!providerKey || providerKey === 'unknown') return 'Bank';
  return providerKey.charAt(0).toUpperCase() + providerKey.slice(1);
}

/**
 * Service to dispatch instant local notifications and in-app toast banners
 * when incoming bank SMS transactions (Telebirr, CBE, Awash, BOA, Dashen) are ingested.
 */
export const smsNotificationService = {
  /**
   * Dispatches instant alert for a single incoming bank transaction.
   */
  async notifyNewBankTransaction(
    txn: ParsedBankTransaction,
    businessId: string
  ): Promise<void> {
    if (!txn) return;

    const ref = (txn.transactionRef || '').trim() || txn.id;
    const dedupeKey = `sms_notif_${ref}`;

    // Deduplication check
    const alreadyNotified = await localNotificationLogRepo.hasBeenNotifiedToday(dedupeKey);
    if (alreadyNotified) return;

    const providerName = getProviderDisplayName(txn.provider);
    const formattedAmount = txn.amount ? txn.amount.toLocaleString() : '0';

    let title: string;
    let message: string;
    let variant: 'payment' | 'warning' | 'info' = 'info';

    if (txn.transactionFlow === 'deposit') {
      title = `Payment Detected: ${providerName}`;
      message = txn.counterparty
        ? `${formattedAmount} ETB from ${txn.counterparty}`
        : `${formattedAmount} ETB deposit received`;
      variant = 'payment';
    } else if (txn.transactionFlow === 'expense') {
      title = `Expense Detected: ${providerName}`;
      message = txn.counterparty
        ? `${formattedAmount} ETB to ${txn.counterparty}`
        : `${formattedAmount} ETB debit processed`;
      variant = 'warning';
    } else {
      title = `Bank Transaction: ${providerName}`;
      message = `Transaction of ${formattedAmount} ETB detected`;
      variant = 'info';
    }

    // 1. Dispatch native system tray notification (High importance channel)
    await triggerInstantLocalNotification({
      title,
      body: `${message}${txn.transactionRef ? ` • Ref: ${txn.transactionRef}` : ''}`,
      channelId: NOTIFICATION_CHANNELS.PAYMENT_ALERTS.id,
      data: {
        url: '/text-fetching',
        type: 'bank_sms',
        transactionId: txn.id,
        ref: txn.transactionRef,
        businessId,
      },
    });

    // 2. Dispatch in-app floating banner for instant foreground feedback
    showInAppToast({
      title,
      message,
      variant,
      amount: `ETB ${formattedAmount}`,
      bank: providerName,
      reference: txn.transactionRef ? `Ref: ${txn.transactionRef}` : undefined,
      action: {
        label: 'View & Book',
        onPress: () => router.push('/text-fetching'),
      },
    });

    // 3. Record in deduplication log
    await localNotificationLogRepo.recordNotification(dedupeKey, 'payment_alert', ref);
  },

  /**
   * Inspects a list of newly ingested bank transactions and dispatches either
   * individual notifications or an aggregated summary banner.
   */
  async notifyNewlyDiscoveredTransactions(
    transactions: ParsedBankTransaction[],
    businessId: string
  ): Promise<void> {
    if (!transactions || transactions.length === 0) return;

    // Filter unnotified transactions
    const unnotified: ParsedBankTransaction[] = [];
    for (const txn of transactions) {
      const ref = (txn.transactionRef || '').trim() || txn.id;
      const dedupeKey = `sms_notif_${ref}`;
      const alreadyNotified = await localNotificationLogRepo.hasBeenNotifiedToday(dedupeKey);
      if (!alreadyNotified) {
        unnotified.push(txn);
      }
    }

    if (unnotified.length === 0) return;

    if (unnotified.length === 1) {
      await this.notifyNewBankTransaction(unnotified[0], businessId);
      return;
    }

    // If multiple new transactions arrive in a batch
    const deposits = unnotified.filter((t) => t.transactionFlow === 'deposit');
    const totalDepositAmount = deposits.reduce((sum, t) => sum + (t.amount || 0), 0);

    const title = `${unnotified.length} New Bank Transactions`;
    const message = deposits.length > 0
      ? `${deposits.length} payments totaling ETB ${totalDepositAmount.toLocaleString()} received`
      : `${unnotified.length} new bank transactions ready to book`;

    // System tray alert
    await triggerInstantLocalNotification({
      title,
      body: `${message}. Tap to review and book into sales or expenses.`,
      channelId: NOTIFICATION_CHANNELS.PAYMENT_ALERTS.id,
      data: {
        url: '/text-fetching',
        type: 'bank_sms_batch',
        businessId,
        count: unnotified.length,
      },
    });

    // In-app toast banner
    showInAppToast({
      title,
      message,
      variant: 'payment',
      amount: totalDepositAmount > 0 ? `ETB ${totalDepositAmount.toLocaleString()}` : undefined,
      action: {
        label: 'Review & Book',
        onPress: () => router.push('/text-fetching'),
      },
    });

    // Log all transactions to prevent repeat notifications
    for (const txn of unnotified) {
      const ref = (txn.transactionRef || '').trim() || txn.id;
      const dedupeKey = `sms_notif_${ref}`;
      await localNotificationLogRepo.recordNotification(dedupeKey, 'payment_alert', ref);
    }
  },
};
