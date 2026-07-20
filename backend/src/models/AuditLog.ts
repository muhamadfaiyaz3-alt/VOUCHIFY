import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
    actor: Types.ObjectId | "SYSTEM";
    target?: Types.ObjectId; // User or Voucher or Transaction ID
    action: string; // e.g., "USER_SUSPENDED", "VOUCHER_DEACTIVATED", "ACCOUNT_REACTIVATED"
    details: string;
    metadata: any;
    ipAddress?: string;
    timestamp: Date;
    isRead: boolean;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        actor: { type: Schema.Types.Mixed, required: true }, // Can be UserID or "SYSTEM"
        target: { type: Schema.Types.ObjectId },
        action: { type: String, required: true, index: true },
        details: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },
        ipAddress: String,
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false, index: true },
    },
    { timestamps: false } // We use our own timestamp
);

AuditLogSchema.index({ timestamp: -1 });

export const AuditLogModel = model<IAuditLog>("AuditLog", AuditLogSchema);
