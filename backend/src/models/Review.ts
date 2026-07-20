import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  voucher?: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  voucherBrand?: string;
  transactionType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    voucher: { type: Schema.Types.ObjectId, ref: "Voucher", required: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    voucherBrand: { type: String, required: false },
    transactionType: { type: String, required: false },
  },
  { timestamps: true }
);

// Allow one review per user per voucher, but separate logic for general reviews?
// For general reviews (voucher is null), maybe just index on user?
// Or just keep the index as is, but it might fail if voucher is null.
// MongoDB sparse index or partial filter could work.
ReviewSchema.index({ voucher: 1, user: 1 }, { unique: true, sparse: true });

export const ReviewModel = model<IReview>("Review", ReviewSchema);

