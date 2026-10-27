<p align="center">
  <img src="web/public/logo.png" alt="NetWorth Ethiopia Logo" width="130" />
</p>

<h1 align="center">NetWorth Ethiopia</h1>

<p align="center">
  <strong>Transforming Informal African Retail Into Bankable Enterprises</strong>
</p>

<p align="center">
  An offline-first financial operating system, automated SMS ledger, multi-branch management engine, and alternative credit underwriting infrastructure built to bridge the MSME financing gap in Ethiopia.
</p>

---

## The Research

In Ethiopia and across sub-Saharan Africa, micro, small, and medium enterprises (MSMEs) drive over 80% of urban employment and 90% of private sector commerce. Yet over 85% of these merchants cannot secure working capital credit from commercial banks.

They are not failing businesses; they are profitable, cash-generative merchants trapped in an outdated banking paradigm.

Commercial banks (Commercial Bank of Ethiopia, Awash Bank, Dashen Bank, and regional microfinance institutions) require physical real-estate collateral, audited balance sheets, and formal tax clearance certificates. An informal shopkeeper, electronics retailer, or wholesale distributor in Addis Ababa does not own commercial real estate—what they possess is high inventory turnover, daily transactional cash flow, and active digital inflows across mobile money rails.

**NetWorth Ethiopia replaces physical collateral with verified transaction velocity.**

By turning the merchant's smartphone into an automated accounting terminal, NetWorth captures informal cash flow at the source, parses incoming mobile money SMS confirmations, manages multi-branch retail operations, formalizes undocumented customer credit (*Dube*), and translates operational history into a deterministic, institutional-grade credit dossier that commercial loan officers can audit and approve in minutes.

---

## Core System Architecture & Features

### 1. Sales & Expense Management Engine
NetWorth provides a rapid point-of-sale recording flow optimized for high-volume retail environments:
- **Multi-Rail Sales Logging**: Transactions are recorded in seconds and categorized by settlement method: physical Cash, Telebirr, or CBE Birr.
- **Instant vs. Deferred Revenue**: The system clearly segregates instant cash inflows from deferred customer credit (*Dube*), preventing false revenue inflation.
- **Categorized Expense Ledger**: Operating expenses, raw inventory procurement, utility overheads, employee wages, and transport logistics are logged against specific branch locations for localized P&L (Profit & Loss) tracking.
- **Daily Digest & End-of-Day Reconciliation**: Aggregated daily intake summaries allow shopkeepers to reconcile physical drawer cash against mobile money account balances before closing.
- **Automated SMS-to-Ledger Conversion**: Incoming payment SMS alerts from Telebirr and CBE are parsed on-device and converted into verified sales, expense entries, or customer debt settlements with a single tap.

### 2. Multi-Branch Enterprise Management
African retail enterprises frequently operate across multiple stalls, kiosks, or geographic stores (e.g., Mercato Wholesale, Bole Retail Outlet, Piassa Branch). NetWorth natively handles multi-branch networks:
- **Localized Branch Ledgers**: Each branch maintains its own localized cash drawer, staff operators, and transactional history.
- **Role-Based Staff Access**: Merchants assign staff operators to specific branches with granular permissions (`owner`, `manager`, `cashier`), preventing unauthorized ledger access or rogue edits.
- **Enterprise Consolidation vs. Branch Filter**: Enterprise owners can view an aggregated, consolidated financial position across all branches or filter sales, expenses, and margins for a single specific location.
- **Branch Contribution Analytics**: The system computes real-time performance breakdowns per branch—inflow, outflow, net profit, and percentage share of total enterprise revenue (`sharePct`)—stored dynamically in longitudinal financial snapshots.

### 3. Customer Credit (*Dube*) Ledger
Informal customer credit is an essential customer-retention mechanism in Ethiopian retail, but handwritten paper notebooks (*defter*) cause disputes, defaults, and lost revenue:
- **Digital Credit Granting**: Merchants record customer identity, contact information, credit lines, and agreed repayment windows.
- **Payment Schedules & Partial Recovery**: Tracks incremental partial cash or digital settlements with immutable audit timestamps.
- **Recovery Velocity Tracking**: Measures collection discipline, average days to recovery, and default rates, feeding directly into the merchant's alternative credit score.

### 4. Deterministic Business Health Score (0–100)
Rather than relying on subjective human judgment or black-box synthetic models, NetWorth evaluates merchant creditworthiness through a deterministic mathematical model based on **Four Financial Pillars** totaling 100 points:

