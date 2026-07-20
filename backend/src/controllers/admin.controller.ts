import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TransactionModel } from "../models/Transaction";
import { VoucherModel } from "../models/Voucher";
import { UserModel } from "../models/User";
import { AuditLogModel } from "../models/AuditLog";
import { AuditService } from "../services/audit.service";
import Env from "../config/env";
import { NotificationModel } from "../models/Notification";
import { PayoutModel } from "../models/Payout";
import { SettingsModel } from "../models/Settings";
import { AdminPaymentDetailsModel } from "../models/AdminPaymentDetails";
import { RewardVoucherModel } from "../models/RewardVoucher";
// Services
import { FraudDetectionService } from "../services/fraudDetection.service";
import { VoucherValidationService } from "../services/voucherValidation.service";


 
export const listUsersForVerificationHandler = async (req: Request, res: Response) => {
    // Fetch users who have submitted ID proof or are pending verification
    // Or just all users as requested, but prioritizing those with proofs
    const users = await UserModel.find({})
        .sort({ createdAt: -1 });

    return res.json(users);
};

export const verifyUserIdentityHandler = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body; // status: "Verified" | "Rejected"


    if (!["Verified", "Rejected"].includes(status)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid status. Use 'Verified' or 'Rejected'." });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    user.identityVerificationStatus = status;
    if (status === "Rejected") {
        // user.rejectionReason = rejectionReason; // Logic if User model supports it
    }

    await user.save();

    // Notification
    const message = status === "Verified"
        ? "Your identity verification has been approved! You can now access all features."
        : `Your identity verification was rejected. Reason: ${rejectionReason || "Details mismatch"}. Please re-upload.`;

    await NotificationModel.create({
        user: user._id,
        message,
        type: status === "Verified" ? "success" : "error",
        link: "/profile"
    });

    return res.json(user);
};

export const getAnalyticsHandler = async (req: Request, res: Response) => {
    const completedTransactions = await TransactionModel.countDocuments({ status: { $in: ["paid", "completed"] } });
    const pendingTransactions = await TransactionModel.countDocuments({ status: "pending_admin_confirmation" });

    const revenueAgg = await TransactionModel.aggregate([
        { $match: { status: { $in: ["paid", "completed"] } } },
        { $group: { _id: null, totalSales: { $sum: "$amountPaid" }, totalRevenue: { $sum: "$platformFee" } } },
    ]);
    const totalSales = revenueAgg[0]?.totalSales || 0;
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const activeVouchers = await VoucherModel.countDocuments({ isApproved: true, status: "published", isActive: true });

    return res.json({
        totalSales,
        totalRevenue,
        pendingTransactions,
        activeVouchers,
    });
};

export const listAllTransactionsHandler = async (req: Request, res: Response) => {
    const { status, paymentMethod } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const transactions = await TransactionModel.find(query)
        .populate("voucher", "title listedPrice")
        .populate("seller", "displayName email")
        .populate("buyer", "displayName email")
        .sort({ createdAt: -1 })
        .limit(100);

    return res.json(transactions);
};

