import { fetchRawBankSms, type SmsFetchOptions } from '@/lib/sms-reader';
import { bankParserRegistry } from '@/features/text-fetching/parsers/parser-registry';
import { localSmsRepo } from '@/repositories/local-sms.repo';
import { smsNotificationService } from './sms-notification.service';
import { createDefaultProviderSummaries } from '@/constants/text-fetching';
import type {
  BankProvider,
  ParsedBankTransaction,
  ProviderSummary,
  SmsImportStatus,
  TransactionFlow,
} from '@/types/text-fetching';

export interface ScanResult {
  scanned: number;
  parsed: number;
  inserted: number;
  transactions: ParsedBankTransaction[];
}

/**
 * In-memory computation of provider metrics from an array of parsed transactions.
 * Used for instant UI updates and fallback environments.
 */
export function computeSummariesFromTransactions(
  transactions: ParsedBankTransaction[]
): Record<BankProvider, ProviderSummary> {
  const summaries = createDefaultProviderSummaries();

  for (const t of transactions) {
    const p = t.provider in summaries ? t.provider : 'unknown';
    if (t.transactionFlow === 'deposit') {
      summaries[p].totalDeposits += t.amount;
      summaries[p].depositCount += 1;
    } else if (t.transactionFlow === 'expense') {
      summaries[p].totalExpenses += t.amount;
      summaries[p].expenseCount += 1;
    }

    if (t.currentBalance !== null && (summaries[p].latestBalance === null || t.currentBalance > 0)) {
      summaries[p].latestBalance = t.currentBalance;
    }

    if (t.timestamp && (!summaries[p].lastTransactionAt || t.timestamp > summaries[p].lastTransactionAt!)) {
      summaries[p].lastTransactionAt = t.timestamp;
    }
  }

  return summaries;
}

export const textFetchingService = {
  /**
   * Scans native SMS inbox, parses with registry,
   * deduplicates and stores into local SQLite.
   */
  async scanAndProcessInbox(
    businessId: string,
    branchId: string,
    options: SmsFetchOptions = {}
  ): Promise<ScanResult> {
    // 1. Fetch raw messages from native Android provider
    const { messages } = await fetchRawBankSms(options);

    // 2. Parse using deterministic Ethiopian bank regex registry
    const parsedTransactions = bankParserRegistry.parseBatch(messages);

    // 3. Batch insert into SQLite with UNIQUE(transaction_ref) deduplication
    const { insertedCount, newlyInserted } = await localSmsRepo.insertOrIgnoreBatchWithResults(
      parsedTransactions,
      businessId,
      branchId
    );

    // 4. Trigger instant notifications for newly discovered bank transactions
    if (newlyInserted.length > 0) {
      smsNotificationService
        .notifyNewlyDiscoveredTransactions(newlyInserted, businessId)
        .catch((err) => {
          console.warn('[textFetchingService] Failed to dispatch SMS notifications:', err);
        });
    }

    // 5. Query current state from database
    const transactions = await localSmsRepo.getTransactions(businessId);

    return {
      scanned: messages.length,
      parsed: parsedTransactions.length,
      inserted: insertedCount,
      transactions: transactions.length > 0 ? transactions : parsedTransactions,
    };
  },

  /**
   * Retrieves saved bank SMS transactions for a business.
   */
  async getTransactions(
    businessId: string,
    filter: {
      provider?: BankProvider | 'all';
      status?: SmsImportStatus | 'all';
      flow?: TransactionFlow | 'all';
      limit?: number;
    } = {}
  ): Promise<ParsedBankTransaction[]> {
    return await localSmsRepo.getTransactions(businessId, filter);
  },

  /**
   * Retrieves grouped balance and transaction volume summaries per bank provider.
   */
  async getProviderSummaries(
    businessId: string
  ): Promise<Record<BankProvider, ProviderSummary>> {
    return await localSmsRepo.getProviderSummaries(businessId);
  },

  /**
   * Updates transaction processing state (e.g. converted_sale, converted_expense, ignored).
   */
  async updateStatus(
    id: string,
    status: SmsImportStatus,
    convertedEntityId?: string | null
  ): Promise<void> {
    await localSmsRepo.updateStatus(id, status, convertedEntityId);
  },

  /**
   * Deletes a single SMS record.
   */
  async deleteTransaction(id: string): Promise<void> {
    await localSmsRepo.deleteTransaction(id);
  },

  /**
   * Clears all bank SMS records for a specific business.
   */
  async clearAll(businessId: string): Promise<void> {
    await localSmsRepo.clearAll(businessId);
  },
};
