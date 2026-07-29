# Tally Ledger - PostgreSQL API with Knex

A Next.js application with PostgreSQL database integration using Knex.js query builder.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Update with your PostgreSQL credentials

3. **Create database:**
```bash
createdb tally_ledger
```

4. **Run migrations:**
```bash
npm run migrate:latest
```

5. **Start development server:**
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API and database connection status

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/[id]` - Get transaction by ID
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Example Request
```bash
curl -X POST http://localhost:8002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "description": "Office supplies",
    "type": "debit",
    "category": "expenses"
  }'
```

## Database Scripts

- `npm run migrate:make <name>` - Create new migration
- `npm run migrate:latest` - Run all pending migrations
- `npm run migrate:rollback` - Rollback last migration batch
- `npm run seed:make <name>` - Create new seed file
- `npm run seed:run` - Run all seed files

## Tech Stack

- **Framework:** Next.js 16
- **Database:** PostgreSQL
- **Query Builder:** Knex.js
- **Language:** TypeScript
