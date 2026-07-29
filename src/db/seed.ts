import "dotenv/config";
import mongoose from "mongoose";
import { Account } from "./models/Account";
import { InventoryItem } from "./models/InventoryItem";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tally_ledger";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await Account.deleteMany({});
  await InventoryItem.deleteMany({});

  const accounts = await Account.create([
    { code: "1000", name: "Cash", type: "asset" },
    { code: "1100", name: "Bank Account", type: "asset" },
    { code: "1200", name: "Accounts Receivable", type: "asset" },
    { code: "1300", name: "Inventory", type: "asset" },
    { code: "2000", name: "Accounts Payable", type: "liability" },
    { code: "2100", name: "Notes Payable", type: "liability" },
    { code: "3000", name: "Owner's Capital", type: "equity" },
    { code: "4000", name: "Sales Revenue", type: "revenue" },
    { code: "5000", name: "Cost of Goods Sold", type: "expense" },
    { code: "5100", name: "Operating Expenses", type: "expense" },
  ]);

  const accountMap: Record<string, string> = {};
  for (const acc of accounts) {
    accountMap[acc.code] = acc._id.toString();
  }

  await InventoryItem.create([
    {
      sku: "PROD-001",
      name: "Product A",
      description: "High quality product A",
      unit_price: 100.0,
      cost_price: 60.0,
      quantity: 50,
      reorder_level: 10,
      inventory_account_id: accountMap["1300"],
      cogs_account_id: accountMap["5000"],
      revenue_account_id: accountMap["4000"],
    },
    {
      sku: "PROD-002",
      name: "Product B",
      description: "Premium product B",
      unit_price: 150.0,
      cost_price: 90.0,
      quantity: 30,
      reorder_level: 5,
      inventory_account_id: accountMap["1300"],
      cogs_account_id: accountMap["5000"],
      revenue_account_id: accountMap["4000"],
    },
    {
      sku: "PROD-003",
      name: "Product C",
      description: "Standard product C",
      unit_price: 75.0,
      cost_price: 45.0,
      quantity: 8,
      reorder_level: 15,
      inventory_account_id: accountMap["1300"],
      cogs_account_id: accountMap["5000"],
      revenue_account_id: accountMap["4000"],
    },
  ]);

  console.log("Seed completed successfully");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
