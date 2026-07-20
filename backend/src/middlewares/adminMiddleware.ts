import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.currentUser || req.currentUser.role !== "admin") {
        return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Admin access required" });
    }
    next();
};
