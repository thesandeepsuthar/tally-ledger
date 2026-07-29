import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("inventory_items", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("sku", 100).unique().notNullable();
    table.string("name", 255).notNullable();
    table.text("description");
    table.decimal("unit_price", 12, 2).notNullable();
    table.decimal("cost_price", 12, 2).notNullable();
    table.integer("quantity").notNullable().defaultTo(0);
    table.integer("reorder_level").defaultTo(10);
    table.string("unit_of_measure", 50).defaultTo("unit");
    table.uuid("inventory_account_id").references("id").inTable("accounts");
    table.uuid("cogs_account_id").references("id").inTable("accounts");
    table.uuid("revenue_account_id").references("id").inTable("accounts");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
    
    table.index("sku");
    table.check("?? >= 0", ["quantity"]);
  });

  await knex.schema.createTable("inventory_movements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("inventory_item_id").notNullable().references("id").inTable("inventory_items").onDelete("CASCADE");
    table.uuid("transaction_id").references("id").inTable("transactions").onDelete("SET NULL");
    table.enum("movement_type", ["sale", "purchase", "adjustment", "return"]).notNullable();
    table.integer("quantity").notNullable();
    table.integer("quantity_before").notNullable();
    table.integer("quantity_after").notNullable();
    table.decimal("unit_cost", 12, 2);
    table.text("notes");
    table.timestamp("movement_date").notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    table.index("inventory_item_id");
    table.index("transaction_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("inventory_movements");
  await knex.schema.dropTableIfExists("inventory_items");
}
