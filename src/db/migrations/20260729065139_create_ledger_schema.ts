import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create ledger entries table (double-entry lines)
  return knex.schema.createTable("ledger_entries", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("transaction_id").notNullable().references("id").inTable("transactions").onDelete("CASCADE");
    table.uuid("account_id").notNullable().references("id").inTable("accounts").onDelete("RESTRICT");
    table.enum("entry_type", ["debit", "credit"]).notNullable();
    table.decimal("amount", 15, 2).notNullable();
    table.text("description");
    table.timestamps(true, true);
    
    table.index("transaction_id");
    table.index("account_id");
    table.index(["account_id", "created_at"]);
    
    // Ensure positive amounts
    table.check("?? > 0", ["amount"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("ledger_entries");
}