/**
 * DDL Schema and TypeScript definitions for the local SQLite database.
 * Matches backend PostgreSQL models while incorporating offline sync tracking columns.
 */

export interface LocalSaleRow {
  id: string;
  business_id: string;
  branch_id: string;
  sale_type: 'instant' | 'dube';
  payment_method: string;
  description: string;
  amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  due_date: string | null;
  status: 'pending' | 'settled' | 'overdue' | 'voided';
  notes: string | null;
  paid_at: string | null;
  recorded_by_id?: string | null;
  recorded_by_name?: string | null;
  sync_status: 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';
  created_at: string;
  updated_at: string;
}

export interface LocalExpenseRow {
  id: string;
  business_id: string;
  branch_id: string;
  description: string;
  amount: number;
  category: string;
  notes: string | null;
  recorded_by_id?: string | null;
  recorded_by_name?: string | null;
  sync_status: 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';
  created_at: string;
  updated_at: string;
}

export interface LocalStaffAssignmentRow {
  id: string;
  business_id: string;
  branch_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: 'sales' | 'manager';
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface LocalBranchRow {
  id: string;
  business_id: string;
  name: string;
  location: string | null;
  is_active: number; // 1 = true, 0 = false
  updated_at: string;
}

export interface SyncQueueRow {
  id: number;
  mutation_id: string;
  entity_type: 'sale' | 'expense' | 'debt' | 'branch';
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'SETTLE' | 'DELETE';
  payload: string; // JSON string
  retry_count: number;
  last_error: string | null;
  status: 'pending' | 'processing' | 'failed';
  created_at: string;
}

export interface SyncMetadataRow {
  key: string;
  value: string;
  updated_at: string;
}

export interface LocalNotificationLogRow {
  id: string;
  dedupe_key: string;
  type: 'dube_reminder' | 'payment_alert' | 'milestone';
  reference_id: string | null;
  notified_at: string;
}

export interface LocalBankSmsRow {
  id: string;
  raw_sms_id: string | null;
  provider: string;
  sender_address: string;
  transaction_flow: 'deposit' | 'expense' | 'unknown';
  amount: number;
  currency: string;
  transaction_ref: string;
  counterparty: string | null;
  account_masked: string | null;
  current_balance: number | null;
  raw_body: string;
  received_at: string;
  confidence_score: number;
  import_status: 'pending' | 'converted_sale' | 'converted_expense' | 'settled_debt' | 'ignored';
  converted_entity_id: string | null;
  business_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface LocalFinancialSnapshotRow {
  id: string;
  business_id: string;
  branch_id: string | null;
  period_type: 'monthly' | 'yearly';
  period_year: string;
  period_month: string | null;
  period_label: string;
  start_date: string;
  end_date: string;
  gross_inflow: number;
  gross_outflow: number;
  net_profit: number;
  profit_margin_pct: number;
  growth_mom_pct: number | null;
  growth_yoy_pct: number | null;
  transaction_count: number;
  avg_ticket_size: number;
  digital_payment_ratio: number;
  telebirr_volume: number;
  cbe_volume: number;
  cash_volume: number;
  dube_collected_volume: number;
  dube_issued_volume: number;
  debt_recovery_rate_pct: number;
  branch_metrics_json: string | null;
  is_finalized: number; // 1 = true, 0 = false
  created_at: string;
  updated_at: string;
}

export const CREATE_TABLES_SQL = `
-- 1. Local Sales & Dube Table
CREATE TABLE IF NOT EXISTS local_sale (
  id TEXT PRIMARY KEY NOT NULL,
  business_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  sale_type TEXT CHECK(sale_type IN ('instant', 'dube')) NOT NULL,
  payment_method TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  due_date TEXT,
  status TEXT CHECK(status IN ('pending', 'settled', 'overdue', 'voided')) NOT NULL,
  notes TEXT,
  paid_at TEXT,
  recorded_by_id TEXT,
  recorded_by_name TEXT,
  sync_status TEXT DEFAULT 'pending_create' NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_sale_biz ON local_sale(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_local_sale_branch ON local_sale(branch_id);
CREATE INDEX IF NOT EXISTS idx_local_sale_status ON local_sale(status);
CREATE INDEX IF NOT EXISTS idx_local_sale_type ON local_sale(sale_type);
CREATE INDEX IF NOT EXISTS idx_local_sale_recorded_by ON local_sale(recorded_by_id);

-- 2. Local Expenses Table
CREATE TABLE IF NOT EXISTS local_expense (
  id TEXT PRIMARY KEY NOT NULL,
  business_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  recorded_by_id TEXT,
  recorded_by_name TEXT,
  sync_status TEXT DEFAULT 'pending_create' NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_expense_biz ON local_expense(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_local_expense_branch ON local_expense(branch_id);
CREATE INDEX IF NOT EXISTS idx_local_expense_recorded_by ON local_expense(recorded_by_id);

-- 3. Local Branches Table
CREATE TABLE IF NOT EXISTS local_branch (
  id TEXT PRIMARY KEY NOT NULL,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  is_active INTEGER DEFAULT 1 NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_branch_biz ON local_branch(business_id);

-- 4. Sync Outbox Queue (FIFO Mutation Log)
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mutation_id TEXT UNIQUE NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  last_error TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_pending ON sync_queue(status, id ASC);
CREATE INDEX IF NOT EXISTS idx_sync_queue_mutation ON sync_queue(mutation_id);

-- 5. Sync Metadata Store (Timestamps & Cursors)
CREATE TABLE IF NOT EXISTS sync_metadata (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 6. Local Bank SMS Transactions Table
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

-- 7. Local Financial Snapshot Table (Pre-computed Business Health summaries)
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

-- 8. Local Staff Assignment Table
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

-- 9. Local Notification Log Table (On-device deduplication)
CREATE TABLE IF NOT EXISTS local_notification_log (
  id TEXT PRIMARY KEY NOT NULL,
  dedupe_key TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  notified_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_notif_key ON local_notification_log(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_local_notif_date ON local_notification_log(notified_at);
`;