#### Pillar 1: Revenue Velocity & Stability (Weight: 30 Points)
Measures the absolute volume, consistency, and profitability of gross monthly cash inflows:
- Evaluates average monthly revenue in Ethiopian Birr (ETB).
- Evaluates consecutive profitable operating months over trailing quarters.
- Scores stability from 8 (baseline) up to 30 points for steady, cash-flow-positive enterprises.

#### Pillar 2: Verified Digital Footprint (Weight: 25 Points)
Measures the **Digital Trail Ratio**—the proportion of total revenue verified through non-repudiable digital rails versus untracked physical cash:
$$\text{Digital Trail Ratio} = \left( \frac{\text{Telebirr Settled (ETB)} + \text{CBE Birr Settled (ETB)}}{\text{Total Settled Volume (ETB)}} \right) \times 100$$
Digital receipts cannot be backdated or falsified. A higher digital ratio directly improves underwriting confidence, scoring between 5 and 25 points.

#### Pillar 3: Customer Credit (*Dube*) Recovery Discipline (Weight: 25 Points)
Measures the merchant's working capital collection efficiency on informal customer credit:
- Evaluates the debt recovery rate percentage: $\left(\frac{\text{Dube Collected}}{\text{Dube Issued}}\right) \times 100$.
- Calculates average turnaround time (days to full settlement).
- High recovery rates with short collection cycles score up to 25 points.

#### Pillar 4: Operating Margin & Expense Control (Weight: 20 Points)
Measures overhead discipline and operational viability:
- Calculates net operating margin percentage: $\left(\frac{\text{Gross Inflow} - \text{Gross Outflow}}{\text{Gross Inflow}}\right) \times 100$.
- Healthy margins after inventory and overhead costs award up to 20 points.

#### Composite Score & Rating Grades
$$\text{Business Health Score} = \min(100, \max(0, P_1 + P_2 + P_3 + P_4))$$

| Score Range | Institutional Rating | Underwriting Assessment |
|---|---|---|
| **80 – 100** | **Grade A** | Prime credit tier: High digital volume, strong margin, rapid debt recovery. |
| **70 – 79** | **Grade B** | Near-prime tier: Consistent revenue with moderate cash reliance. |
| **55 – 69** | **Grade C** | Emerging tier: Profitable but requires structured short-tenor financing. |
| **Below 55** | **Grade D** | High-risk tier: Low digital footprint or elevated debt defaults. |

#### Safe Working Capital Loan Ceiling Formula
To protect borrowers from predatory debt and provide loan officers with an actionable lending limit, NetWorth calculates a deterministic working capital ceiling:
$$\text{Recommended Loan (ETB)} = \text{Monthly Revenue} \times 0.70 \times \left( \frac{\text{Health Score}}{100} \right)$$
*(Result is conservatively rounded to the nearest 1,000 ETB)*

---

### 5. Institutional Bank Dossiers & Secure Sharing
Traditional loan applications in Ethiopia take weeks of branch visits, physical paperwork verification, and manual receipt stamping. NetWorth replaces this with **Self-Sovereign Cryptographic Dossiers**:

```text
[ Merchant Mobile App ]
         │
         │ 1. Tap "Share Financial Dossier"
         │ 2. Select Purpose (e.g. Working Capital Loan, Inventory Credit)
         │ 3. Select Target Institution (e.g. Commercial Bank of Ethiopia)
         │ 4. Choose Validity Duration (7, 14, 30, or 60 Days)
         ▼
[ Express API Scoring Engine ]
         │
         │ 5. Generates 64-character cryptographic token via crypto.randomBytes(32)
         │ 6. Inserts record into "financial_share_token" table
         │ 7. Produces unique URL: http://<domain>/dossier/<token>
         ▼
[ Bank Loan Officer / Underwriter Browser ]
         │
         │ 8. Opens URL without requiring bank IT system login
         │ 9. Reviews verified, read-only institutional audit:
         │    • Composite Health Score Gauge (0–100) & Grade Badge
         │    • Recommended Safe Loan Ceiling (ETB)
         │    • Four Pillar Scorecards with Status Badges (strong / moderate / weak)
         │    • 12-Month Inflow vs Outflow Cash Flow Velocity Curve (D3.js)
         │    • Digital vs Cash Settlement Method Distribution Donut (D3.js)
         │    • Multi-Branch Location & Performance Roster
         ▼
[ Instant, Collateral-Free Underwriting Decision ]
```

