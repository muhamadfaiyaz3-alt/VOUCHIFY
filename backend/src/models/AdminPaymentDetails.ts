import { Schema, model, Document } from "mongoose";

export interface IAdminPaymentDetails extends Document {
    adminName: string;
    phoneNumber: string;
    upiId?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    address?: string;
    instructions: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AdminPaymentDetailsSchema = new Schema<IAdminPaymentDetails>(
    {
        adminName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        upiId: String,
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        address: String,
        instructions: {
            type: String,
            default: "Please pay the amount in cash and click 'I Have Paid' button below."
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const AdminPaymentDetailsModel = model<IAdminPaymentDetails>(
    "AdminPaymentDetails",
    AdminPaymentDetailsSchema
);
