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

### Phase 1: Local Notification Infrastructure & Permissions

#### Objective
Configure native Android channels, request user permissions, and initialize `expo-notifications` for pure local operation.

#### Tasks
1. **Dependencies**:
   - Verify `expo-notifications` installation in `mobile/package.json`.
   - Update `mobile/app.json` plugins for notification icon and color configuration:
     ```json
     [
       "expo-notifications",
       {
         "icon": "./assets/images/icon.png",
         "color": "#065F46"
       }
     ]
     ```
2. **Channel Configuration (`local-notification-channels.ts`)**:
   - Register `payment_alerts` (Max importance, vibration, emerald accent).
   - Register `dube_reminders` (High importance, amber accent).
   - Register `milestones` (Default importance).
3. **Notification Handler**:
   - Set `Notifications.setNotificationHandler` so notifications can display even when the app is foregrounded.

---

### Phase 2: In-App Toast & Floating Banner Pipeline

#### Objective
Provide a unified, highly aesthetic slide-down toast banner for instant foreground alerts (e.g. when an SMS payment arrives while the app is active).

#### Tasks
1. **Zustand Toast Store (`toast-store.ts`)**:
   - State: `activeToast: ToastPayload | null`
   - Actions: `showToast(payload)`, `dismissToast()`.
   - Auto-dismiss timer: 5,000ms with manual dismissal support.
2. **In-App Toast Component (`in-app-toast.tsx`)**:
   - Mounted in `mobile/src/app/_layout.tsx`.
   - Slides down from top with smooth spring animation (`react-native-reanimated`).
   - Supports 4 variants: `payment` (emerald), `warning` (amber), `milestone` (purple/gold), `info` (blue).
   - Includes 1-tap action button (e.g. *"View & Book"*) that triggers deep-link navigation.

---

### Phase 3: Customer Credit (Dube / Bidir) Reminders & Tab Badge

#### Objective
Alert the merchant to customer debts that are due today or overdue, both in the system tray and via a persistent badge on the Bidir bottom tab.

#### Tasks
1. **Deduplication Storage (`local-notification-log.repo.ts`)**:
   - Table: `local_notification_log (id, dedupe_key, type, reference_id, notified_at)`
   - Prevents sending multiple alerts for the same Dube on the same day.
2. **Evaluator Logic (`dube-reminder.service.ts`)**:
   - Query local SQLite database for debts where:
     `status = 'pending' AND dueDate <= DATE('now')`
   - Categorize:
     - **Due Today**: Count and total amount.
     - **Overdue**: Count and days overdue.
   - If unnotified today, schedule/dispatch local notification:
     - 1 debt: *"Dube Due Today: Abebe Bikila (1,200 ETB)"*
     - Multiple: *"3 Customer Debts Due Today: Totaling 8,450 ETB. Tap to review."*
3. **Tab Badge Counter (`bottom-tab-bar.tsx`)**:
   - Calculate total overdue + due today count from `useBidrStore`.
   - Render an amber/red numeric bubble over the `Bidir` tab icon if count > 0.

---

### Phase 4: Inbound Bank SMS Immediate Notification Pipeline

#### Objective
Immediately inform the merchant when a bank payment notification (Telebirr, CBE Birr, Awash, BOA, Dashen) is received.

#### Tasks
1. **Hook into SMS Ingestion Pipeline**:
   - In `mobile/src/store/text-fetching-store.ts` or native receiver listener:
   - When a new whitelisted SMS is successfully parsed:
     1. If app is in foreground: Dispatch an In-App Toast banner:
        - Title: *"Payment Detected: Telebirr"*
        - Message: *"Received 450.00 ETB from Dawit Tadesse"*
        - Action: *"Book Sale"* (opens sales conversion modal).
     2. If app is backgrounded: Dispatch local system tray notification via `payment_alerts` channel.
2. **Deep-Linking**:
   - Tapping the notification automatically routes to `/text-fetching` with the specific transaction pre-highlighted.

---

### Phase 5: Resilience Bubbles & Sales Milestones

#### Objective
Deliver non-intrusive status feedback for offline sync queues and celebrate business revenue accomplishments.

#### Tasks
1. **Offline Queue Sync Bubble**:
   - Read `pendingCount` from `useNetworkSync()`.
   - Update `SyncStatusBadge` in `hamburger-drawer.tsx` to render a blue badge bubble with the count of pending updates.
   - On network reconnection and successful sync completion: display a subtle toast *"All 14 offline records synced to cloud."*
2. **Sales Target Milestones (`sales-milestone.service.ts`)**:
   - When a new sale is logged in `useSalesStore`:
   - Calculate today's gross sales revenue.
   - If daily sales crosses milestone tiers (e.g., 10,000 ETB, 25,000 ETB, 50,000 ETB, 100,000 ETB):
     - Trigger in-app toast banner: *"🎉 Milestone Reached! Daily sales exceeded 25,000 ETB."*
     - Log milestone tier in SQLite to prevent repeating the same tier on the same day.

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
