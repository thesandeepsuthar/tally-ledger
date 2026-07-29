import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILedgerEntry extends Document {
  transaction_id: Types.ObjectId;
  account_id: Types.ObjectId;
  entry_type: "debit" | "credit";
  amount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    entry_type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

LedgerEntrySchema.index({ transaction_id: 1 });
LedgerEntrySchema.index({ account_id: 1 });
LedgerEntrySchema.index({ account_id: 1, createdAt: -1 });

export const LedgerEntry =
  mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>("LedgerEntry", LedgerEntrySchema);
