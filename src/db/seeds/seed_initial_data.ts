import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("ledger_entries").del();
  await knex("inventory_movements").del();
  await knex("transactions").del();
  await knex("inventory_items").del();
  await knex("accounts").del();

  const accounts = [
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
  ];

  const insertedAccounts = await knex("accounts").insert(accounts).returning("*");

  const accountMap = insertedAccounts.reduce((acc: any, account: any) => {
    acc[account.code] = account.id;
    return acc;
  }, {});

  const inventoryItems = [
    {
      sku: "PROD-001",
      name: "Product A",
      description: "High quality product A",
      unit_price: 100.00,
      cost_price: 60.00,
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
      unit_price: 150.00,
      cost_price: 90.00,
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
      unit_price: 75.00,
      cost_price: 45.00,
      quantity: 8,
      reorder_level: 15,
      inventory_account_id: accountMap["1300"],
      cogs_account_id: accountMap["5000"],
      revenue_account_id: accountMap["4000"],
    },
  ];

  await knex("inventory_items").insert(inventoryItems);
}
