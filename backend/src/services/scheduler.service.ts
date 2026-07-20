import cron from "node-cron";
import mongoose from "mongoose";
import { VoucherModel } from "../models/Voucher";
import { VoucherArchiveModel } from "../models/VoucherArchive";
import { NotificationModel } from "../models/Notification";
import { UserModel } from "../models/User";
import { FraudDetectionService } from "./fraudDetection.service";
import { VoucherValidationService } from "./voucherValidation.service";

export const initScheduler = () => {
    // Run every hour to check for expired vouchers
    cron.schedule("0 * * * *", async () => {
        console.log("[Scheduler] Running hourly expiry check...");
        await checkAndArchiveExpiredVouchers();
    });

    // Run every 4 hours for Fraud Analysis
    cron.schedule("0 */4 * * *", async () => {
        console.log("[Scheduler] Running periodic Fraud Analysis...");
        await runSystemWideFraudAnalysis();
    });

    // Also run once on startup for dev/test
    checkAndArchiveExpiredVouchers();
    runSystemWideFraudAnalysis();
};

const runSystemWideFraudAnalysis = async () => {
    try {
        console.log("[Fraud Job] Starting system-wide fraud analysis...");

        // 1. Analyze all active vouchers
        const activeVouchers = await VoucherModel.find({ isActive: true });
        console.log(`[Fraud Job] Analyzing ${activeVouchers.length} active vouchers...`);
        for (const voucher of activeVouchers) {
            await VoucherValidationService.verifyAndAnalyze(voucher._id.toString());
        }

        // 2. Analyze all active users
        const users = await UserModel.find({ isSuspended: false });
        console.log(`[Fraud Job] Analyzing ${users.length} active users...`);
        for (const user of users) {
            await FraudDetectionService.analyzeUser(user._id.toString());
        }

        console.log("[Fraud Job] Fraud analysis completed.");
    } catch (error) {
        console.error("[Fraud Job] Error in fraud analysis job:", error);
    }
};

const checkAndArchiveExpiredVouchers = async () => {
    try {
        const now = new Date();
        // Find vouchers that are expired but NOT yet marked as expired/archived
        const expiredVouchers = await VoucherModel.find({
            expiryDate: { $lt: now },
            status: { $nin: ["expired", "rejected"] }, // Include "published", "draft", etc.
        });

        if (expiredVouchers.length === 0) {
            console.log("[Scheduler] No expired vouchers found.");
            return;
        }

        console.log(`[Scheduler] Found ${expiredVouchers.length} expired vouchers. Processing...`);

        for (const voucher of expiredVouchers) {
            // Safety Check: active transactions
            const activeTx = await mongoose.model("Transaction").exists({
                voucher: voucher._id,
                status: { $in: ["pending", "pending_admin_confirmation"] }
            });

            if (activeTx) {
                console.log(`[Scheduler] Skipping voucher ${voucher._id} due to active transaction.`);
                continue;
            }

            // 1. Archive
            await VoucherArchiveModel.create({
                voucherId: voucher._id,
                owner: voucher.owner,
                title: voucher.title,
                originalPrice: voucher.originalPrice,
                listedPrice: voucher.listedPrice,
                sellerPayout: voucher.sellerPayout,
                quantity: voucher.quantity,
                expiryDate: voucher.expiryDate,
                reason: "expired",
                history: voucher.toObject(),
            });

            // 2. Notify Owner
            const owner = await UserModel.findById(voucher.owner);
            if (owner) {
                await NotificationModel.create({
                    user: owner._id,
                    message: `Your voucher "${voucher.title}" has expired and has been archived.`,
                    type: "error", // Use error color for expiry alert
                });
            }

            // 3. Notify Admin (Optional logic, maybe just system log or notify superadmins)
            // Skipping for now to avoid spamming admin notifications unless critical.

            // 4. Update Status (Soft Delete mechanism) 
            // Instead of physical delete, we mark 'expired' and isActive=false
            // The prompt asks to "Automatically remove vouchers from Marketplace listings".
            // Setting status="expired" and isActive=false achieves this because listVouchers filters for published/active.
            voucher.status = "expired";
            voucher.isActive = false;
            await voucher.save();

            console.log(`[Scheduler] Archived voucher ${voucher._id} (${voucher.title})`);
        }
    } catch (error) {
        console.error("[Scheduler] Error in expiry check:", error);
    }
};

// Helper for "Used" cleanup triggers
export const cleanupUsedVoucher = async (voucherId: string) => {
    try {
        const voucher = await VoucherModel.findById(voucherId);
        if (!voucher) return;

        if (voucher.quantity === 0 && voucher.status !== 'sold_out') {
            voucher.status = 'sold_out';
            // Maybe archive as 'used' if we want to remove from DB?
            // Usually sold out items stay visible but unbuyable.
            // If prompt demands "REMOVED" after use, we can archive.
            // "Instantly mark vouchers as USED... Trigger cleanup workflows... Automatically remove... from Marketplace"
            // Marking 'sold_out' removes it from 'Available' lists usually.
            await voucher.save();

            // Notify Owner
            await NotificationModel.create({
                user: voucher.owner,
                message: `Your voucher "${voucher.title}" is sold out!`,
                type: "success"
            });
        }
    } catch (err) {
        console.error("Cleanup used voucher failed", err);
    }
}
