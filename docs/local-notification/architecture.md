# Local Notifications Architecture & Technical Design

## 1. Architectural Overview

The **Local Notification Architecture** for NetWorth Ethiopia provides timely, actionable operational feedback directly on the merchant's mobile device without relying on external cloud push notification servers (no APNs, Firebase Cloud Messaging, or remote cron dependency).

All notification evaluations, scheduling, and deliveries occur **100% on-device**, backed by local SQLite storage, native Android notification channels, and reactive in-app notification surfaces.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ON-DEVICE DATA SOURCES                            │
│  [SQLite: local_debts]    [SQLite: local_bank_sms]   [SQLite: sync_queue]   │
│  • Due dates & overdue   • Inbound SMS payments     • Unsynced count       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Reactive State & Background Checks)
┌─────────────────────────────────────────────────────────────────────────────┐
│                  TIER 1: LOCAL NOTIFICATION ENGINE (LNE)                    │
│  mobile/src/services/local-notification/                                    │
│  • dube-reminder.evaluator.ts   (Daily 09:00 scan for due/overdue credit)   │
│  • sms-payment.evaluator.ts     (Immediate trigger upon new parsed SMS)     │
│  • milestone.evaluator.ts       (Threshold scan after new sales booked)     │
│  • sync-bubble.evaluator.ts     (Continuous queue depth counter)            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Deduplication & Anti-Spam)
┌─────────────────────────────────────────────────────────────────────────────┐
│                  TIER 2: DEDUPLICATION & LOGGING STORE                      │
│  mobile/src/repositories/local-notification-log.repo.ts                     │
│  • Table: local_notification_log                                            │
│  • Ensures 1 reminder per Dube per day (dedupeKey: `dube_${id}_${date}`)    │
│  • Prevents duplicate alerts for identical bank SMS reference codes        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     TIER 3A: SYSTEM TRAY NOTIFIER    │  │     TIER 3B: IN-APP UI SURFACES   │
│  expo-notifications (Local API)      │  │  mobile/src/components/common/    │
│  • Channel: dube_reminders (High)    │  │  • In-App Toast Banner (Floating) │
│  • Channel: payment_alerts (Max)     │  │  • Navigation Tab Badge Bubbles   │
│  • Channel: milestones (Default)     │  │  • Header Status Badges (Sync)    │
│  • Lockscreen privacy formatting     │  │  • Interactive Tap Deep-Linking   │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 2. Notification Scopes & Feature Matrix

Following project requirements, the system prioritizes **Phase 1 (Operational Critical)** and **Phase 3 (Status & Milestones)**:

| Category | Trigger Event | Delivery Channel | Action on Tap |
|---|---|---|---|
| **Dube Due Today** | Customer credit `dueDate == Today` and `status == 'pending'` | System Tray Local Notification (09:00 AM) | Opens specific customer credit detail modal |
| **Dube Overdue** | Customer credit `dueDate < Today` and `status == 'pending'` | System Tray Notification + Bidir Tab Badge (`+N`) | Opens Bidir screen with overdue filter applied |
| **Inbound Bank SMS** | Whitelisted payment SMS (Telebirr, CBE, etc.) ingested | Immediate Floating In-App Banner / System Tray | Opens "Confirm & Book Sale" conversion dialog |
| **Offline Queue Bubble** | Pending SQLite sync records > 0 | Header Icon Numeric Badge (`↑N`) | Opens network status dialog with "Sync Now" action |
| **Sales Milestone** | Daily gross sales crosses goal threshold (e.g., 10k, 50k ETB) | In-App Floating Confetti Toast | Opens daily sales breakdown |

---

## 3. Core Subsystems

### 3.1 Local Notification Scheduler (`expo-notifications`)

For background/device-tray delivery when the application is minimized or closed:
- Utilizes `Notifications.scheduleNotificationAsync`.
- Operates on a daily recurring trigger (e.g. daily at 09:00 Ethiopian time) for credit due dates.
- Registers native Android Notification Channels with tailored vibration, audio, and visual importance.

### 3.2 In-App Toast & Floating Banner Pipeline

For immediate foreground events (e.g. while the cashier is actively operating the app and a customer sends a Telebirr payment):
- Built with React Native `Animated` / `react-native-reanimated` without heavy external dependencies.
- Renders an elevated, dismissible slide-down pill at the top of the viewport.
- Contains primary action button (e.g. *"Log Sale"*) and dismiss button (`✕`).

### 3.3 Tab & Header Badge Registry

For persistent visual cues that do not interrupt user interactions:
- **Bottom Navigation Tab Badge**: Bidir icon displays an amber/red counter pill showing the number of debts due today or overdue.
- **Header Sync Badge**: Network indicator displays a blue badge showing the number of offline records queued for sync.

---

## 4. Android Notification Channels Specification

In Android 8.0+ (API 26+), all local notifications must target a dedicated channel:

```typescript
export const NOTIFICATION_CHANNELS = {
  PAYMENT_ALERTS: {
    id: 'payment_alerts',
    name: 'Incoming Payment Alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#10B981', // Emerald
    sound: 'default',
  },
  DUBE_REMINDERS: {
    id: 'dube_reminders',
    name: 'Customer Credit & Due Dates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 200, 200],
    lightColor: '#D97706', // Amber
    sound: 'default',
  },
  MILESTONES: {
    id: 'milestones',
    name: 'Sales Milestones & Goals',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  },
};
```

---

## 5. Deduplication & Anti-Spam Strategy

To prevent spamming merchants with multiple notifications for the same event:

1. **Dube Reminders Deduplication**:
   - Dedupe key format: `dube_${debtId}_${yyyy_mm_dd}`
   - Stored in local SQLite table `local_notification_log`.
   - If a record exists for today's date, the evaluator skips scheduling.

2. **Bank SMS Deduplication**:
   - Dedupe key format: `sms_${transactionRef}`
   - Inherits uniqueness from the `local_bank_sms` repository (`transaction_ref`).

3. **Batching Multiple Overdue Dubes**:
   - If 5 debts are overdue on the same day, the engine aggregates them into a single consolidated notification:
     - Title: *"3 Customer Debts Due Today"*
     - Body: *"Totaling 8,450 ETB across Abebe, Chala, and 1 other. Tap to review."*

---

## 6. Lockscreen Privacy Compliance

Financial figures and debtor names can be sensitive when phones are left on store counters:
- Notifications generated by `expo-notifications` configure `android.visibility = NotificationVisibility.PRIVATE`.
- Lockscreen preview displays a generic privacy message:
  - Header: *"NetWorth Ethiopia"*
  - Body: *"You have customer credit due today. Tap to open securely."*
- Full customer names and exact monetary amounts are rendered once the merchant unlocks the device.
