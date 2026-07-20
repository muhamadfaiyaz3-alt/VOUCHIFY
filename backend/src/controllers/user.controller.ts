import { Request, Response } from "express";
import mongoose from "mongoose";
import { updateProfile, listUsers } from "../services/user.service";
import { UserModel, IUser } from "../models/User";
import { StatusCodes } from "http-status-codes";

export const getCurrentProfile = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  // Wallet removed
  return res.json({ user: req.currentUser });
};

export const updateCurrentProfile = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  try {
    const existingUser = await UserModel.findById(req.currentUser._id);
    if (!existingUser) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

    const updates = req.body;
    let proofChanged = false;

    // Track all changes
    const changes: any = {};
    const displayChanges: string[] = [];

    // List of fields to monitor
    const monitoredFields = ['displayName', 'phone', 'address', 'upiId', 'identityProofUrl'];

    monitoredFields.forEach(field => {
      if (updates[field] !== undefined && updates[field] !== existingUser[field as keyof typeof existingUser]) {
        if (field === 'identityProofUrl') {
          proofChanged = true;
        }
        changes[field] = {
          old: existingUser[field as keyof typeof existingUser] || 'N/A',
          new: updates[field]
        };
        displayChanges.push(field);
      }
    });

    // Apply updates
    const updated = await updateProfile(req.currentUser._id.toString(), req.body);

    // Log for Admin Notification
    if (displayChanges.length > 0) {
      const { AuditLogModel } = await import("../models/AuditLog");

      // Logic: If proof changed, it's a high priority verification event.
      // If other details changed, it's a "User Details Update" event.
      // We can create one log for all, or separate them. 
      // User request: "any single details... notification to admin"

      if (proofChanged) {
        // Reset verification status
        await UserModel.findByIdAndUpdate(req.currentUser._id, { identityVerificationStatus: "Pending" });

        await AuditLogModel.create({
          actor: req.currentUser._id,
          target: req.currentUser._id,
          action: "PROFILE_UPDATE_PROOF", // Special action for proof
          details: `User updated identity proof.${displayChanges.length > 1 ? ' Also updated: ' + displayChanges.filter(f => f !== 'identityProofUrl').join(', ') : ''}`,
          metadata: { changes, type: 'proof_update', oldProof: existingUser.identityProofUrl, newProof: updates.identityProofUrl }
        });
      } else {
        // Just details updated
        await AuditLogModel.create({
          actor: req.currentUser._id,
          target: req.currentUser._id,
          action: "PROFILE_UPDATE_DETAILS",
          details: `User updated profile details: ${displayChanges.join(', ')}`,
          metadata: { changes, type: 'field_change' }
        });
      }
    }

    return res.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update profile", error });
  }
};

export const toggleSaveVoucher = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const { voucherId } = req.body;
  if (!voucherId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Voucher ID is required" });
  }

  const user = req.currentUser;
  const isSaved = user.savedVouchers.includes(voucherId);

  if (isSaved) {
    user.savedVouchers = user.savedVouchers.filter((id) => id.toString() !== voucherId);
  } else {
    user.savedVouchers.push(voucherId);
  }

  await user.save();

  return res.json({
    message: isSaved ? "Voucher removed from saved" : "Voucher saved successfully",
    savedVouchers: user.savedVouchers,
  });
};


