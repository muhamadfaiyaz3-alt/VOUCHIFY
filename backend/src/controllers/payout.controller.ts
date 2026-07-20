import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PayoutModel } from "../models/Payout";
import { UserModel } from "../models/User";

export const requestPayoutHandler = async (req: Request, res: Response) => {
    // DEPRECATED: Payouts are now automated
    return res.status(StatusCodes.GONE).json({ message: "Manual payout requests are deprecated." });
};

export const listPayoutsHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    const query: any = {};
    const { status } = req.query;

    if (req.currentUser.role !== "admin") {
        query.seller = req.currentUser._id;
    }

    if (status) {
        query.status = status;
    }

    const payouts = await PayoutModel.find(query)
        .populate("seller", "displayName email phone payoutSettings")
        .populate({
            path: "transaction",
            populate: { path: "voucher" }
        })
        .sort({ createdAt: -1 });

    return res.json(payouts);
};

export const processPayoutHandler = async (req: Request, res: Response) => {
    if (!req.currentUser || req.currentUser.role !== "admin") {
        return res.sendStatus(StatusCodes.FORBIDDEN);
    }

    const { id } = req.params;
    const { action, paymentReference, adminProofUrl } = req.body; // "mark_paid", "reject"

    const payout = await PayoutModel.findById(id);
    if (!payout) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Payout not found" });
    }

    if (payout.status !== "pending") {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Payout already processed" });
    }

    if (action === "mark_paid") {
        payout.status = "paid";
        payout.processedAt = new Date();
        payout.paymentReference = paymentReference;
        payout.adminProofUrl = adminProofUrl;

        // Notify Seller
        const { NotificationModel } = await import("../models/Notification");
        await NotificationModel.create({
            user: payout.seller,
            message: `Payout Processed: Your payout of ₹${payout.amount} has been processed. Reference: ${paymentReference || 'N/A'}. Check your profile for details.`,
            type: "success",
            link: "/profile?tab=payouts"
        });

    } else if (action === "reject") {
        payout.status = "rejected";
        payout.processedAt = new Date();

        // Notify Seller
        const { NotificationModel } = await import("../models/Notification");
        await NotificationModel.create({
            user: payout.seller,
            message: `Payout Rejected: Your payout of ₹${payout.amount} was rejected. Note: ${payout.adminNote || 'Contact support'}.`,
            type: "error",
            link: "/profile"
        });
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid action" });
    }

    await payout.save();
    return res.json(payout);
};

export const addPayoutQueryHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Message is required" });
    }

    const payout = await PayoutModel.findById(id);
    if (!payout) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Payout not found" });
    }

    // Access control
    const isSeller = payout.seller.toString() === req.currentUser._id.toString();
    const isAdmin = req.currentUser.role === "admin";

    if (!isSeller && !isAdmin) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
    }

    const sender = isAdmin ? "admin" : "user";
    payout.queries.push({
        sender,
        message,
        createdAt: new Date()
    });

    await payout.save();

    // Notification Logic
    const { NotificationModel } = await import("../models/Notification");
    if (sender === "admin") {
        await NotificationModel.create({
            user: payout.seller,
            message: `New Message from Admin regarding your payout: "${message.substring(0, 50)}..."`,
            type: "info",
            link: "/profile?tab=payouts"
        });
    } else {
        // Notify Admins
        const admins = await UserModel.find({ role: "admin" });
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                user: admin._id,
                message: `User ${req.currentUser!.displayName} sent a message regarding payout #${payout._id.toString().substring(0, 6)}`,
                type: "warning",
                link: "/admin/payouts" // Assuming tabs logic will handle this
            }));
            await NotificationModel.insertMany(notifications);
        }
    }


    return res.json(payout);
};

export const bulkProcessPayoutHandler = async (req: Request, res: Response) => {
    if (!req.currentUser || req.currentUser.role !== "admin") {
        return res.sendStatus(StatusCodes.FORBIDDEN);
    }

    const { sellerId, action, paymentReference, adminProofUrl } = req.body;

    if (action !== "mark_paid") {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Only mark_paid is supported for bulk processing" });
    }

    const { NotificationModel } = await import("../models/Notification");

    // Find all pending payouts for this seller
    const payouts = await PayoutModel.find({ seller: sellerId, status: "pending" })
        .populate("transaction");

    if (payouts.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "No pending payouts found for this seller" });
    }

    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);

    // Update all
    await PayoutModel.updateMany(
        { _id: { $in: payouts.map(p => p._id) } },
        {
            status: "paid",
            processedAt: new Date(),
            paymentReference,
            adminProofUrl
        }
    );

    // Single Notification for the Batch
    await NotificationModel.create({
        user: sellerId,
        message: `Payment Settlement Processed: We've settled your payment of ₹${totalAmount} for ${payouts.length} sold voucher(s). Ref: ${paymentReference}.`,
        type: "success",
        link: "/profile?tab=payouts"
    });

    return res.json({ message: "Processed", count: payouts.length });
};
