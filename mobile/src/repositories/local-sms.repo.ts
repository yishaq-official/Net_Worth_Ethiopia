import { getDatabase, isSQLiteAvailable } from '../db/client';
import type { LocalBankSmsRow } from '../db/schema';
import type {
  BankProvider,
  ParsedBankTransaction,
  ProviderSummary,
  SmsImportStatus,
} from '@/types/text-fetching';
import { BANK_PROVIDERS, createDefaultProviderSummaries } from '@/constants/text-fetching';

export function mapRowToParsedTransaction(row: LocalBankSmsRow): ParsedBankTransaction {
  return {
    id: row.id,
    rawSmsId: row.raw_sms_id ?? '',
    provider: row.provider as BankProvider,
    senderAddress: row.sender_address,
    transactionFlow: row.transaction_flow,
    amount: Number(row.amount),
    currency: row.currency,
    transactionRef: row.transaction_ref,
    counterparty: row.counterparty,
    accountMasked: row.account_masked,
    currentBalance: row.current_balance !== null ? Number(row.current_balance) : null,
    timestamp: row.received_at,
    rawBody: row.raw_body,
    confidenceScore: Number(row.confidence_score),
    importStatus: row.import_status as SmsImportStatus,
    convertedEntityId: row.converted_entity_id,
  };
}