export const getUserDashboardStats = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized" });
  }

  const userId = req.currentUser._id;

  // 1. Earnings (as seller)
  // We look for transactions where I am the seller AND status is 'completed' or 'paid'
  // and we sum up 'sellerPayout'
  // Note: 'paid' might mean paid by buyer but not yet released to seller? 
  // For 'earnings', usually we mean 'realized earnings'. Let's assume 'completed' is safest.
  // Actually, let's include 'paid' too if that implies money is held for me.
  const earningsAgg = await mongoose.model("Transaction").aggregate([
    {
      $match: {
        seller: userId,
        status: { $in: ["paid", "completed"] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$sellerPayout" },
      },
    },
  ]);
  const totalEarnings = earningsAgg[0]?.total || 0;

  // 2. Savings (as buyer)
  // We need to join with Voucher to get original price, or if originalPrice is not in Transaction, we rely on what we have.
  // Transaction doesn't seem to store 'originalPrice'. It stores 'amountPaid'.
  // We might need to lookup the Voucher to get 'originalPrice'.
  // However, Voucher might calculate 'listedPrice' vs 'originalPrice'.
  // Let's do a $lookup.
  const savingsAgg = await mongoose.model("Transaction").aggregate([
    {
      $match: {
        buyer: userId,
        status: { $in: ["paid", "completed"] },
      },
    },
    {
      $lookup: {
        from: "vouchers",
        localField: "voucher",
        foreignField: "_id",
        as: "voucherData",
      },
    },
    { $unwind: "$voucherData" },
    {
      $project: {
        savings: {
          $subtract: ["$voucherData.originalPrice", "$amountPaid"]
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$savings" },
      },
    },
  ]);
  const totalSavings = savingsAgg[0]?.total || 0;

  // 3. Counts
  const purchasedCount = await mongoose.model("Transaction").countDocuments({
    buyer: userId,
    status: { $in: ["paid", "completed"] },
  });

  const soldCount = await mongoose.model("Transaction").countDocuments({
    seller: userId,
    status: { $in: ["paid", "completed"] },
  });

  const activeListings = await mongoose.model("Voucher").countDocuments({
    owner: userId,
    status: "published",
    quantity: { $gt: 0 },
  });

  return res.json({
    earnings: totalEarnings,
    savings: totalSavings,
    purchasedCount,
    soldCount,
    activeListings,
  });
};
// ... (existing exports)

export const verifyContact = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized" });
  }

  const { type } = req.body; // 'email' | 'phone'
  if (!type || !['email', 'phone'].includes(type)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid verification type" });
  }

  const update: Partial<IUser> = {};
  if (type === 'email') update.isEmailVerified = true;
  if (type === 'phone') update.isPhoneVerified = true;

  const user = await UserModel.findByIdAndUpdate(req.currentUser._id, update, { new: true });
  return res.json(user);
};

// Admin: Get All Users
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await listUsers({});
  return res.json(users);
};

// Admin: Update Identity Status
export const updateIdentityStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status, remarks } = req.body;

  if (!['Pending', 'Verified', 'Rejected', 'None'].includes(status)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid status" });
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      identityVerificationStatus: status,
      $push: {
        adminNotes: {
          note: `Identity Status changed to ${status}. Remarks: ${remarks || 'None'}`,
          date: new Date(),
          adminId: req.currentUser?._id
        }
      }
    },
    { new: true }
  );

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  // Notify User
  const { NotificationModel } = await import("../models/Notification");
  await NotificationModel.create({
    user: userId,
    title: "Identity Verification Update",
    message: `Your identity verification status has been updated to: ${status}. ${remarks ? 'Remarks: ' + remarks : ''}`,
    type: status === 'Verified' ? "success" : status === 'Rejected' ? "error" : "info",
    link: "/profile?tab=settings"
  });

  return res.json(user);
};

// Admin: Toggle Block Status
export const toggleBlockStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { suspended, reason } = req.body; // true = suspend, false = unsuspend

  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  user.isSuspended = suspended;
  if (suspended) {
    user.suspensionReason = reason || "Violation of Terms";
  } else {
    user.suspensionReason = undefined;
  }

  await user.save();

  // Audit Log
  const { AuditLogModel } = await import("../models/AuditLog");
  await AuditLogModel.create({
    actor: req.currentUser?._id,
    target: userId,
    action: suspended ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
    details: `User was ${suspended ? 'suspended' : 'unsuspended'} by admin. Reason: ${reason || 'N/A'}`,
    ipAddress: req.ip
  });

  const { NotificationModel } = await import("../models/Notification");
  await NotificationModel.create({
    user: userId,
    title: suspended ? "Account Suspended" : "Account Reactivated",
    message: suspended
      ? `Your account has been suspended. Reason: ${reason}`
      : "Your account has been reactivated. You can now access all features.",
    type: suspended ? "error" : "success",
    link: suspended ? "/reactivation-request" : "/"
  });

  return res.json(user);
};
