import { ReactivationRequestModel } from "../models/ReactivationRequest";
import { UserModel } from "../models/User";
import { AuditService } from "./audit.service";
import { NotificationModel } from "../models/Notification";
import { Types } from "mongoose";

export class ReactivationService {
    /**
     * Submit a reactivation request.
     */
    static async submitRequest(userId: string, explanation: string, proofUrls: string[]) {
        const existing = await ReactivationRequestModel.findOne({ user: userId, status: "PENDING" });
        if (existing) throw new Error("You already have a pending reactivation request.");

        const request = await ReactivationRequestModel.create({
            user: userId,
            explanation,
            proofUrls
        });

        await AuditService.log({
            actor: userId,
            action: "REACTIVATION_REQUEST_SUBMITTED",
            details: "User submitted a reactivation request.",
            metadata: { requestId: request._id }
        });

        return request;
    }

    /**
     * Admin reviews a request.
     */
    static async reviewRequest(adminId: string, requestId: string, action: "APPROVE" | "REJECT" | "REQUIRE_PENALTY", adminNote: string, penaltyAmount?: number) {
        const request = await ReactivationRequestModel.findById(requestId);
        if (!request) throw new Error("Request not found");

        const user = await UserModel.findById(request.user);
        if (!user) throw new Error("User not found");

        if (action === "APPROVE") {
            request.status = "APPROVED";
            user.isSuspended = false;
            user.suspensionReason = undefined;
            user.trustScore = Math.min(user.trustScore + 10, 100); // Small boost on approval
            await user.save();

            await NotificationModel.create({
                user: user._id,
                message: "Your account has been reactivated! Please follow our policy strictly.",
                type: "success"
            });

            await AuditService.log({
                actor: adminId,
                target: user._id,
                action: "ACCOUNT_REACTIVATED",
                details: `Admin approved reactivation. Note: ${adminNote}`,
                metadata: { requestId }
            });

        } else if (action === "REQUIRE_PENALTY") {
            request.status = "REQUIRES_PENALTY";
            request.penaltyAmount = penaltyAmount || 100; // Default penalty

            await NotificationModel.create({
                user: user._id,
                message: `Your reactivation requires a security challenge fee of ₹${request.penaltyAmount}.`,
                type: "warning"
            });

        } else {
            request.status = "REJECTED";

            await NotificationModel.create({
                user: user._id,
                message: `Your reactivation request was rejected. Admin Note: ${adminNote}`,
                type: "error"
            });

            await AuditService.log({
                actor: adminId,
                target: user._id,
                action: "REACTIVATION_REJECTED",
                details: `Admin rejected reactivation. Reason: ${adminNote}`,
                metadata: { requestId }
            });
        }

        request.reviewedBy = new Types.ObjectId(adminId);
        request.reviewedAt = new Date();
        request.adminNote = adminNote;
        await request.save();

        return request;
    }
}
