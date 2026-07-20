import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
    platformFeePercent: number;
    companySharePercent: number;
    buyerDiscountPercent: number;
}

const SettingsSchema: Schema = new Schema({
    platformFeePercent: { type: Number, default: 5 },
    companySharePercent: { type: Number, default: 2 },
    buyerDiscountPercent: { type: Number, default: 0.10 }, // 10% default
}, { timestamps: true });

export const SettingsModel = mongoose.model<ISettings>("Settings", SettingsSchema);
