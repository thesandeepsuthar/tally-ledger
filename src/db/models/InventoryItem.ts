import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInventoryItem extends Document {
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  cost_price: number;
  quantity: number;
  reorder_level: number;
  unit_of_measure: string;
  inventory_account_id?: Types.ObjectId;
  cogs_account_id?: Types.ObjectId;
  revenue_account_id?: Types.ObjectId;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    sku: { type: String, required: true, unique: true, maxlength: 100 },
    name: { type: String, required: true, maxlength: 255 },
    description: { type: String },
    unit_price: { type: Number, required: true, min: 0 },
    cost_price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reorder_level: { type: Number, default: 10 },
    unit_of_measure: { type: String, default: "unit", maxlength: 50 },
    inventory_account_id: { type: Schema.Types.ObjectId, ref: "Account" },
    cogs_account_id: { type: Schema.Types.ObjectId, ref: "Account" },
    revenue_account_id: { type: Schema.Types.ObjectId, ref: "Account" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ sku: 1 });

export const InventoryItem =
  mongoose.models.InventoryItem ||
  mongoose.model<IInventoryItem>("InventoryItem", InventoryItemSchema);
