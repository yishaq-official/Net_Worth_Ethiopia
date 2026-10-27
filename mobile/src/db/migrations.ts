import { getDatabase, isSQLiteAvailable } from './client';
import { CREATE_TABLES_SQL } from './schema';

export const CURRENT_SCHEMA_VERSION = 5;

/**
 * Runs pending database migrations using SQLite user_version pragma.
 * Guarantees that tables and indexes exist before any repository runs queries.
 */
export async function initLocalDatabase(): Promise<void> {
  if (!isSQLiteAvailable()) {
    console.log(
      '[SQLite Migrations] Native module ExpoSQLite not detected in current APK. Running in online fallback mode. Rebuild with `npx expo run:android` to enable offline SQLite.'
    );
    return;
  }

  const db = await getDatabase();

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    console.log('[SQLite Migrations] Running initial migration (version 0 -> 1)...');
    await db.execAsync(`
      ${CREATE_TABLES_SQL}
      PRAGMA user_version = 5;
    `);
    console.log('[SQLite Migrations] Initial schema successfully applied.');
    return;
  }

  if (currentVersion < 2) {
    console.log('[SQLite Migrations] Running migration (version 1 -> 2: local_bank_sms)...');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS local_bank_sms (
        id TEXT PRIMARY KEY NOT NULL,
        raw_sms_id TEXT,
        provider TEXT NOT NULL,
        sender_address TEXT NOT NULL,
        transaction_flow TEXT CHECK(transaction_flow IN ('deposit', 'expense', 'unknown')) NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'ETB' NOT NULL,
        transaction_ref TEXT UNIQUE NOT NULL,
        counterparty TEXT,
        account_masked TEXT,
        current_balance REAL,
        raw_body TEXT NOT NULL,
        received_at TEXT NOT NULL,
        confidence_score REAL DEFAULT 1.0 NOT NULL,
        import_status TEXT CHECK(import_status IN ('pending', 'converted_sale', 'converted_expense', 'settled_debt', 'ignored')) DEFAULT 'pending' NOT NULL,
        converted_entity_id TEXT,
        business_id TEXT NOT NULL,
        branch_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_sms_ref ON local_bank_sms(transaction_ref);
      CREATE INDEX IF NOT EXISTS idx_bank_sms_biz ON local_bank_sms(business_id, received_at DESC);
      CREATE INDEX IF NOT EXISTS idx_bank_sms_provider ON local_bank_sms(provider);
      CREATE INDEX IF NOT EXISTS idx_bank_sms_status ON local_bank_sms(import_status);

      PRAGMA user_version = 2;
    `);
    console.log('[SQLite Migrations] Version 2 schema migration applied successfully.');
  }

  if (currentVersion < 3) {
    console.log('[SQLite Migrations] Running migration (version 2 -> 3: local_financial_snapshot)...');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS local_financial_snapshot (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        branch_id TEXT,
        period_type TEXT NOT NULL,
        period_year TEXT NOT NULL,
        period_month TEXT,
        period_label TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        gross_inflow REAL NOT NULL DEFAULT 0,
        gross_outflow REAL NOT NULL DEFAULT 0,
        net_profit REAL NOT NULL DEFAULT 0,
        profit_margin_pct REAL NOT NULL DEFAULT 0,
        growth_mom_pct REAL,
        growth_yoy_pct REAL,
        transaction_count INTEGER NOT NULL DEFAULT 0,
        avg_ticket_size REAL NOT NULL DEFAULT 0,
        digital_payment_ratio REAL NOT NULL DEFAULT 0,
        telebirr_volume REAL NOT NULL DEFAULT 0,
        cbe_volume REAL NOT NULL DEFAULT 0,
        cash_volume REAL NOT NULL DEFAULT 0,
        dube_collected_volume REAL NOT NULL DEFAULT 0,
        dube_issued_volume REAL NOT NULL DEFAULT 0,
        debt_recovery_rate_pct REAL NOT NULL DEFAULT 0,
        branch_metrics_json TEXT,
        is_finalized INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_local_snapshot_biz_period 
      ON local_financial_snapshot(business_id, period_type, period_year, period_month);

      CREATE INDEX IF NOT EXISTS idx_local_snapshot_branch 
      ON local_financial_snapshot(business_id, branch_id);

      PRAGMA user_version = 3;
    `);
    console.log('[SQLite Migrations] Version 3 schema migration applied successfully.');
  }

  if (currentVersion < 4) {
    console.log('[SQLite Migrations] Running migration (version 3 -> 4: local_staff_assignment & attribution columns)...');
    await db.execAsync(`
      -- 1. Create local_staff_assignment table
      CREATE TABLE IF NOT EXISTS local_staff_assignment (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        branch_id TEXT NOT NULL,
        user_id TEXT,
        email TEXT NOT NULL,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'sales',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_local_staff_biz ON local_staff_assignment(business_id);
      CREATE INDEX IF NOT EXISTS idx_local_staff_branch ON local_staff_assignment(branch_id);
      CREATE INDEX IF NOT EXISTS idx_local_staff_email ON local_staff_assignment(email);

      -- 2. Add attribution columns to local_sale
      ALTER TABLE local_sale ADD COLUMN recorded_by_id TEXT;
      ALTER TABLE local_sale ADD COLUMN recorded_by_name TEXT;
      CREATE INDEX IF NOT EXISTS idx_local_sale_recorded_by ON local_sale(recorded_by_id);

      -- 3. Add attribution columns to local_expense
      ALTER TABLE local_expense ADD COLUMN recorded_by_id TEXT;
      ALTER TABLE local_expense ADD COLUMN recorded_by_name TEXT;
      CREATE INDEX IF NOT EXISTS idx_local_expense_recorded_by ON local_expense(recorded_by_id);

      PRAGMA user_version = 4;
    `);
    console.log('[SQLite Migrations] Version 4 schema migration applied successfully.');
  }

  if (currentVersion < 5) {
    console.log('[SQLite Migrations] Running migration (version 4 -> 5: local_notification_log)...');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS local_notification_log (
        id TEXT PRIMARY KEY NOT NULL,
        dedupe_key TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        reference_id TEXT,
        notified_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_local_notif_key ON local_notification_log(dedupe_key);
      CREATE INDEX IF NOT EXISTS idx_local_notif_date ON local_notification_log(notified_at);

      PRAGMA user_version = 5;
    `);
    console.log('[SQLite Migrations] Version 5 schema migration applied successfully.');
  }
}

/**
 * Resets all local data tables and recreates the schema from scratch.
 * Useful for development testing or when switching user accounts.
 */
export async function resetLocalDatabase(): Promise<void> {
  const db = await getDatabase();
  console.warn('[SQLite Migrations] Resetting all local database tables...');

  await db.execAsync(`
    DROP TABLE IF EXISTS local_sale;
    DROP TABLE IF EXISTS local_expense;
    DROP TABLE IF EXISTS local_branch;
    DROP TABLE IF EXISTS sync_queue;
    DROP TABLE IF EXISTS sync_metadata;
    DROP TABLE IF EXISTS local_bank_sms;
    DROP TABLE IF EXISTS local_financial_snapshot;
    DROP TABLE IF EXISTS local_staff_assignment;
    DROP TABLE IF EXISTS local_notification_log;
    PRAGMA user_version = 0;
  `);

  await initLocalDatabase();
  console.log('[SQLite Migrations] Database reset and re-initialized.');
}