export const verifyTransactionHandler = async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const { action, adminNote } = req.body; // "complete", "reject"


    const transaction = await TransactionModel.findById(transactionId).populate("voucher");
    if (!transaction) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Transaction not found" });
    }

    if (action === "complete") {
        // Admin confirms payment received - mark as completed
        transaction.status = "completed";
        transaction.scratchCodeRevealed = true; // Allow scratch code to be revealed
        console.log(`[verifyTransactionHandler] Transaction ${transaction._id} marked as completed. Scratch code revealed.`);
        if (adminNote) transaction.adminNote = adminNote;

        // Create Payout Record for Seller

        const seller = await UserModel.findById(transaction.seller);

        if (seller) {
            // Check if payout already exists (idempotency)
            const existingPayout = await PayoutModel.findOne({ transaction: transaction._id });
            if (!existingPayout) {
                await PayoutModel.create({
                    seller: seller._id,
                    transaction: transaction._id,
                    amount: transaction.sellerPayout,
                    status: "pending"
                });
            }

            // Add notification for Seller
            await NotificationModel.create({
                user: seller._id,
                message: `Your voucher "${(transaction.voucher as any)?.title}" has been sold! Payment of ₹${transaction.sellerPayout} is pending settlement.`,
                type: "success",
                link: "/profile" // Or the new Voucher Activity tab
            });
        }

        // Add notification for Buyer
        await NotificationModel.create({
            user: transaction.buyer,
            message: `Your payment for "${(transaction.voucher as any)?.title}" has been verified! Your scratch code is now available.`,
            type: "success",
            link: "/profile"
        });

    } else if (action === "reject") {
        transaction.status = "failed"; // or "cancelled"
        if (adminNote) transaction.adminNote = adminNote;

        // Restore voucher quantity
        const voucher = await VoucherModel.findById(transaction.voucher);
        if (voucher) {
            voucher.quantity += 1;
            if (voucher.status === "sold_out") voucher.status = "published";
            await voucher.save();
        }

        // Add notification for Buyer
        const rejectReason = adminNote ? ` Reason: ${adminNote}` : "";
        await NotificationModel.create({
            user: transaction.buyer,
            message: `Your purchase request for "${(transaction.voucher as any)?.title || 'Voucher'}" was rejected/cancelled by the admin.${rejectReason}`,
            type: "error",
            link: "/vouchers"
        });
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid action" });
    }

    await transaction.save();
    return res.json(transaction);
};

export const getSettingsHandler = async (req: Request, res: Response) => {

    let settings = await SettingsModel.findOne();
    if (!settings) {
        settings = await SettingsModel.create({
            platformFeePercent: 15,
            companySharePercent: 5,
            buyerDiscountPercent: 50 // 0.50 stored as percent 50?
            // In ListVoucher.jsx, logic is: buyerDiscount = original * config.buyerDiscountPercent
            // If config.buyerDiscountPercent is 0.5 for 50%.
            // AdminSettings.jsx sliders often use 0-100 integers.
            // Let's standardise on saving the DECIMAL value (0.50) if the logic expects it, OR handle conversion.
            // ListVoucher: `const buyerDiscount = originalPriceNum * config.buyerDiscountPercent;`
            // If I save 50, then discount is 50x original price (HUGE).
            // So I must save 0.50.
        });
    }
    return res.json(settings);
};

export const updateSettingsHandler = async (req: Request, res: Response) => {

    const { platformFeePercent, companySharePercent, buyerDiscountPercent } = req.body;

    let settings = await SettingsModel.findOne();
    if (!settings) {
        settings = new SettingsModel();
    }

    if (platformFeePercent !== undefined) settings.platformFeePercent = platformFeePercent;
    if (companySharePercent !== undefined) settings.companySharePercent = companySharePercent;
    if (buyerDiscountPercent !== undefined) settings.buyerDiscountPercent = buyerDiscountPercent;

    await settings.save();
    return res.json(settings);
};

// NEW: Get admin payment details for manual cash payments
export const getAdminPaymentDetailsHandler = async (req: Request, res: Response) => {


    let adminDetails = await AdminPaymentDetailsModel.findOne({ isActive: true });

    // If no admin details exist, create default ones
    if (!adminDetails) {
        adminDetails = await AdminPaymentDetailsModel.create({
            adminName: "Vouchify Admin",
            phoneNumber: "+91 9876543210",
            upiId: "admin@vouchify",
            instructions: "Please pay the amount in cash to the admin and click 'I Have Paid' button below.",
            isActive: true,
        });
    }

    return res.json(adminDetails);
};

