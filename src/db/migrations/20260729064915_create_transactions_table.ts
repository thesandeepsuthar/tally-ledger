import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create accounts table for chart of accounts
  await knex.schema.createTable("accounts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("code", 50).unique().notNullable();
    table.string("name", 255).notNullable();
    table.enum("type", ["asset", "liability", "equity", "revenue", "expense"]).notNullable();
    table.text("description");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });

  // Create transactions table (transaction headers)
  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("idempotency_key", 255).unique().notNullable();
    table.string("transaction_number", 50).unique();
    table.enum("transaction_type", ["sale", "purchase", "payment", "receipt", "journal"]).notNullable();
    table.text("description");
    table.string("reference_number", 100);
    table.timestamp("transaction_date").notNullable().defaultTo(knex.fn.now());
    table.enum("status", ["pending", "completed", "cancelled"]).defaultTo("completed");
    table.jsonb("metadata");
    table.timestamps(true, true);
    
    table.index("idempotency_key");
    table.index("transaction_date");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("transactions");
  await knex.schema.dropTableIfExists("accounts");
}

