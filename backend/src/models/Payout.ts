import { Schema, model, Document, Types } from "mongoose";

export type PayoutStatus = "pending" | "paid" | "rejected";

export interface IPayout extends Document {
    seller: Types.ObjectId;
    transaction: Types.ObjectId; // Link to the sale transaction
    amount: number;
    status: PayoutStatus;
    paymentReference?: string; // Transaction ID of the payout transfer
    adminNote?: string;
    adminProofUrl?: string; // Image URL of the payment proof
    processedAt?: Date;
    createdAt: Date;
    queries: {
        sender: "admin" | "user";
        message: string;
        createdAt: Date;
    }[];
}

const PayoutSchema = new Schema<IPayout>(
    {
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
        transaction: { type: Schema.Types.ObjectId, ref: "Transaction", required: true },
        amount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["pending", "paid", "rejected"],
            default: "pending",
        },
        paymentReference: String,
        adminNote: String,
        adminProofUrl: String,
        processedAt: Date,
        queries: [{
            sender: { type: String, enum: ["admin", "user"], required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
);

PayoutSchema.index({ seller: 1, createdAt: -1 });
PayoutSchema.index({ status: 1 });

export const PayoutModel = model<IPayout>("Payout", PayoutSchema);
