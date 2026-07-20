import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import Env from "../config/env";

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, Env.jwtSecret) as JwtPayload;

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User not found" });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
};
