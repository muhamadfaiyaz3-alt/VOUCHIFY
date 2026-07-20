import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ReactivationService } from "../services/reactivation.service";
import { ReactivationRequestModel } from "../models/ReactivationRequest";

/**
 * User submits request.
 * Note: This must bypass the suspension check, but require auth.
 */
export const submitReactivationHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.currentUser?._id.toString();
        if (!userId) return res.sendStatus(StatusCodes.UNAUTHORIZED);

        const { explanation, proofUrls } = req.body;
        if (!explanation) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Explanation is required" });
        }

        const request = await ReactivationService.submitRequest(userId, explanation, proofUrls || []);
        res.status(StatusCodes.CREATED).json(request);
    } catch (error: any) {
        console.error("Submit Reactivation Error:", error);
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message || "Failed to submit request" });
    }
};

export const listUserRequestsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.currentUser?._id;
        if (!userId) return res.sendStatus(StatusCodes.UNAUTHORIZED);

        const requests = await ReactivationRequestModel.find({ user: userId }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("List User Requests Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch requests" });
    }
};

// Admin Handlers
export const listAllRequestsHandler = async (req: Request, res: Response) => {
    try {
        const requests = await ReactivationRequestModel.find()
            .populate("user", "displayName email")
            .sort({ status: 1, createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("List All Requests Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch admin requests" });
    }
};

export const reviewRequestHandler = async (req: Request, res: Response) => {
    try {
        const adminId = req.currentUser?._id.toString();
        if (!adminId) return res.sendStatus(StatusCodes.UNAUTHORIZED);

        const { requestId } = req.params;
        if (!requestId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Request ID is required" });
        }

        const { action, adminNote, penaltyAmount } = req.body;

        const validActions: ("APPROVE" | "REJECT" | "REQUIRE_PENALTY")[] = ["APPROVE", "REJECT", "REQUIRE_PENALTY"];
        if (!validActions.includes(action as any)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid action" });
        }

        const request = await ReactivationService.reviewRequest(adminId, requestId, action as "APPROVE" | "REJECT" | "REQUIRE_PENALTY", (adminNote || "") as string, penaltyAmount);
        res.json(request);
    } catch (error: any) {
        console.error("Review Request Error:", error);
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message || "Failed to review request" });
    }
};
