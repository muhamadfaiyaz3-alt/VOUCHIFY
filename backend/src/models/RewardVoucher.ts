import { Schema, model, Document, Types } from "mongoose";

export interface IRewardVoucher extends Document {
    title: string;
    brand: string;
    code: string; // The specific voucher code (e.g., AMAZON100)
    value: number; // Value in Rupee
    expiryDate?: Date;
    assignedTo?: Types.ObjectId; // User ID who received it
    assignedAt?: Date;
    status: "AVAILABLE" | "ASSIGNED" | "REDEEMED";
    createdBy?: Types.ObjectId; // Admin who created it
    createdAt: Date;
    updatedAt: Date;
}

const RewardVoucherSchema = new Schema<IRewardVoucher>(
    {
        title: { type: String, required: true },
        brand: { type: String, required: true },
        code: { type: String, required: true, unique: true }, // Simple unique check
        value: { type: Number, required: true },
        expiryDate: Date,
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
        assignedAt: Date,
        status: {
            type: String,
            enum: ["AVAILABLE", "ASSIGNED", "REDEEMED"],
            default: "AVAILABLE"
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" }
    },
    {
        timestamps: true
    }
);

export const RewardVoucherModel = model<IRewardVoucher>("RewardVoucher", RewardVoucherSchema);
