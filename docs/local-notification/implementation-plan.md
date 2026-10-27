# Local Notifications — Implementation Plan

## 1. Overview & Scope

This implementation plan details the step-by-step development of the **100% On-Device Local Notification Engine** on branch `feature/local-notification`.

### Scope Alignment
- **Included (Phase 1 & Phase 3)**:
  - Customer Credit (Bidir / Dube) due date reminders & overdue escalation (System tray + tab badge).
  - Inbound Bank SMS payment ingestion alerts (Instant floating in-app banner + system notification).
  - Offline sync queue numeric badge bubbles in the header.
  - Sales goal / revenue milestone celebratory toasts.
- **Excluded**:
  - Remote push notification triggers (APNs, Firebase FCM backend cron).
  - Cash drawer & shift discrepancy alerts.

---

## 2. Directory & File Manifest

```text
mobile/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── in-app-toast.tsx                  # Global floating toast & banner component
│   │   └── navigation/
│   │       ├── bottom-tab-bar.tsx                # Updates: injects dynamic badge into Bidir tab
│   │       └── hamburger-drawer.tsx              # Confirms header sync badge indicator
│   ├── db/
│   │   └── schema.ts                             # Updates: adds local_notification_log table
│   ├── hooks/
│   │   ├── use-in-app-toast.ts                   # Hook for triggering floating banners
│   │   └── use-local-notifications.ts            # Root lifecycle watcher (evaluates due dates on mount)
│   ├── lib/
│   │   ├── local-notification-channels.ts        # Android notification channel definitions
│   │   └── local-notification-scheduler.ts       # expo-notifications wrapper for scheduling & cancelling
│   ├── repositories/
│   │   └── local-notification-log.repo.ts        # SQLite deduplication queries
│   ├── services/
│   │   ├── dube-reminder.service.ts              # Scans SQLite for upcoming & overdue credit
│   │   ├── sms-notification.service.ts           # Triggers immediate toast/notification upon SMS detection
│   │   └── sales-milestone.service.ts            # Checks daily sales total vs goal threshold
│   └── store/
│       └── toast-store.ts                        # Zustand store for queueing in-app floating banners
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Local Notification Infrastructure & Permissions `[COMPLETED]`

#### Objective
Configure native Android channels, request user permissions, and initialize `expo-notifications` for pure local operation.

#### Tasks
1. [x] **Dependencies**:
   - `expo-notifications` (~57.0.24) installed in `mobile/package.json`.
   - Updated `mobile/app.json` plugins for notification icon and color configuration (`#065F46`).
2. [x] **Channel Configuration (`local-notification-channels.ts`)**:
   - Registered `payment_alerts` (Max importance, vibration `[0, 250, 250, 250]`, emerald accent `#10B981`).
   - Registered `dube_reminders` (High importance, vibration `[0, 200, 200, 200]`, amber accent `#D97706`).
   - Registered `milestones` (Default importance, purple accent `#8B5CF6`).
3. [x] **Notification Handler & Scheduler (`local-notification-scheduler.ts`)**:
   - Set `Notifications.setNotificationHandler` with foreground presentation alert banners, sound, and badge.
   - Built permission handlers, instant notification dispatcher, and scheduled notification engine.
   - Wired deep link tap listener to direct users to target app screens.
4. [x] **Lifecycle Hook Integration (`use-local-notifications.ts` & `_layout.tsx`)**:
   - Mounted `useLocalNotifications()` in root layout to ensure notification channels and listeners are initialized on app startup.

---

### Phase 2: In-App Toast & Floating Banner Pipeline `[COMPLETED]`

#### Objective
Provide a unified, highly aesthetic slide-down toast banner for instant foreground alerts (e.g. when an SMS payment arrives while the app is active).

#### Tasks
1. [x] **Zustand Toast Store (`toast-store.ts`)**:
   - State: `activeToast: ToastPayload | null`
   - Actions: `showToast(payload)`, `dismissToast()`.
   - Auto-dismiss timer: default 5,000ms with manual dismissal support and programmatic clear.
2. [x] **In-App Toast Hook (`use-in-app-toast.ts`)**:
   - Created hook and standalone helpers `showInAppToast` and `dismissInAppToast`.
3. [x] **In-App Toast Component (`in-app-toast.tsx`)**:
   - Mounted in `mobile/src/app/_layout.tsx`.
   - Slides down from top with smooth spring animation, swipe-up to dismiss, and safe area insets.
   - Supports 4 variants: `payment` (emerald), `warning` (amber), `milestone` (purple/gold), `info` (blue).
   - Includes 1-tap action button (e.g. *"View & Book"*) that executes callback and auto-dismisses banner.
   - Renders amount highlights and transaction reference chips.
4. [x] **Icon Library Extension (`icons/index.tsx`)**:
   - Added `AwardIcon` and `InfoIcon` with `SafeSvg` fallback.

---

### Phase 3: Customer Credit (Dube / Bidir) Reminders & Tab Badge `[COMPLETED]`

#### Objective
Alert the merchant to customer debts that are due today or overdue, both in the system tray and via a persistent badge on the Bidir bottom tab.

