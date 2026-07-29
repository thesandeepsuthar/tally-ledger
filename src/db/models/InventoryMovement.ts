import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInventoryMovement extends Document {
  inventory_item_id: Types.ObjectId;
  transaction_id?: Types.ObjectId;
  movement_type: "sale" | "purchase" | "adjustment" | "return";
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  unit_cost: number;
  notes?: string;
  movement_date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    inventory_item_id: {
      type: Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    movement_type: {
      type: String,
      enum: ["sale", "purchase", "adjustment", "return"],
      required: true,
    },
    quantity: { type: Number, required: true },
    quantity_before: { type: Number, required: true },
    quantity_after: { type: Number, required: true },
    unit_cost: { type: Number, required: true },
    notes: { type: String },
    movement_date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

InventoryMovementSchema.index({ inventory_item_id: 1 });
InventoryMovementSchema.index({ transaction_id: 1 });

export const InventoryMovement =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>("InventoryMovement", InventoryMovementSchema);
