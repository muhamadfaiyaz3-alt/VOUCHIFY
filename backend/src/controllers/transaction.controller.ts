import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TransactionModel } from "../models/Transaction";
import { VoucherModel } from "../models/Voucher";
import { decrypt } from "../utils/crypto.utils";
import Env from "../config/env";
import { cleanupUsedVoucher } from "../services/scheduler.service";
import { VoucherValidationService } from "../services/voucherValidation.service";

export const purchaseVoucherHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Auth required" });
    }

    const voucherId = req.params.voucherId;
    const userId = req.currentUser._id.toString();
    const { paymentMethod, paymentProof } = req.body;

    if (!["cash", "stripe"].includes(paymentMethod)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid payment method" });
    }

    if (paymentMethod === "cash" && !paymentProof) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Payment proof is required for cash payments" });
    }

    // STRICT: Identity Verification Check
    if (req.currentUser.identityVerificationStatus !== "Verified") {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: "Identity Verification Required. You must verify your ID before making a purchase."
        });
    }

    // 1. Secure Authentication & Locking Flow
    const validation = await VoucherValidationService.validateForUsage(voucherId as string, userId as string);

    if (!validation.isValid) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: validation.message,
            status: validation.message.includes("Review") ? "UNDER_REVIEW" : "REJECTED"
        });
    }

    const voucher = validation.voucher!;

    try {
        console.log(`[purchaseVoucherHandler] Creating transaction for voucher ${voucher._id}. Price: ${voucher.listedPrice}, Buyer: ${req.currentUser._id}`);

        const transaction = await TransactionModel.create({
            voucher: voucher._id,
            buyer: req.currentUser._id,
            seller: voucher.owner,
            amountPaid: voucher.listedPrice,
            platformFee: voucher.listedPrice * (voucher.platformFeePercent || 0),
            sellerPayout: voucher.sellerPayout,
            status: paymentMethod === "cash" ? "pending_admin_confirmation" : "pending",
            paymentMethod,
            paymentProof: paymentMethod === "cash" ? paymentProof : undefined,
            scratchCodeRevealed: false,
        });

        // Decrease quantity
        voucher.quantity -= 1;
        if (voucher.quantity === 0) {
            voucher.status = "sold_out";
        }

        // IMPORTANT: Unlock after successful transaction creation
        voucher.isLocked = false;
        await voucher.save();

        // Create Notifications
        const { NotificationModel } = await import("../models/Notification");
        const { UserModel } = await import("../models/User");

        // 1. Notify Buyer
        await NotificationModel.create({
            user: req.currentUser._id,
            message: `Order placed for ${voucher.title}. Status: ${transaction.status === "pending_admin_confirmation" ? "Waiting for Manual Payment Verification" : "Payment Pending"}`,
            type: "info",
            link: transaction.status === "pending_admin_confirmation" ? `/payment/${voucher._id}` : "/profile"
        });

        // 2. Notify Seller
        await NotificationModel.create({
            user: voucher.owner,
            message: `Your voucher "${voucher.title}" has been ordered by ${req.currentUser.displayName || "a user"}. Status: ${transaction.status}`,
            type: "info",
            link: "/profile"
        });

        // 3. Notify Admins (if Manual Payment)
        if (paymentMethod === "cash") {
            const admins = await UserModel.find({ role: "admin" });
            const adminNotifications = admins.map(admin => ({
                user: admin._id,
                message: `New Manual Payment Request: ${voucher.title} by ${req.currentUser?.displayName || 'User'}`,
                type: "warning",
                link: "/admin/verify-payments"
            }));
            if (adminNotifications.length > 0) {
                await NotificationModel.insertMany(adminNotifications);
            }
        }

        return res.status(StatusCodes.CREATED).json({
            transaction,
            message: paymentMethod === "cash"
                ? "Order placed. Please contact admin to complete payment."
                : "Order placed.",
        });
    } catch (error: any) {
        console.error("[purchaseVoucherHandler] Error creating transaction:", error);

        // UNLOCK on failure
        if (voucherId) await VoucherValidationService.unlockVoucher(voucherId);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to create transaction",
            error: error.message
        });
    }
};

export const listTransactionsHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    const query: any = {};
    const { type } = req.query;

    if (req.currentUser.role !== "admin") {
        if (type === 'sold') {
            query.seller = req.currentUser._id;
        } else if (type === 'all') {
            query.$or = [{ buyer: req.currentUser._id }, { seller: req.currentUser._id }];
        } else {
            // Default to bought
            query.buyer = req.currentUser._id;
        }
    }

    const transactions = await TransactionModel.find(query)
        .populate("voucher", "title listedPrice imageUrl")
        .populate("seller", "displayName")
        .populate("buyer", "displayName email")
        .sort({ createdAt: -1 });

    return res.json(transactions);
};

