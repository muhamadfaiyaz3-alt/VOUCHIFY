import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotificationModel } from "../models/Notification";

export const getMyNotificationsHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Auth required" });
    }

    try {
        const notifications = await NotificationModel.find({ user: req.currentUser._id })
            .sort({ createdAt: -1 })
            .limit(50);

        // Count unread
        const unreadCount = await NotificationModel.countDocuments({
            user: req.currentUser._id,
            read: false
        });

        return res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch notifications" });
    }
};

export const markAsReadHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Auth required" });
    }

    const { id } = req.params;

    try {
        if (id === 'all') {
            await NotificationModel.updateMany(
                { user: req.currentUser._id, read: false },
                { $set: { read: true } }
            );
        } else {
            await NotificationModel.findOneAndUpdate(
                { _id: id, user: req.currentUser._id },
                { $set: { read: true } }
            );
        }

        return res.json({ message: "Marked as read" });
    } catch (error) {
        console.error("Mark read error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update notification" });
    }
};
