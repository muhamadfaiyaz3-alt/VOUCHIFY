import { Schema, model, Document, Types } from "mongoose";

export type VoucherStatus = "draft" | "published" | "expired" | "sold_out" | "pending" | "rejected";

export interface IVoucher extends Document {
  owner: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  tags: string[];

  // Pricing & Fees
  originalPrice: number; // Face value
  listedPrice: number; // Price buyer pays
  discountPercent: number; // e.g. 0.50 for 50%
  sellerPayout: number; // Amount seller gets
  platformFeePercent: number; // e.g. 0.15
  companySharePercent: number; // e.g. 0.05

  quantity: number;
  limitPerUser: number;
  expiryDate: Date;
  terms: string;
  instructions: string;

  // Delivery
  scratchCode?: string; // Encrypted
  scratchCodeHash?: string; // Deterministic hash
  imageUrl?: string;
  userVerificationImage?: string;

  // Status
  status: VoucherStatus;
  isApproved: boolean;
  isActive: boolean;
  isLocked: boolean; // For race condition prevention during auth/redemption

  stats: {
    saved: number;
    redeemed: number;
    views: number;
  };
  mediaUrls: string[];

  // Verification
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;

  // Fraud & Risk
  fraudRiskScore: number;
  fraudRiskLevel: "Low" | "Medium" | "High" | "Critical";
  attempts: number;

  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },

    originalPrice: { type: Number, required: true, min: 0 },
    listedPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0 },
    sellerPayout: { type: Number, required: true, min: 0 },
    platformFeePercent: { type: Number, default: 0.15 },
    companySharePercent: { type: Number, default: 0.05 },

    quantity: { type: Number, required: true, min: 0 },
    limitPerUser: { type: Number, default: 1, min: 1 },
    expiryDate: { type: Date, required: true },
    terms: { type: String, default: "" },
    instructions: { type: String, default: "" },

    scratchCode: { type: String, select: false }, // Encrypted, hidden by default
    scratchCodeHash: { type: String, select: false, index: true },
    imageUrl: String,
    userVerificationImage: String,

    status: {
      type: String,
      enum: ["draft", "published", "expired", "sold_out", "pending", "rejected"],
      default: "draft",
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING"
    },
    rejectionReason: String,
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isApproved: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },

    // Fraud & Risk
    fraudRiskScore: { type: Number, default: 0 },
    fraudRiskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    attempts: { type: Number, default: 0 },

    stats: {
      saved: { type: Number, default: 0 },
      redeemed: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    mediaUrls: { type: [String], default: [] },
  },
  { timestamps: true }
);

VoucherSchema.index({ title: "text", description: "text", tags: "text" });

export const VoucherModel = model<IVoucher>("Voucher", VoucherSchema);

