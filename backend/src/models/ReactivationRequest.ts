import { Schema, model, Document, Types } from "mongoose";

export type ReactivationStatus = "PENDING" | "APPROVED" | "REJECTED" | "REQUIRES_PENALTY";

export interface IReactivationRequest extends Document {
    user: Types.ObjectId;
    explanation: string;
    proofUrls: string[];
    isPenaltyPaid: boolean;
    penaltyAmount?: number;
    adminNote?: string;
    status: ReactivationStatus;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReactivationRequestSchema = new Schema<IReactivationRequest>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        explanation: { type: String, required: true },
        proofUrls: { type: [String], default: [] },
        isPenaltyPaid: { type: Boolean, default: false },
        penaltyAmount: { type: Number, default: 0 },
        adminNote: String,
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "REQUIRES_PENALTY"],
            default: "PENDING"
        },
        reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reviewedAt: Date,
    },
    { timestamps: true }
);

export const ReactivationRequestModel = model<IReactivationRequest>("ReactivationRequest", ReactivationRequestSchema);
