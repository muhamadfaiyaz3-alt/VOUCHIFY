import { Schema, model, Document, Types } from "mongoose";

export type TransactionType = "credit" | "debit";
export type TransactionSource = "manual" | "razorpay" | "voucher-purchase" | "refund";

export interface IWalletTransaction extends Document {
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  description: string;
  reference?: string;
  voucher?: Types.ObjectId;
  createdAt: Date;
}

export interface IWallet extends Document {
  user: Types.ObjectId;
  balance: number;
  currency: string;
  transactions: Types.DocumentArray<IWalletTransaction>;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: { type: String, enum: ["credit", "debit"], required: true },
    source: {
      type: String,
      enum: ["manual", "razorpay", "voucher-purchase", "refund"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    reference: String,
    voucher: { type: Schema.Types.ObjectId, ref: "Voucher" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const WalletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    transactions: { type: [WalletTransactionSchema], default: [] },
  },
  { timestamps: true }
);

export const WalletModel = model<IWallet>("Wallet", WalletSchema);