#### Security & Access Governance
- **Zero-Friction Institutional Access**: Loan officers review dossiers directly in any web browser without needing to create platform user accounts.
- **Time-Bounded Validity**: Tokens automatically expire after the configured window (e.g., 30 days). Expired tokens return immediate rejection payloads.
- **Instant Merchant Revocation**: Merchants can toggle any active share token to inactive with one tap, immediately cutting off underwriter access.
- **Audit Logging**: Every underwriter view increments an access counter (`accessCount`) for transparency.

---

### 6. Offline-First Synchronization Architecture
To ensure continuous operation during cellular network outages and power cuts:
- **Local SQLite Persistence**: Every transaction (sale, expense, credit entry) is written immediately to an on-device SQLite database.
- **Deterministic Queueing**: Pending mutations are staged in a local sync queue with ISO timestamps.
- **Batch Reconciliation**: Once connectivity is restored, the mobile client reconciles pending batches with the backend API (`POST /api/sync/batch`), ensuring zero data loss and sub-millisecond local UI interactions.

---

## Monorepo Architecture

NetWorth Ethiopia is organized as an enterprise-grade monorepo separating presentation, transactional services, and institutional underwriting.

```text
Net_Worth_Ethiopia/
|-- mobile/                 # Merchant Operating System (React Native / Expo SDK 57)
|   |-- src/app/            # Expo Router (auth, tabs, business, branches, staff, dossier)
|   |-- src/components/     # Design system, glass primitives, NativeWind styling
|   |-- src/db/             # Local SQLite database schemas, migrations, repositories
|   |-- src/features/       # Domain engines: SMS text-fetching, sales, dube ledger
|   |-- src/lib/            # Better Auth client, API client, SQLite drivers
|   `-- src/store/          # Zustand global stores (auth, business, branch, sync)
|
|-- backend/                # Core REST API & Scoring Engine (Express 5 / TypeScript)
|   |-- src/controllers/    # HTTP input validation & response formatting
|   |-- src/db/             # PostgreSQL schemas via Drizzle ORM (sales, expenses, branches)
|   |-- src/middleware/     # Auth guards, role authorization, error handling
|   |-- src/repositories/   # Direct Drizzle SQL queries & aggregation pipelines
|   |-- src/routes/         # Express endpoint definitions
|   |-- src/service/        # Health scoring engine, dossier generator, telemetry
|   `-- src/validations/    # Zod runtime request schemas
|
|-- web/                    # Telemetry Console & Loan Underwriting Portal (Next.js 16)
|   |-- app/admin/          # Superadmin operational console (ecosystem GTV, merchant roster)
|   |-- app/dossier/        # Public, read-only tokenized underwriter dossiers
|   |-- components/         # D3.js visualization engines, metric cards, data tables
|   |-- lib/                # API communication clients and proxy rewrites
|   `-- store/              # Zustand state stores for administrative sessions
|
`-- docs/                   # System architecture specifications and operational runbooks
```

---

## Technology Stack & Technical Rationale

### Mobile Client: React Native / Expo SDK 57
- **Expo SDK 57 & React Native 0.86**: Modern React Native architecture with stable native modules for local storage, background tasks, and secure keychain access.
- **Local SQLite (`expo-sqlite`)**: Essential for emerging market resilience. Offline transactions commit in sub-milliseconds without blocking the UI.
- **NativeWind (Tailwind CSS) & Glass Primitives**: High-performance UI rendering smoothly at 60 FPS across budget and flagship Android devices.
- **`@better-auth/expo`**: Enterprise-grade session management with deep-link redirection (`networth://`).

### Backend API: Express 5, TypeScript, PostgreSQL, Drizzle ORM
- **Express 5 & TypeScript**: High-throughput REST API with end-to-end static type safety.
- **Drizzle ORM & PostgreSQL**: Fast SQL-like queries and zero-overhead aggregations across large transaction ledgers.
- **Better Auth**: Multi-role authentication (merchants, staff, superadministrators) supporting credentials and Google OAuth.
- **Zod Runtime Validation**: Zero trust on external payloads; all inputs are validated before hitting service logic.

### Web Underwriting & Telemetry Portal: Next.js 16, React 19, D3.js
- **Next.js 16 App Router**: Server-side rendering ensuring instant, lag-free dossier loading for loan officers.
- **Custom D3.js Visualizations**: Precision area curves for cash flow velocity and settlement distribution donuts with dynamic empty-state handling.
- **Transparent Reverse-Proxy**: Next.js automatically rewrites `/api/*` requests to the Express backend on port 3000, eliminating CORS issues.

