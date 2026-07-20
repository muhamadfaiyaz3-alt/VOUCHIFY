import { Schema, model, Document, Types } from "mongoose";

export interface IRedemption extends Document {
  voucher: Types.ObjectId;
  user: Types.ObjectId;
  code: string;
  status: "reserved" | "redeemed" | "cancelled";
  redeemedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RedemptionSchema = new Schema<IRedemption>(
  {
    voucher: { type: Schema.Types.ObjectId, ref: "Voucher", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: ["reserved", "redeemed", "cancelled"],
      default: "reserved",
    },
    redeemedAt: Date,
  },
  { timestamps: true }
);

RedemptionSchema.index({ voucher: 1, user: 1 });

export const RedemptionModel = model<IRedemption>("Redemption", RedemptionSchema);

