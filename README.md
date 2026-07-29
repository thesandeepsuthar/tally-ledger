# Tally Ledger — Mini Inventory & Ledger Reconciliation Engine

A double-entry accounting and inventory management portal built with Next.js 16, MongoDB, and Mongoose. Guarantees strict transactional integrity — every sale/purchase posts matching debit/credit entries and atomically adjusts stock levels.

## Architecture

```
Client (React SPA)
    │
    ▼
┌──────────────────────────────────────────────┐
│         Next.js App Router (port 3000)        │
│                                               │
│  /api/v1/transactions   (POST)                │
│  /api/v1/ledger          (GET)                │
│  /api/v1/accounts        (GET, POST)          │
│  /api/v1/inventory       (GET, POST)          │
│  /api/v1/reports/summary (GET)                │
│  /api/health             (GET)                │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│            Services Layer                     │
│                                               │
│  LedgerService.createTransaction()            │
│    ├─ Idempotency check                      │
│    ├─ Double-entry validation                │
│    └─ Creates Transaction + LedgerEntry docs │
│                                               │
│  InventoryService.updateInventory()           │
│    ├─ Atomic findOneAndUpdate with $gte       │
│    ├─ Insufficient stock validation           │
│    └─ Creates InventoryMovement audit trail   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│           MongoDB (Atlas / Local)             │
│                                               │
│  accounts          — Chart of accounts        │
│  transactions      — Transaction headers      │
│  ledgerentries     — Double-entry lines       │
│  inventoryitems    — Stock items              │
│  inventorymovements— Audit trail              │
└──────────────────────────────────────────────┘
```

## File Structure

```
tally-ledger/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── transactions/route.ts   # POST — creates transaction (orchestrator)
│   │   │   │   ├── accounts/route.ts        # GET, POST accounts
│   │   │   │   ├── inventory/route.ts       # GET, POST inventory items
│   │   │   │   ├── ledger/route.ts          # GET — paginated ledger with running balance
│   │   │   │   └── reports/summary/route.ts # GET — revenue, receivables, low-stock alerts
│   │   │   └── health/route.ts              # GET — DB connectivity + system status
│   │   └── page.tsx                         # Dashboard UI
│   ├── components/
│   │   ├── TransactionForm.tsx              # Line-item entry form with GST preview
│   │   └── LedgerTable.tsx                  # Paginated, sortable, filterable ledger view
│   ├── lib/
│   │   ├── api-handler.ts                   # withDB() — DB connection middleware
│   │   └── api.ts                           # Typed API client with 15s timeout + AbortController
│   ├── services/
│   │   ├── ledgerService.ts                 # Double-entry logic, Transaction + LedgerEntry CRUD
│   │   └── inventoryService.ts             # Atomic stock updates, InventoryMovement audit trail
│   ├── db/
│   │   ├── mongodb.ts                      # Cached MongoDB connection singleton
│   │   ├── seed.ts                         # Seeds chart of accounts + inventory items
│   │   └── models/
│   │       ├── Account.ts                  # code, name, type (asset/liability/equity/revenue/expense)
│   │       ├── Transaction.ts              # idempotency_key, transaction_type, status, metadata
│   │       ├── LedgerEntry.ts              # transaction_id, account_id, entry_type, amount
│   │       ├── InventoryItem.ts            # sku, quantity, unit_price, cost_price, reorder_level
│   │       └── InventoryMovement.ts        # quantity_before/after, movement_type, unit_cost
├── .env                                     # MONGODB_URI
└── package.json
```

## Setup

### Prerequisites

- Node.js >= 20
- MongoDB instance (local or Atlas)

### Install & Run

```bash
npm install              # Install dependencies
npm run seed             # Seed chart of accounts + inventory items
npm run dev              # Start on http://localhost:3000
```

### Seed the database

```bash
npm run seed
```

Clears all existing data and creates 10 chart-of-accounts entries and 3 inventory items.

---

## API Endpoints

### POST /api/v1/transactions

Creates a sale/purchase transaction with double-entry ledger posting and inventory adjustment — all within a single ACID MongoDB session with rollback support.

**Request body:**

```json
{
  "idempotency_key": "txn_550e8400-e29b-41d4",
  "transaction_type": "sale",
  "description": "Sale to Anand Traders",
  "reference_number": "INV-1712345678",
  "transaction_date": "2026-07-29",
  "entries": [
    { "account_id": "<receivable_id>", "entry_type": "debit",  "amount": 208.86, "description": "Credit sale to Anand" },
    { "account_id": "<revenue_id>",    "entry_type": "credit", "amount": 177.00, "description": "Sales revenue" },
    { "account_id": "<cogs_id>",       "entry_type": "debit",  "amount": 90.00,  "description": "Cost of goods sold" },
    { "account_id": "<inventory_id>",  "entry_type": "credit", "amount": 90.00,  "description": "Inventory reduction" }
  ],
  "inventory_movements": [
    { "inventory_item_id": "<item_id>", "quantity": 1, "movement_type": "sale", "notes": "Sold to Anand" }
  ],
  "metadata": {
    "party": "Anand Traders",
    "gst_rate": 0.18,
    "payment_status": "Pending"
  }
}
```