// NEW: Update admin payment details (admin only)
export const updateAdminPaymentDetailsHandler = async (req: Request, res: Response) => {


    const { adminName, phoneNumber, upiId, bankName, accountNumber, ifscCode, accountHolderName, address, instructions } = req.body;

    let adminDetails = await AdminPaymentDetailsModel.findOne({ isActive: true });

    if (!adminDetails) {
        adminDetails = await AdminPaymentDetailsModel.create({
            adminName,
            phoneNumber,
            upiId,
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            address,
            instructions,
            isActive: true,
        });
    } else {
        adminDetails.adminName = adminName || adminDetails.adminName;
        adminDetails.phoneNumber = phoneNumber || adminDetails.phoneNumber;
        adminDetails.upiId = upiId || adminDetails.upiId;
        adminDetails.bankName = bankName || adminDetails.bankName;
        adminDetails.accountNumber = accountNumber || adminDetails.accountNumber;
        adminDetails.ifscCode = ifscCode || adminDetails.ifscCode;
        adminDetails.accountHolderName = accountHolderName || adminDetails.accountHolderName;
        adminDetails.address = address || adminDetails.address;
        adminDetails.instructions = instructions || adminDetails.instructions;

        await adminDetails.save();
    }

    return res.json(adminDetails);
};
// ... existing code

// NEW: Get vouchers pending verification
export const getPendingVouchersHandler = async (req: Request, res: Response) => {
    const vouchers = await VoucherModel.find({ verificationStatus: "PENDING" })
        .populate("owner", "displayName email")
        .sort({ createdAt: -1 });
    return res.json(vouchers);
};

// NEW: Verify or Reject a voucher
export const verifyVoucherHandler = async (req: Request, res: Response) => {
    const { voucherId } = req.params;
    const { action, rejectionReason } = req.body; // "approve", "reject"


    const voucher = await VoucherModel.findById(voucherId);
    if (!voucher) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
    }

    if (action === "approve") {
        voucher.verificationStatus = "VERIFIED";
        voucher.isApproved = true;
        voucher.status = "published"; // Make it live
        voucher.verifiedAt = new Date();
        voucher.verifiedBy = (req.currentUser as any)._id;

        await voucher.save();

        // Notify Seller
        await NotificationModel.create({
            user: voucher.owner,
            message: `Your voucher "${voucher.title}" has been verified and is now live!`,
            type: "success",
            link: `/vouchers/${voucher._id}`
        });

    } else if (action === "reject") {
        voucher.verificationStatus = "REJECTED";
        voucher.status = "rejected";
        voucher.rejectionReason = rejectionReason || "Admin rejected without reason";
        voucher.verifiedAt = new Date();
        voucher.verifiedBy = (req.currentUser as any)._id;

        await voucher.save();

        // Notify Seller
        await NotificationModel.create({
            user: voucher.owner,
            message: `Your voucher "${voucher.title}" was rejected. Reason: ${voucher.rejectionReason}`,
            type: "error",
            link: "/profile"
        });
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid action" });
    }

    return res.json(voucher);
};

// NEW: List high risk users
export const listRiskUsersHandler = async (req: Request, res: Response) => {
    const users = await UserModel.find({
        $or: [
            { fraudRiskLevel: { $in: ["High", "Critical"] } },
            { isSuspended: true }
        ]
    }).sort({ fraudRiskScore: -1 });
    return res.json(users);
};

// NEW: List high risk vouchers
export const listRiskVouchersHandler = async (req: Request, res: Response) => {
    const vouchers = await VoucherModel.find({
        fraudRiskLevel: { $in: ["High", "Critical"] }
    }).populate("owner", "displayName email").sort({ fraudRiskScore: -1 });
    return res.json(vouchers);
};

// NEW: Manually trigger fraud analysis for a user or voucher
export const triggerFraudAnalysisHandler = async (req: Request, res: Response) => {
    const { type, id } = req.body; // type: "user" | "voucher"


    if (type === "user") {
        const result = await FraudDetectionService.analyzeUser(id);
        return res.json(result);
    } else if (type === "voucher") {
        const result = await VoucherValidationService.verifyAndAnalyze(id);
        return res.json(result);
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid type" });
    }
};

