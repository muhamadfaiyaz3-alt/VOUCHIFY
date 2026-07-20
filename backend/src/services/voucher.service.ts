import { FilterQuery, Types } from "mongoose";
import { IVoucher, VoucherModel } from "../models/Voucher";
import { encrypt, hash } from "../utils/crypto.utils";
import Env from "../config/env";
import { VoucherValidationService } from "./voucherValidation.service";
import { FraudDetectionService } from "./fraudDetection.service";

export const createVoucher = async (
  payload: Partial<IVoucher> & { owner: string; scratchCode?: string }
) => {

  if (!payload.scratchCode) {
    throw new Error("Scratch code is required for voucher listing.");
  }

  const code = payload.scratchCode.trim();

  // 1. Strict Dummy/Placeholder Check
  const isDummy = VoucherValidationService.isDummyCode(code);
  if (isDummy) {
    throw new Error("🚨 SECURITY ALERT: This voucher code appears to be a dummy or invalid placeholder. Please provide a genuine code.");
  }

  // 2. Strict Duplicate Check (Active & Archived)
  const duplicateCheck = await VoucherValidationService.checkDuplicates(code);
  if (duplicateCheck.isDuplicate) {
    const msg = duplicateCheck.location === "ACTIVE"
      ? "❌ This voucher code is already listed on Vouchify."
      : "❌ This voucher code has been used or archived previously and cannot be re-listed.";
    throw new Error(msg);
  }

  // 3. Strict Format Check
  const isValidFormat = VoucherValidationService.validateFormat(payload.category || "default", code);
  if (!isValidFormat) {
    throw new Error(`❌ Invalid code format for category "${payload.category}". Please ensure the code matches the brand's standard format.`);
  }

  // Calculate pricing
  const op = payload.originalPrice || 0;
  const lp = payload.listedPrice || 0;
  const discountPercent = op > 0 ? (op - lp) / op : 0;

  // Use provided values or defaults from Env
  const platformFeePercent = payload.platformFeePercent ?? Env.platformFeePercent;
  const companySharePercent = payload.companySharePercent ?? Env.companySharePercent;

  // Calculate seller payout: listedPrice - platformFee
  const sellerPayout = lp * (1 - (platformFeePercent || 0));

  const voucherData: any = {
    ...payload,
    scratchCode: encrypt(code),
    scratchCodeHash: hash(code),
    discountPercent,
    sellerPayout,
    platformFeePercent,
    companySharePercent,
    // Enforce Verification for new listings
    verificationStatus: (payload.status === "published") ? "PENDING" : "PENDING", // Always pending initially if not verified
    status: (payload.status === "published") ? "pending" : payload.status || "draft",
    isApproved: false,
  };

  const voucher = await VoucherModel.create(voucherData);

  // Trigger indirect fraud analysis (User background check, etc.)
  await VoucherValidationService.verifyAndAnalyze(voucher._id.toString());

  return voucher;
};


export const listVouchers = async (
  filters: FilterQuery<IVoucher> = {},
  limit = 20
) => {
  // Only show published and active vouchers to public
  const query = {
    ...filters,
    status: "published",
    isActive: true,
  };

  return VoucherModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("owner", "displayName avatarUrl");
};

export const getVoucherById = async (id: string) => {
  return VoucherModel.findById(id).populate("owner", "displayName avatarUrl");
};

export const updateVoucher = async (
  id: string,
  payload: Partial<IVoucher> & { scratchCode?: string }
) => {
  const data: any = { ...payload };

  if (payload.scratchCode) {
    const code = payload.scratchCode.trim();

    // Strict Security Checks on Update
    const isDummy = VoucherValidationService.isDummyCode(code);
    if (isDummy) throw new Error("🚨 SECURITY ALERT: This voucher code appears to be a dummy placeholder.");

    const duplicateCheck = await VoucherValidationService.checkDuplicates(code, id);
    if (duplicateCheck.isDuplicate) throw new Error("❌ This voucher code is already listed or used.");

    const isValidFormat = VoucherValidationService.validateFormat(payload.category || "default", code);
    if (!isValidFormat) throw new Error("❌ Invalid code format.");

    data.scratchCode = encrypt(code);
    data.scratchCodeHash = hash(code);
  }

  // Recalculate pricing if prices change
  if (payload.originalPrice !== undefined || payload.listedPrice !== undefined) {
    const original = await VoucherModel.findById(id);
    const op = payload.originalPrice ?? original?.originalPrice ?? 0;
    const lp = payload.listedPrice ?? original?.listedPrice ?? 0;
    data.discountPercent = op > 0 ? (op - lp) / op : 0;

    const pfp = payload.platformFeePercent ?? original?.platformFeePercent ?? Env.platformFeePercent;
    data.sellerPayout = lp * (1 - (pfp || 0));
  }

  return VoucherModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteVoucher = async (id: string) => {
  return VoucherModel.findByIdAndDelete(id);
};

export const updateVoucherStatus = async (id: string, status: string) => {
  return VoucherModel.findByIdAndUpdate(id, { status }, { new: true });
};

export const approveVoucher = async (id: string, isApproved: boolean) => {
  return VoucherModel.findByIdAndUpdate(id, { isApproved }, { new: true });
};


export const listVouchersWithTransactionStatus = async (ownerId: string) => {
  return VoucherModel.aggregate([
    { $match: { owner: new Types.ObjectId(ownerId) } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "transactions",
        let: { voucherId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$voucher", "$$voucherId"] },
                  { $in: ["$status", ["paid", "completed", "pending_admin_confirmation"]] }
                ]
              }
            }
          },
          { $limit: 1 }
        ],
        as: "transaction"
      }
    },
    { $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "transaction.buyer",
        foreignField: "_id",
        as: "buyer"
      }
    },
    { $unwind: { path: "$buyer", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        description: 1,
        status: 1,
        expiryDate: 1,
        listedPrice: 1,
        sellerPayout: 1,
        imageUrl: 1, // Include image for UI
        createdAt: 1,
        "buyer.displayName": 1,
        "buyer.email": 1,
        "transaction.status": 1,
        "transaction.createdAt": 1
      }
    }
  ]);
};
