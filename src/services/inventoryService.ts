import db from "@/db/knex";
import { Knex } from "knex";

export interface InventoryMovement {
  inventory_item_id: string;
  quantity: number;
  movement_type: "sale" | "purchase" | "adjustment" | "return";
  unit_cost?: number;
  notes?: string;
}

export class InventoryService {
  static async updateInventory(
    movements: InventoryMovement[],
    transaction_id: string,
    trx: Knex.Transaction
  ): Promise<void> {
    for (const movement of movements) {
      const item = await trx("inventory_items")
        .where("id", movement.inventory_item_id)
        .forUpdate()
        .first();

      if (!item) {
        throw new Error(`Inventory item ${movement.inventory_item_id} not found`);
      }

      let quantityChange = movement.quantity;
      if (movement.movement_type === "sale" || movement.movement_type === "adjustment") {
        quantityChange = -Math.abs(movement.quantity);
      }

      const newQuantity = item.quantity + quantityChange;

      if (newQuantity < 0) {
        throw new Error(
          `Insufficient stock for item ${item.name}. Available: ${item.quantity}, Requested: ${Math.abs(quantityChange)}`
        );
      }

      await trx("inventory_items")
        .where("id", movement.inventory_item_id)
        .update({
          quantity: newQuantity,
          updated_at: new Date(),
        });

      await trx("inventory_movements").insert({
        inventory_item_id: movement.inventory_item_id,
        transaction_id,
        movement_type: movement.movement_type,
        quantity: quantityChange,
        quantity_before: item.quantity,
        quantity_after: newQuantity,
        unit_cost: movement.unit_cost || item.cost_price,
        notes: movement.notes,
        movement_date: new Date(),
      });
    }
  }

  static async getLowStockItems(threshold?: number): Promise<any[]> {
    return db("inventory_items")
      .where("is_active", true)
      .whereRaw("quantity <= COALESCE(reorder_level, ?)", [threshold || 10])
      .select("*");
  }
}
