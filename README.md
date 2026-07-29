# Tally Ledger — Mini Inventory & Ledger Reconciliation Engine

A double-entry accounting and inventory management portal built with Next.js 16, MongoDB, and Mongoose. Guarantees strict transactional integrity — every sale/purchase posts matching debit/credit entries and atomically adjusts stock levels.

## Architecture

```
Client (React SPA)
    │
    ▼
┌─────────────────────────────────────────────┐
│          Next.js App Router (port 8002)      │
│                                              │
│  /api/v1/transactions  (POST)                │
│  /api/v1/ledger         (GET)                │
│  /api/v1/accounts       (GET, POST)          │
│  /api/v1/inventory      (GET, POST)          │
│  /api/v1/reports/summary (GET)               │
│  /api/health            (GET)                │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          Services Layer                      │
│                                              │
│  LedgerService.createTransaction()           │
│    ├─ Idempotency check                     │
│    ├─ Double-entry validation               │
│    └─ Creates Transaction + LedgerEntry docs│
│                                              │
│  InventoryService.updateInventory()          │
│    ├─ Atomic findOneAndUpdate with $gte      │
│    ├─ Stock validation                       │
│    └─ Creates InventoryMovement audit trail  │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          MongoDB (Atlas / Local)             │
│                                              │
│  accounts                                    │
│  transactions                                │
│  ledgerentries                               │
│  inventoryitems                              │
│  inventorymovements                          │
└─────────────────────────────────────────────┘
```

## File Structure

```
tally-ledger/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── transactions/route.ts   # POST — create transaction (orchestrator)
│   │   │   │   ├── accounts/route.ts        # GET, POST accounts
│   │   │   │   ├── inventory/route.ts       # GET, POST inventory items
│   │   │   │   ├── ledger/route.ts          # GET — ledger entries with pagination
│   │   │   │   └── reports/summary/route.ts # GET — financial summary + low-stock alerts
│   │   │   └── health/route.ts              # GET — DB connectivity check
│   │   └── page.tsx                         # Dashboard (RFC 84)
│   ├── components/
│   │   ├── TransactionForm.tsx              # Line-item entry form with GST preview
│   │   └── LedgerTable.tsx                  # Paginated, sortable, filterable ledger view
│   ├── lib/
│   │   ├── api-handler.ts                   # withDB() — DB connection middleware
│   │   └── api.ts                          # Typed API client with timeout + AbortController
│   ├── services/
│   │   ├── ledgerService.ts                 # Double-entry logic, LedgerEntry CRUD
│   │   └── inventoryService.ts             # Atomic stock updates, movement audit trail
│   ├── db/
│   │   ├── mongodb.ts                      # Cached MongoDB connection singleton
│   │   ├── seed.ts                         # Seeds chart of accounts + inventory items
│   │   └── models/
│   │       ├── Account.ts                  # code, name, type (asset/liability/etc.)
│   │       ├── Transaction.ts              # idempotency_key, type, status, metadata
│   │       ├── LedgerEntry.ts              # transaction_id, account_id, debit/credit, amount
│   │       ├── InventoryItem.ts            # sku, quantity, prices, reorder_level
│   │       └── InventoryMovement.ts        # quantity_before/after, movement_type, unit_cost
├── .env                                    # MONGODB_URI
└── package.json
```

## Setup

### Prerequisites

- Node.js >= 20
- MongoDB instance (local or Atlas)

### Install & Run

```bash
npm install
npm run seed       # Seeds chart of accounts + inventory items
npm run dev        # Starts on http://localhost:3000
```

## API Endpoints

### POST /api/v1/transactions

Creates a sale/purchase transaction with double-entry ledger posting and inventory adjustment — all within a single ACID MongoDB transaction.

**Request body:**

```json
{
  "idempotency_key": "txn_uuid",
  "transaction_type": "sale",
  "description": "Sale to Anand Traders",
  "reference_number": "INV-1712345678",
  "transaction_date": "2026-07-29",
  "entries": [
    {
      "account_id": "<receivable_id>",
      "entry_type": "debit",
      "amount": 208.86,
      "description": "Credit sale"
    },
    {
      "account_id": "<revenue_id>",
      "entry_type": "credit",
      "amount": 177.0,
      "description": "Sales revenue"
    },
    {
      "account_id": "<cogs_id>",
      "entry_type": "debit",
      "amount": 90.0,
      "description": "Cost of goods sold"
    },
    {
      "account_id": "<inventory_id>",
      "entry_type": "credit",
      "amount": 90.0,
      "description": "Inventory reduction"
    }
  ],
  "inventory_movements": [
    {
      "inventory_item_id": "<item_id>",
      "quantity": 1,
      "movement_type": "sale",
      "notes": "Sold to Anand Traders"
    }
  ],
  "metadata": {
    "party": "Anand Traders",
    "gst_rate": 0.18,
    "payment_status": "Pending"
  }
}
```

**Responses:**
| Status | Body |
|--------|------|
| `201` | `{ transaction: {...}, entries: [...] }` |
| `400` | `{ error: "..." }` — validation, insufficient stock, missing item |

### GET /api/v1/ledger

Fetches paginated ledger entries with date filtering, running balance.

| Query param  | Type     | Default |
| ------------ | -------- | ------- |
| `page`       | number   | 1       |
| `limit`      | number   | 50      |
| `start_date` | ISO date | —       |
| `end_date`   | ISO date | —       |
| `account_id` | string   | —       |

### GET /api/v1/reports/summary

Returns financial summary and low-stock alerts.

### GET /api/v1/accounts

Lists active accounts. Optional `?type=asset` filter.

### GET /api/v1/inventory

Lists active inventory items. Optional `?low_stock=true` filter.

### GET /api/health

```json
{ "status": "ok", "database": "connected" }
```

## Key Design Decisions

| Decision                    | Rationale                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **MongoDB transactions**    | Ledger posting + inventory update wrapped in a single `session.startTransaction()` — if either fails, both roll back                   |
| **Atomic stock deduction**  | `findOneAndUpdate` with `{ quantity: { $gte: N } }` + `$inc` — prevents overselling under concurrent requests (no race window)         |
| **Idempotency key**         | Duplicate `idempotency_key` returns existing transaction without re-posting — safe for network retries                                 |
| **Double-entry validation** | Every request validates `sum(debits) === sum(credits)` within 0.01 tolerance before persisting                                         |
| **Audit trail**             | `InventoryMovement` records `quantity_before` and `quantity_after` for every stock change — append-only                                |
| **Request timeout**         | Frontend API client uses 15s `AbortController` timeout to prevent hanging UI                                                           |
| **Skeleton loading**        | All loading states use deterministic-width skeletons (no `Math.random()` in render) to avoid hydration mismatches and React diff noise |
| **Status badges**           | Ledger table shows: green **Reconciled** (completed), yellow **Pending**, red **Flagged** (cancelled)                                  |

## Tech Stack

| Layer     | Technology              |
| --------- | ----------------------- |
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript              |
| Database  | MongoDB (Atlas / local) |
| ODM       | Mongoose 9              |
| Styling   | Tailwind CSS 4          |
| Runtime   | Node.js 20+             |

## Seed Data

Running `npm run seed` creates:

**Accounts** (chart of accounts):
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

**Inventory Items:**
| SKU | Name | Qty | Unit Price | Cost Price |
|-----|------|-----|------------|------------|
| PROD-001 | Product A | 50 | ₹100 | ₹60 |
| PROD-002 | Product B | 30 | ₹150 | ₹90 |
| PROD-003 | Product C | 8 | ₹75 | ₹45 |
