# Tally Ledger - MongoDB API with Mongoose

A Next.js application with MongoDB database integration using Mongoose ODM.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
   - Update `.env` with your MongoDB connection string

3. **Start development server:**
```bash
npm run dev
```

4. **Seed initial data (optional):**
```bash
npm run seed
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

- `npm run seed` - Seed database with initial chart of accounts and inventory items

## Tech Stack

- **Framework:** Next.js 16
- **Database:** MongoDB
- **ODM:** Mongoose
- **Language:** TypeScript
