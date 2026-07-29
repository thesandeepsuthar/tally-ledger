import { ClientSession, Types } from "mongoose";
import { InventoryItem } from "@/db/models/InventoryItem";
import { InventoryMovement } from "@/db/models/InventoryMovement";

export interface InventoryMovementInput {
  inventory_item_id: string;
  quantity: number;
  movement_type: "sale" | "purchase" | "adjustment" | "return";
  unit_cost?: number;
  notes?: string;
}

export class InventoryService {
  static async updateInventory(
    movements: InventoryMovementInput[],
    transaction_id: string,
    session?: ClientSession
  ): Promise<void> {
    const sessionOption = session ? { session } : {};
    const txId = new Types.ObjectId(transaction_id);

    for (const movement of movements) {
      const item = await InventoryItem.findById(movement.inventory_item_id, null, sessionOption);

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

      await InventoryItem.updateOne(
        { _id: item._id },
        { $set: { quantity: newQuantity } },
        sessionOption
      );

      await InventoryMovement.create(
        [{
          inventory_item_id: item._id,
          transaction_id: txId,
          movement_type: movement.movement_type,
          quantity: quantityChange,
          quantity_before: item.quantity,
          quantity_after: newQuantity,
          unit_cost: movement.unit_cost || item.cost_price,
          notes: movement.notes,
          movement_date: new Date(),
        }],
        sessionOption
      );
    }
  }

  static async getLowStockItems(threshold?: number): Promise<any[]> {
    return InventoryItem.aggregate([
      { $match: { is_active: true } },
      {
        $addFields: {
          effective_reorder_level: { $ifNull: ["$reorder_level", threshold ?? 10] },
        },
      },
      { $match: { $expr: { $lte: ["$quantity", "$effective_reorder_level"] } } },
    ]);
  }
}
