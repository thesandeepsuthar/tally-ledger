import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  idempotency_key: string;
  transaction_number?: string;
  transaction_type: "sale" | "purchase" | "payment" | "receipt" | "journal";
  description?: string;
  reference_number?: string;
  transaction_date: Date;
  status: "pending" | "completed" | "cancelled";
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    idempotency_key: { type: String, required: true, unique: true, maxlength: 255 },
    transaction_number: { type: String, unique: true, sparse: true, maxlength: 50 },
    transaction_type: {
      type: String,
      enum: ["sale", "purchase", "payment", "receipt", "journal"],
      required: true,
    },
    description: { type: String },
    reference_number: { type: String, maxlength: 100 },
    transaction_date: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

TransactionSchema.index({ idempotency_key: 1 });
TransactionSchema.index({ transaction_date: -1 });

export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
