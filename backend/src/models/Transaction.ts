import { Schema, model, Document, Types } from "mongoose";

export type TransactionStatus = "pending" | "pending_admin_confirmation" | "paid" | "completed" | "refunded" | "failed";
export type PaymentMethod = "cash" | "stripe" | "wallet";

export interface ITransaction extends Document {
    voucher: Types.ObjectId;
    buyer: Types.ObjectId;
    seller: Types.ObjectId;

    amountPaid: number;
    platformFee: number;
    sellerPayout: number;

    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    paymentReference?: string; // Stripe session ID or manual ref
    paymentProof?: string; // Base64 string of payment screenshot

    adminNote?: string;
    scratchCodeRevealed: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        voucher: { type: Schema.Types.ObjectId, ref: "Voucher", required: true },
        buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },

        amountPaid: { type: Number, required: true, min: 0 },
        platformFee: { type: Number, required: true, min: 0 },
        sellerPayout: { type: Number, required: true, min: 0 },

        status: {
            type: String,
            enum: ["pending", "pending_admin_confirmation", "paid", "completed", "refunded", "failed"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "stripe", "wallet"],
            required: true,
        },

        paymentReference: String,
        paymentProof: String,

        adminNote: String,
        scratchCodeRevealed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

TransactionSchema.index({ buyer: 1, createdAt: -1 });
TransactionSchema.index({ seller: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });

export const TransactionModel = model<ITransaction>("Transaction", TransactionSchema);
