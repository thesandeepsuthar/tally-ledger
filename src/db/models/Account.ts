import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  description?: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    code: { type: String, required: true, unique: true, maxlength: 50 },
    name: { type: String, required: true, maxlength: 255 },
    type: {
      type: String,
      enum: ["asset", "liability", "equity", "revenue", "expense"],
      required: true,
    },
    description: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AccountSchema.index({ code: 1 });
AccountSchema.index({ type: 1 });

export const Account = mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);
