import { Schema, model, Document } from "mongoose";

export type UserRole = "user" | "business" | "admin";

export interface IUser extends Document {
  email: string;
  password?: string; // Hashed password
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  // OTP & Recovery
  otp?: string;
  otpExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  role: UserRole;
  walletBalance: number;
  businessName?: string;
  businessWebsite?: string;
  bio?: string;
  referralCode: string;
  referredBy?: string; // User ID
  savedVouchers: string[]; // Voucher IDs
  settings: {
    marketingEmails: boolean;
    notifications: boolean;
    notificationSound: boolean;
  };

  payoutSettings?: {
    method: "upi" | "bank" | "phone";
    upiId?: string;
    phone?: string;
    bankAccountIdx?: string;
    bankName?: string;
    bankIfsc?: string;
    bankHolderName?: string;
  };

  // Profile Details
  address?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dob?: Date;
  occupation?: "Student" | "Employee" | "Business" | "Other";
  identityProofUrl?: string; // URL for Aadhar/Pan
  description?: string; // Longer description
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  identityVerificationStatus: "None" | "Pending" | "Verified" | "Rejected";

  // Fraud & Risk
  fraudRiskScore: number;
  fraudRiskLevel: "Low" | "Medium" | "High" | "Critical";
  trustScore: number; // 0-100, higher is better
  isSuspended: boolean;
  isPermanentlyBanned: boolean;
  suspensionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, select: false }, // Don't return password by default
    displayName: String,
    avatarUrl: String,
    phone: String,

    // OTP & Recovery
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    role: {
      type: String,
      enum: ["user", "business", "admin"],
      default: "user",
    },
    walletBalance: { type: Number, default: 0, min: 0 },
    businessName: String,
    businessWebsite: String,
    bio: String,
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    savedVouchers: [{ type: Schema.Types.ObjectId, ref: "Voucher" }],
    settings: {
      marketingEmails: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
      notificationSound: { type: Boolean, default: true },
    },

    // Profile Details
    address: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"]
    },
    dob: Date,
    occupation: {
      type: String,
      enum: ["Student", "Employee", "Business", "Other"]
    },
    identityProofUrl: String,
    description: String,
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    identityVerificationStatus: {
      type: String,
      enum: ["None", "Pending", "Verified", "Rejected"],
      default: "None"
    },

    // Payout / Settlement Details
    payoutSettings: {
      method: { type: String, enum: ["upi", "bank", "phone"], default: "upi" },
      upiId: String,
      phone: String,
      bankAccountIdx: String, // Keeping it generic
      bankName: String,
      bankIfsc: String,
      bankHolderName: String,
    },

    // Fraud & Risk
    fraudRiskScore: { type: Number, default: 0 },
    fraudRiskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    trustScore: { type: Number, default: 100 },
    isSuspended: { type: Boolean, default: false },
    isPermanentlyBanned: { type: Boolean, default: false },
    suspensionReason: String,
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);