export const getTransactionHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const transaction = await TransactionModel.findById(id)
        .populate("voucher")
        .populate("seller", "displayName")
        .populate("buyer", "displayName");

    if (!transaction) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
    }

    // Access control
    const isBuyer = transaction.buyer._id.toString() === req.currentUser?._id.toString();
    const isAdmin = req.currentUser?.role === "admin";

    if (!isBuyer && !isAdmin) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
    }

    return res.json(transaction);
};

export const getScratchCodeHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(`[getScratchCodeHandler] Request for transaction ID: ${id}`);
    const transaction = await TransactionModel.findById(id).populate({
        path: "voucher",
        select: "+scratchCode"
    });

    if (!transaction) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
    }

    const isBuyer = transaction.buyer.toString() === req.currentUser?._id.toString();
    const isAdmin = req.currentUser?.role === "admin";

    if (!isBuyer && !isAdmin) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
    }

    if (transaction.status !== "completed" && transaction.status !== "paid") {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Payment not verified yet" });
    }

    const voucher = transaction.voucher as any;
    if (!voucher.scratchCode) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "No code attached" });
    }

    try {
        const code = decrypt(voucher.scratchCode);

        if (!transaction.scratchCodeRevealed) {
            transaction.scratchCodeRevealed = true;
            await transaction.save();
        }

        cleanupUsedVoucher(voucher._id.toString());

        return res.json({ code });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error decrypting code" });
    }
};

import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { Types } from "mongoose";

export const getAnalyticsHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    const { period = 'month' } = req.query; // week, month, year
    const userId = req.currentUser._id;

    // 1. Determine Date Ranges
    let currentStart: Date, currentEnd: Date;
    let previousStart: Date, previousEnd: Date;
    const now = new Date();

    switch (period) {
        case 'week':
            currentStart = startOfWeek(now);
            currentEnd = endOfWeek(now);
            previousStart = startOfWeek(subWeeks(now, 1));
            previousEnd = endOfWeek(subWeeks(now, 1));
            break;
        case 'year':
            currentStart = startOfYear(now);
            currentEnd = endOfYear(now);
            previousStart = startOfYear(subYears(now, 1));
            previousEnd = endOfYear(subYears(now, 1));
            break;
        case 'month':
        default:
            currentStart = startOfMonth(now);
            currentEnd = endOfMonth(now);
            previousStart = startOfMonth(subMonths(now, 1));
            previousEnd = endOfMonth(subMonths(now, 1));
            break;
    }

    // 2. Aggregation Helper
    const aggregateTrends = async (matchQuery: any) => {
        // Current Period
        const currentStats = await TransactionModel.aggregate([
            { $match: { ...matchQuery, createdAt: { $gte: currentStart, $lte: currentEnd } } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amountPaid" },
                    count: { $sum: 1 },
                }
            }
        ]);

        // Previous Period
        const prevStats = await TransactionModel.aggregate([
            { $match: { ...matchQuery, createdAt: { $gte: previousStart, $lte: previousEnd } } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amountPaid" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const current = currentStats[0] || { totalAmount: 0, count: 0 };
        const prev = prevStats[0] || { totalAmount: 0, count: 0 };

        const percentChange = prev.totalAmount === 0 ? (current.totalAmount > 0 ? 100 : 0) : ((current.totalAmount - prev.totalAmount) / prev.totalAmount) * 100;

        return {
            current,
            previous: prev,
            percentChange: Math.round(percentChange * 10) / 10
        };
    };

    // 3. Execution
    try {
        const boughtTrends = await aggregateTrends({ buyer: new Types.ObjectId(userId.toString()) });
        const soldTrends = await aggregateTrends({ seller: new Types.ObjectId(userId.toString()) });

        // Fetch detailed list for the current period
        const transactions = await TransactionModel.find({
            $or: [{ buyer: userId }, { seller: userId }],
            createdAt: { $gte: currentStart, $lte: currentEnd }
        })
            .populate("voucher", "title brand")
            .populate("seller", "displayName")
            .populate("buyer", "displayName")
            .sort({ createdAt: -1 });

        return res.json({
            period,
            analytics: {
                bought: boughtTrends,
                sold: soldTrends,
            },
            transactions
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch analytics" });
    }
};
