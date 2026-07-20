
import { Schema, model, Document, Types } from "mongoose";

export interface IVoucherArchive extends Document {
    voucherId: Types.ObjectId; // Original ID reference
    owner: Types.ObjectId;
    title: string;
    originalPrice: number;
    listedPrice: number;
    sellerPayout: number;
    quantity: number;
    expiryDate: Date;
    archivedAt: Date;
    reason: "expired" | "used" | "manual";
    history: any; // Entire original voucher object snapshot
}

const VoucherArchiveSchema = new Schema<IVoucherArchive>(
    {
        voucherId: { type: Schema.Types.ObjectId, required: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        originalPrice: Number,
        listedPrice: Number,
        sellerPayout: Number,
        quantity: Number,
        expiryDate: Date,
        archivedAt: { type: Date, default: Date.now },
        reason: { type: String, enum: ["expired", "used", "manual"], required: true },
        history: { type: Schema.Types.Mixed }, // Store full snapshot
    },
    { timestamps: true }
);

export const VoucherArchiveModel = model<IVoucherArchive>("VoucherArchive", VoucherArchiveSchema);
