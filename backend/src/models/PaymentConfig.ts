import { Schema, model, Document } from 'mongoose';

export interface IPaymentConfig extends Document {
    buyerDiscountPercent: number; // e.g., 0.10 for 10%
    platformFeePercent: number;   // e.g., 0.15 for 15%
    companySharePercent: number;  // e.g., 0.05 for 5%
    updatedBy?: Schema.Types.ObjectId;
}

const PaymentConfigSchema = new Schema<IPaymentConfig>(
    {
        buyerDiscountPercent: { type: Number, required: true, default: 0.10 },
        platformFeePercent: { type: Number, required: true, default: 0.15 },
        companySharePercent: { type: Number, required: true, default: 0.05 },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Ensure only one config document exists usually, or fetch the latest
export const PaymentConfigModel = model<IPaymentConfig>('PaymentConfig', PaymentConfigSchema);
