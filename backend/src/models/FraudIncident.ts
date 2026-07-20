import { Schema, model, Document, Types } from "mongoose";

export interface IFraudIncident extends Document {
    user: Types.ObjectId;
    voucher?: Types.ObjectId;
    type: "DUPLICATE_CODE" | "ABNORMAL_DISCOUNT" | "SUSPICIOUS_UPLOAD" | "FAILED_AUTH_LIMIT" | "OTHER";
    severity: "Low" | "Medium" | "High" | "Critical";
    evidence: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}

const FraudIncidentSchema = new Schema<IFraudIncident>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        voucher: { type: Schema.Types.ObjectId, ref: "Voucher" },
        type: {
            type: String,
            enum: ["DUPLICATE_CODE", "ABNORMAL_DISCOUNT", "SUSPICIOUS_UPLOAD", "FAILED_AUTH_LIMIT", "OTHER"],
            required: true
        },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            required: true
        },
        evidence: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: true }
);

export const FraudIncidentModel = model<IFraudIncident>("FraudIncident", FraudIncidentSchema);
