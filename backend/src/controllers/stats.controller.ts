import { Request, Response } from "express";
import { VoucherModel } from "../models/Voucher";
import { UserModel } from "../models/User";
import { TransactionModel } from "../models/Transaction";
import { StatusCodes } from "http-status-codes";

export const getPublicStatsHandler = async (req: Request, res: Response) => {
    try {
        // 1. Active Vouchers: Count of published and approved vouchers
        const activeVouchers = await VoucherModel.countDocuments({
            isApproved: true,
            status: "published",
            isActive: true
        });

        // 2. Total Users: Count of all registered users (excluding suspended ones ideally, but typically "Happy Users" includes everyone)
        // Let's exclude strictly suspended/blocked ones to be "Trusted"
        const totalUsers = await UserModel.countDocuments({ isSuspended: false });

        // 3. Total Savings: Calculate savings from completed transactions
        // Savings = Sum(originalPrice - amountPaid)
        const savingsAgg = await TransactionModel.aggregate([
            {
                $match: {
                    status: { $in: ["paid", "completed"] }
                }
            },
            {
                $lookup: {
                    from: "vouchers",
                    localField: "voucher",
                    foreignField: "_id",
                    as: "voucherData"
                }
            },
            { $unwind: "$voucherData" },
            {
                $group: {
                    _id: null,
                    totalSavings: { $sum: { $subtract: ["$voucherData.originalPrice", "$amountPaid"] } }
                }
            }
        ]);

        const totalSavings = savingsAgg.length > 0 ? savingsAgg[0].totalSavings : 0;

        const totalTransactions = await TransactionModel.countDocuments({ status: { $in: ["paid", "completed"] } });

        return res.json({
            activeVouchers,
            totalUsers,
            totalSavings: Math.round(totalSavings),
            totalTransactions
        });

    } catch (error) {
        console.error("Error fetching public stats:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch stats",
            activeVouchers: 0,
            totalUsers: 0,
            totalSavings: 0
        });
    }
};

export const getPublicLeaderboardHandler = async (req: Request, res: Response) => {
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
                // Project ONLY safe fields for public display
                $project: {
                    _id: 1,
                    totalSpent: 1,
                    transactionCount: 1,
                    displayName: "$userDetails.displayName",
                    avatarUrl: "$userDetails.avatarUrl",
                    // Masked or partial name if needed, but displayName is usually public
                }
            }
        ]);

        return res.json(topBuyers);
    } catch (error) {
        console.error("Error fetching public leaderboard:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch leaderboard" });
    }
};

export const getRecentActivityHandler = async (req: Request, res: Response) => {
    try {
        const recent = await TransactionModel.find({ status: { $in: ["paid", "completed"] } })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("amountPaid createdAt")
            .populate("voucher", "title brand")
            .populate("buyer", "displayName")
            .lean();

        return res.json(recent);
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch activity" });
    }
};