export const localSmsRepo = {
  /**
   * Batch inserts parsed bank SMS transactions using INSERT OR IGNORE.
   * Duplicate transaction_ref values are silently skipped by SQLite.
   * Returns the count of newly inserted rows along with the inserted transaction objects.
   */
  async insertOrIgnoreBatchWithResults(
    transactions: ParsedBankTransaction[],
    businessId: string,
    branchId: string
  ): Promise<{ insertedCount: number; newlyInserted: ParsedBankTransaction[] }> {
    if (!isSQLiteAvailable() || transactions.length === 0) {
      return { insertedCount: 0, newlyInserted: [] };
    }
    const db = await getDatabase();

    const now = new Date().toISOString();
    let insertedCount = 0;
    const newlyInserted: ParsedBankTransaction[] = [];

    for (const txn of transactions) {
      // 1. Sanitize & validate required fields to prevent SQLite constraint failures
      const amount = typeof txn.amount === 'number' && !isNaN(txn.amount) ? txn.amount : 0;
      const ref = (txn.transactionRef || '').trim() || `REF_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const timestamp = txn.timestamp && !isNaN(new Date(txn.timestamp).getTime())
        ? new Date(txn.timestamp).toISOString()
        : now;
      const flow = (['deposit', 'expense', 'unknown'] as const).includes(txn.transactionFlow as any)
        ? txn.transactionFlow
        : 'unknown';
      const status = (['pending', 'converted_sale', 'converted_expense', 'settled_debt', 'ignored'] as const).includes(txn.importStatus as any)
        ? txn.importStatus
        : 'pending';

      const txnId = txn.id || `sms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      try {
        const result = await db.runAsync(
          `INSERT OR IGNORE INTO local_bank_sms (
            id, raw_sms_id, provider, sender_address, transaction_flow,
            amount, currency, transaction_ref, counterparty, account_masked,
            current_balance, raw_body, received_at, confidence_score,
            import_status, converted_entity_id, business_id, branch_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            txnId,
            txn.rawSmsId || null,
            txn.provider || 'unknown',
            txn.senderAddress || 'unknown',
            flow,
            amount,
            txn.currency || 'ETB',
            ref,
            txn.counterparty || null,
            txn.accountMasked || null,
            typeof txn.currentBalance === 'number' && !isNaN(txn.currentBalance) ? txn.currentBalance : null,
            txn.rawBody || '',
            timestamp,
            typeof txn.confidenceScore === 'number' && !isNaN(txn.confidenceScore) ? txn.confidenceScore : 1.0,
            status,
            txn.convertedEntityId || null,
            businessId || 'default_business',
            branchId || 'default_branch',
            now,
            now,
          ]
        );

        if (result.changes > 0) {
          insertedCount += result.changes;
          newlyInserted.push({
            ...txn,
            id: txnId,
            transactionRef: ref,
            amount,
            transactionFlow: flow,
            timestamp,
          });
        }
      } catch (rowErr) {
        console.warn('[LocalSmsRepo] Skipping malformed SMS record:', txn.transactionRef, rowErr);
      }
    }

    return { insertedCount, newlyInserted };
  },

  /**
   * Batch inserts parsed bank SMS transactions using INSERT OR IGNORE.
   * Duplicate transaction_ref values are silently skipped by SQLite.
   * Returns the count of newly inserted rows.
   */
  async insertOrIgnoreBatch(
    transactions: ParsedBankTransaction[],
    businessId: string,
    branchId: string
  ): Promise<number> {
    const { insertedCount } = await this.insertOrIgnoreBatchWithResults(transactions, businessId, branchId);
    return insertedCount;
  },

  /**
   * Retrieves parsed bank SMS transactions for a business, optionally filtered by provider, status, or flow.
   */
  async getTransactions(
    businessId: string,
    options: {
      provider?: string;
      status?: string;
      flow?: string;
      limit?: number;
    } = {}
  ): Promise<ParsedBankTransaction[]> {
    if (!isSQLiteAvailable()) return [];
    const db = await getDatabase();

    const clauses: string[] = ['business_id = ?'];
    const params: any[] = [businessId];

    if (options.provider && options.provider !== 'all') {
      clauses.push('provider = ?');
      params.push(options.provider);
    }
    if (options.status && options.status !== 'all') {
      clauses.push('import_status = ?');
      params.push(options.status);
    }
    if (options.flow && options.flow !== 'all') {
      clauses.push('transaction_flow = ?');
      params.push(options.flow);
    }

    const limit = options.limit || 150;
    const sql = `
      SELECT * FROM local_bank_sms
      WHERE ${clauses.join(' AND ')}
      ORDER BY received_at DESC
      LIMIT ${limit};
    `;

    const rows = await db.getAllAsync<LocalBankSmsRow>(sql, params);
    return rows.map(mapRowToParsedTransaction);
  },

  /**
   * Updates the import status of a specific SMS transaction (e.g. converted_sale, converted_expense, ignored).
   */
  async updateStatus(
    id: string,
    status: SmsImportStatus,
    convertedEntityId?: string | null
  ): Promise<void> {
    if (!isSQLiteAvailable()) return;
    const db = await getDatabase();

    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE local_bank_sms
       SET import_status = ?,
           converted_entity_id = COALESCE(?, converted_entity_id),
           updated_at = ?
       WHERE id = ?;`,
      [status, convertedEntityId || null, now, id]
    );
  },

  /**
   * Calculates aggregated metrics grouped by bank provider for a business.
   */
  async getProviderSummaries(businessId: string): Promise<Record<BankProvider, ProviderSummary>> {
    const defaultSummaries = createDefaultProviderSummaries();

    if (!isSQLiteAvailable()) return defaultSummaries;
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
      provider: string;
      transaction_flow: string;
      total_amount: number;
      cnt: number;
      latest_balance: number | null;
      last_at: string | null;
    }>(
      `SELECT
         provider,
         transaction_flow,
         SUM(amount) as total_amount,
         COUNT(*) as cnt,
         MAX(current_balance) as latest_balance,
         MAX(received_at) as last_at
       FROM local_bank_sms
       WHERE business_id = ?
       GROUP BY provider, transaction_flow;`,
      [businessId]
    );

    for (const r of rows) {
      const p = (r.provider as BankProvider) || 'unknown';
      if (!defaultSummaries[p]) continue;

      if (r.transaction_flow === 'deposit') {
        defaultSummaries[p].totalDeposits += Number(r.total_amount || 0);
        defaultSummaries[p].depositCount += Number(r.cnt || 0);
      } else if (r.transaction_flow === 'expense') {
        defaultSummaries[p].totalExpenses += Number(r.total_amount || 0);
        defaultSummaries[p].expenseCount += Number(r.cnt || 0);
      }

      if (r.latest_balance !== null && (defaultSummaries[p].latestBalance === null || r.latest_balance > 0)) {
        defaultSummaries[p].latestBalance = Number(r.latest_balance);
      }

      if (r.last_at && (!defaultSummaries[p].lastTransactionAt || r.last_at > defaultSummaries[p].lastTransactionAt!)) {
        defaultSummaries[p].lastTransactionAt = r.last_at;
      }
    }

    return defaultSummaries;
  },

  /**
   * Permanently deletes a single SMS record from the local table.
   */
  async deleteTransaction(id: string): Promise<void> {
    if (!isSQLiteAvailable()) return;
    const db = await getDatabase();
    await db.runAsync('DELETE FROM local_bank_sms WHERE id = ?;', [id]);
  },

  /**
   * Clears all bank SMS records for a specific business.
   */
  async clearAll(businessId: string): Promise<void> {
    if (!isSQLiteAvailable()) return;
    const db = await getDatabase();
    await db.runAsync('DELETE FROM local_bank_sms WHERE business_id = ?;', [businessId]);
  },
};