// ... (previous code)

export const listAuditLogsHandler = async (req: Request, res: Response) => {
    const { action, target, actor, isRead } = req.query;
    const query: any = {};

    if (action) query.action = action;
    if (target) query.target = target;
    if (actor) query.actor = actor;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const logs = await AuditLogModel.find(query)
        .sort({ timestamp: -1 })
        .populate("actor", "displayName email avatarUrl role")
        .limit(100);

    res.json(logs);
};

export const markAuditLogReadHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    await AuditLogModel.findByIdAndUpdate(id, { isRead: true });
    res.status(StatusCodes.OK).json({ message: "Marked as read" });
};

// Referrals List
export const getReferralsListHandler = async (req: Request, res: Response) => {


    const usersWithReferrals = await UserModel.find({
        $or: [
            { referredBy: { $exists: true } },
            { referralCode: { $exists: true } }
        ]
    })
        .select("displayName email referralCode referredBy createdAt")
        .populate("referredBy", "displayName email")
        .sort({ createdAt: -1 })
        .limit(100);

    return res.json(usersWithReferrals);
};

// Saved Vouchers Stats
export const getSavedVouchersStatsHandler = async (req: Request, res: Response) => {


    // Aggregation to find users who have saved items in their wishlist
    const usersWithSaved = await UserModel.find({ savedVouchers: { $not: { $size: 0 } } })
        .select("displayName email savedVouchers")
        .populate("savedVouchers", "title brand listedPrice")
        .limit(100);

    return res.json(usersWithSaved);
};

// NEW: Top Buyers Leaderboard
export const getTopBuyersHandler = async (req: Request, res: Response) => {
    try {
        const topBuyers = await TransactionModel.aggregate([
            {
                $match: { status: { $in: ["paid", "completed"] } }
            },
            {
                $group: {
                    _id: "$buyer",
                    totalSpent: { $sum: "$amountPaid" },
                    transactionCount: { $sum: 1 },
                    lastTransactionDate: { $max: "$createdAt" }
                }
            },
            {
                $sort: { totalSpent: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 1,
                    totalSpent: 1,
                    transactionCount: 1,
                    lastTransactionDate: 1,
                    displayName: "$userDetails.displayName",
                    email: "$userDetails.email",
                    avatarUrl: "$userDetails.avatarUrl",
                    identityVerificationStatus: "$userDetails.identityVerificationStatus"
                }
            }
        ]);

        return res.json(topBuyers);
    } catch (error) {
        console.error("Error fetching top buyers:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch top buyers" });
    }
};

// NEW: Assign Reward Voucher to User
export const assignRewardVoucherHandler = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { title, brand, code, value } = req.body;


    try {
        const reward = await RewardVoucherModel.create({
            title,
            brand,
            code,
            value,
            assignedTo: userId,
            assignedAt: new Date(),
            status: "ASSIGNED",
            createdBy: req.currentUser!._id
        });

        // Notify User
        await NotificationModel.create({
            user: userId,
            message: `🎉 Congratulations! You received a free ${brand} voucher worth ₹${value} for being a top buyer!`,
            type: "success",
            link: "/profile?tab=rewards"
        });

        return res.status(StatusCodes.CREATED).json(reward);
    } catch (error) {
        console.error("Assign Reward Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to assign reward" });
    }
};

// NEW: Get Rewards for a User
export const getUserRewardsHandler = async (req: Request, res: Response) => {
    const { userId } = req.params; // Admin can view anyone's, User can view own


    // Access Control (Simplistic)
    if (!req.currentUser || (req.currentUser.role !== 'admin' && req.currentUser._id.toString() !== userId)) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
    }

    const rewards = await RewardVoucherModel.find({ assignedTo: userId }).sort({ createdAt: -1 });
    return res.json(rewards);
};