**Responses:**

| Status | Body | When |
|--------|------|------|
| `201` | `{ transaction: {...}, entries: [...] }` | Success |
| `400` | `{ error: "..." }` | Validation failure, insufficient stock, item not found |

### GET /api/v1/ledger

Fetches paginated ledger entries with date filtering and running balance.

| Query param | Type | Default | Description |
|-------------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Entries per page |
| `start_date` | ISO date | — | Filter from this date |
| `end_date` | ISO date | — | Filter to this date |
| `account_id` | string | — | Filter by account |

**Response:**

```json
{
  "entries": [
    {
      "id": "...",
      "transaction_id": "...",
      "entry_type": "debit",
      "amount": "177.00",
      "transaction_date": "2026-07-29",
      "status": "completed",
      "account_code": "4000",
      "account_name": "Sales Revenue",
      "running_balance": 177.00
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 4, "pages": 1 }
}
```

### GET /api/v1/reports/summary

Returns financial summary and low-stock alerts.

**Response:**

```json
{
  "financial_summary": {
    "total_revenue": 177.00,
    "outstanding_receivables": 208.86,
    "outstanding_payables": 0,
    "inventory_value": 7500.00
  },
  "inventory_alerts": {
    "low_stock_items": [{ "id": "...", "sku": "PROD-003", "name": "Product C", "current_quantity": 8, "reorder_level": 15 }],
    "total_low_stock_items": 1
  },
  "generated_at": "2026-07-29T12:00:00.000Z"
}
```

### GET /api/v1/accounts

Lists active accounts. Optional `?type=asset` filter.

### GET /api/v1/inventory

Lists active inventory items. Optional `?low_stock=true` filter.

### GET /api/health

Returns database connectivity status.

```json
{ "status": "ok", "database": "connected" }
```

---

## Example Commands

### Get actual IDs (after seeding)

```bash
curl http://localhost:3000/api/v1/accounts
curl http://localhost:3000/api/v1/inventory
```

### Create a sale transaction

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "idempotency_key": "txn_test_001",
    "transaction_type": "sale",
    "description": "Test sale",
    "transaction_date": "2026-07-29",
    "entries": [
      {"account_id": "<ACCOUNTS_RECEIVABLE_ID>", "entry_type": "debit", "amount": 177},
      {"account_id": "<SALES_REVENUE_ID>", "entry_type": "credit", "amount": 177}
    ],
    "metadata": {"party": "Test", "payment_status": "Pending"}
  }'
```

### View ledger

```bash
curl http://localhost:3000/api/v1/ledger?page=1&limit=10
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **MongoDB ACID transactions** | Ledger posting + inventory update wrapped in `session.startTransaction()` — both commit or both abort atomically |
| **Atomic stock deduction** | `findOneAndUpdate` with `{ quantity: { $gte: N } }` + `$inc` — no race window between read and write under concurrency |
| **Idempotency key** | Duplicate `idempotency_key` returns cached result without re-posting — safe for network retries and timeout resubmits |
| **Double-entry validation** | Every request enforces `sum(debits) === sum(credits)` within 0.01 tolerance before writing |
| **Inventory audit trail** | `InventoryMovement` records `quantity_before` and `quantity_after` for every stock change — append-only, immutable |
| **Request timeout** | Frontend API client enforces 15s timeout via `AbortController` — prevents hanging UI on slow networks |
| **Deterministic skeleton loading** | Skeleton widths are static constants, not `Math.random()` — no hydration mismatches, no React diff noise |
| **Status badges** | Ledger table color-codes: green **Reconciled** (completed), yellow **Pending**, red **Flagged** (cancelled) |
| **TypeScript throughout** | End-to-end type safety from API routes to frontend components |

---

## Seed Data

### Chart of Accounts

| Code | Name | Type |
|------|------|------|
| 1000 | Cash | asset |
| 1100 | Bank Account | asset |
| 1200 | Accounts Receivable | asset |
| 1300 | Inventory | asset |
| 2000 | Accounts Payable | liability |
| 2100 | Notes Payable | liability |
| 3000 | Owner's Capital | equity |
| 4000 | Sales Revenue | revenue |
| 5000 | Cost of Goods Sold | expense |
| 5100 | Operating Expenses | expense |

### Inventory Items

| SKU | Name | Qty | Unit Price | Cost Price | Reorder Level |
|-----|------|-----|------------|------------|--------------|
| PROD-001 | Product A | 50 | ₹100 | ₹60 | 10 |
| PROD-002 | Product B | 30 | ₹150 | ₹90 | 5 |
| PROD-003 | Product C | 8 | ₹75 | ₹45 | 15 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB (Atlas / local) |
| ODM | Mongoose 9 |
| Styling | Tailwind CSS 4 |
| Runtime | Node.js 20+ |