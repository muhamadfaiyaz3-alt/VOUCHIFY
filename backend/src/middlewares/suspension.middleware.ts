import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware to check if the current user is suspended.
 */
export const checkSuspension = (req: Request, res: Response, next: NextFunction) => {
    const user = req.currentUser as any;

    if (user && user.isPermanentlyBanned) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: "⚠️ PERMANENTLY BANNED",
            reason: "Your account has been permanently banned from Vouchify due to critical policy violations.",
            error: "This action is final and cannot be appealed."
        });
    }

    if (user && user.isSuspended) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: "🚨 ACCOUNT SUSPENDED",
            reason: user.suspensionReason || "Your account has been suspended due to policy violations.",
            error: "In accordance with our anti-fraud policy, your access to wallet, vouchers, and transactions has been restricted. You may submit a reactivation request for review."
        });
    }

    next();
};