---

## Central Operations Console & Zero-Mock Telemetry

Platform administrators access a central telemetry dashboard at `/admin`:
- **Gross Ecosystem GTV (ETB)**: Real-time cumulative transaction volume processed across all merchant ledgers.
- **Digital Trail Ratio (%)**: Ecosystem-wide proportion of digital settlements (Telebirr + CBE) versus cash.
- **Settlement Method Composition**: Interactive D3 donut visualization comparing payment channels.
- **Gross Cash Flow Velocity**: Trailing monthly transaction curves across the platform.
- **Active Underwriting Dossiers**: Real-time count of active public share links accessed by financial institutions.

**Zero Mock Data Policy**: Every dashboard card, table, and chart is computed directly from active PostgreSQL rows. If the database is clean, the console renders zeroes and empty states—never falling back to synthetic constants.

---

## Local Development & Setup

### Prerequisites
- Node.js (v20.x or higher)
- PostgreSQL (v15 or higher) running locally or accessible via network
- Android SDK Platform Tools (with `adb` in your system `PATH`)
- Physical Android phone with USB Debugging enabled (or Android Studio emulator)

---

### Step 1: Backend Setup

Navigate to the `backend/` directory:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/networth_db
BETTER_AUTH_SECRET=your_secure_random_secret_string
BETTER_AUTH_URL=http://localhost:3000
WEB_URL=http://localhost:3001
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Initialize the database schema and seed the administrator account:

```bash
# Push schema migrations to PostgreSQL
npm run db:migrate

# Seed the superadmin account (enforces zero fake merchant data)
npm run db:seed

# Start backend development server
npm run dev
```

The Express API starts on `http://localhost:3000`.

---

### Step 2: Mobile Client Setup

Navigate to the `mobile/` directory:

```bash
cd mobile
npm install
```

Configure `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### Android Port Reversal Setup
Physical Android devices connected via USB resolve `localhost` to the phone itself. Port reversal maps network traffic back to the host machine:

```bash
# Run with continuous ADB reverse proxy monitoring for Port 3000 and Metro 8081
npm run android
```

If re-plugging a device manually:

```bash
npm run reverse
```

---

### Step 3: Web Portal Setup

Navigate to the `web/` directory:

```bash
cd web
npm install
```

Configure `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the Next.js development server:

```bash
npm run dev
```

The portal is accessible at:
- **Central Admin Console**: `http://localhost:3001/admin`
  - Login: `admin1g@gmail.com`
  - Password: `admin1234`
- **Public Underwriter Dossier**: `http://localhost:3001/dossier/<share-token>`

---

## Database Schema Highlights

The relational schema is configured in `backend/src/db/` using Drizzle ORM:

| Table | Domain Responsibility |
|---|---|
| `user` | Merchant owners, staff operators, and system administrators. |
| `business` | Commercial enterprise entity, trade classification, and tax registration. |
| `branch` | Physical outlet locations, inventory storage sites, and local cash registers. |
| `staff_member` | Branch staff assignments, operational roles, and access credentials. |
| `sale` | Individual sales transactions tagged by payment rail (`CASH`, `TELEBIRR`, `CBE_BIRR`). |
| `expense` | Categorized operational overhead, raw inventory costs, and branch utility expenses. |
| `bidr_record` | Customer credit (*Dube*) receivables, customer contact links, and repayment terms. |
| `financial_share_token` | High-entropy 64-character tokens for time-bounded public dossier access. |
| `business_financial_snapshot` | Historical monthly aggregations, branch metric breakdowns, and health scores. |

---

## Architectural Principles & Standards

1. **Mission-Driven Engineering**: Code is built to solve real operational obstacles faced by small businesses in emerging economies.
2. **Offline-First Resilience**: Handset software must never freeze, drop data, or display fatal errors during network dropouts.
3. **Data Integrity Over Synthetics**: No fake metrics or synthetic numbers. Telemetry reflects genuine commercial activity.
4. **Non-Invasive Institutional Access**: Commercial banks evaluate borrowers via tokenized public dossiers without requiring internal IT system integration.
5. **Decoupled Architecture**: Strict separation of concerns between mobile client presentation, API transactional processing, and web analytics.

---

## License

Proprietary and Confidential. Developed by the NetWorth Ethiopia development team. All rights reserved.
