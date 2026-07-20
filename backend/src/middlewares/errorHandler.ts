import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Env from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status =
    (res.statusCode >= 400 && res.statusCode) || StatusCodes.INTERNAL_SERVER_ERROR;
  const payload: Record<string, unknown> = {
    message: err.message || "Something went wrong",
  };

  if (Env.isDev) {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
};