#### Tasks
1. [x] **Deduplication Storage (`local-notification-log.repo.ts`)**:
   - Table: `local_notification_log (id, dedupe_key, type, reference_id, notified_at)` added in SQLite migration v5.
   - Prevents sending multiple alerts for the same Dube on the same day (`hasBeenNotifiedToday`).
   - Automatically prunes old logs (> 30 days) to keep local storage lightweight.
2. [x] **Evaluator Logic (`dube-reminder.service.ts`)**:
   - Queries local SQLite database for customer credit where:
     `status = 'pending' AND sale_type = 'dube' AND due_date IS NOT NULL AND date(due_date) <= date('now')`
   - Categorizes due today vs overdue count & sum.
   - Dispatches system notification via `triggerInstantLocalNotification` on `NOTIFICATION_CHANNELS.DUBE_REMINDERS.id`.
   - Dispatches in-app warning toast with tap-to-act *"View Debt Notebook"* button.
   - Integrated into `useLocalNotifications` lifecycle watcher to run once per day per active business on app startup.
3. [x] **Tab Badge Counter (`bottom-tab-bar.tsx`)**:
   - Retrieves live `overdueCount` and `dueSoonCount` from `useBidrStore`.
   - Renders a red numeric bubble (`#DC2626`) for overdue debts, or amber (`#D97706`) for debts due today/soon over the `Debt / Bidr` bottom tab icon.

---

### Phase 4: Inbound Bank SMS Immediate Notification Pipeline `[COMPLETED]`

#### Objective
Immediately inform the merchant when a bank payment notification (Telebirr, CBE Birr, Awash, BOA, Dashen) is received.

#### Tasks
1. [x] **Hook into SMS Ingestion Pipeline**:
   - Extended `localSmsRepo.insertOrIgnoreBatchWithResults(...)` to track newly inserted transactions with SQLite `INSERT OR IGNORE`.
   - Wired `smsNotificationService.notifyNewlyDiscoveredTransactions(...)` into `textFetchingService.scanAndProcessInbox(...)`.
2. [x] **Notification & Toast Dispatch (`sms-notification.service.ts`)**:
   - If app is in foreground: Dispatches an In-App Toast banner with emerald payment variant, provider pill (e.g. `Telebirr`, `CBE / CBEBirr`), amount chip, reference chip, and *"View & Book"* action.
   - Dispatches a local system tray notification via `NOTIFICATION_CHANNELS.PAYMENT_ALERTS.id` (max importance, vibration, sound).
   - Groups multi-transaction batch arrivals into a clean summary banner.
3. [x] **Deduplication & Deep-Linking**:
   - Uses `localNotificationLogRepo` with key `sms_notif_${transactionRef}` to guarantee zero duplicate alerts.
   - Notification payload embeds `{ url: '/text-fetching', type: 'bank_sms', transactionId, ref }` for 1-tap navigation to the transaction booking screen.

---

### Phase 5: Resilience Bubbles & Header Sync `[COMPLETED]`

#### Objective
Deliver non-intrusive status feedback for offline sync queues with real-time reactive counts and automated completion alerts.

#### Tasks
1. [x] **Real-time Outbox Event Bus (`sync-engine.ts` & `sync-queue.repo.ts`)**:
   - Added `onQueueChangeListener` in `syncQueueRepo` to trigger immediate updates whenever records are queued or cleared offline.
   - Forwarded `pushedCount` on `sync_success` events from `SyncEngine`.
2. [x] **Offline Queue Sync Bubble (`sync-status-badge.tsx`)**:
   - Renders live `pendingCount` with clean numeric bubble and `99+` overflow cap.
   - Offline mode: Amber bubble (`#D97706`) with `WifiOff` icon.
   - Pending online mode: Blue bubble (`#2563EB`) with `CloudUpload` icon.
   - Syncing mode: Emerald bubble (`#059669`) with `RefreshCw` icon.
   - Connected & synced: Clean minimalist `Wifi` icon.
3. [x] **Reconnection Completion Toast (`use-network-sync.ts`)**:
   - On network reconnection and successful sync completion: automatically displays toast:
     *"Offline Sync Complete: All X offline updates synced to cloud."*
4. [-] **Sales Target Milestones**:
   - Deferred per user instruction to focus exclusively on operational reliability.

---

## 4. Verification & Testing Matrix

| Test Case | Procedure | Expected Result |
|---|---|---|
| **Android Permissions** | Launch app fresh on device | System prompts for notification permission; gracefully handles allow/deny. |
| **Dube Due Reminder** | Insert test debt with `dueDate = today` into SQLite | Notification fires; dedupe record stored; second launch on same day does not re-alert. |
| **Dube Tab Badge** | Have 2 overdue debts in store | Bidir tab on bottom navigation displays `2` badge bubble. |
| **Inbound Bank SMS** | Simulate Telebirr SMS via SMS service | Floating toast banner slides down; tapping *"Book Sale"* opens conversion dialog. |
| **Offline Sync Bubble** | Create 3 sales while offline | Header sync badge shows `3` counter; reconnecting clears bubble and shows sync toast. |
| **Sales Milestone** | Log sales exceeding 10,000 ETB | Milestone celebration toast displays once; does not re-fire on next sale until next tier. |
| **Zero Remote Dependency** | Put phone in Airplane Mode and test all triggers | All notifications, toasts, and badges continue functioning 100% offline. |
