import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  approveVoucher,
  createVoucher,
  deleteVoucher,
  getVoucherById,
  listVouchers,
  updateVoucher,
  updateVoucherStatus,
  listVouchersWithTransactionStatus,
} from "../services/voucher.service";
import { voucherPayloadSchema } from "../utils/validators";

export const listVoucherHandler = async (req: Request, res: Response) => {
  const { status, category, owner } = req.query;
  const filters: Record<string, unknown> = {};

  // Public filters
  if (category) filters.category = category;

  // Admin/Owner filters (need to be careful here)
  // For public list, service enforces status=published & isApproved=true

  const vouchers = await listVouchers(filters, 100);
  return res.json(vouchers);
};

export const createVoucherHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const parsed = voucherPayloadSchema.parse(req.body);
  const voucher = await createVoucher({
    ...parsed,
    expiryDate: new Date(parsed.expiryDate),
    owner: (req.currentUser as any)._id,
  });
  return res.status(StatusCodes.CREATED).json(voucher);
};

export const getVoucherHandler = async (req: Request, res: Response) => {
  const voucherId = req.params.voucherId;
  if (!voucherId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "voucherId param is required" });
  }
  const voucher = await getVoucherById(voucherId);
  if (!voucher) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
  }
  // Check for pending transaction for the current user
  let userTransactionStatus = null;
  if (req.currentUser) {
    const { TransactionModel } = await import("../models/Transaction");
    const transaction = await TransactionModel.findOne({
      voucher: voucher._id,
      buyer: req.currentUser._id,
      status: { $in: ["pending", "pending_admin_confirmation"] }
    });
    if (transaction) {
      userTransactionStatus = transaction.status;
    }
  }

  return res.json({ ...voucher.toObject(), currentUserTransactionStatus: userTransactionStatus });
};

export const updateVoucherHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const voucherId = req.params.voucherId;
  if (!voucherId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "voucherId param is required" });
  }

  const existing = await getVoucherById(voucherId);
  if (!existing) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
  }

  const ownerId = existing.owner?._id?.toString() || existing.owner?.toString();
  const isOwner = ownerId === req.currentUser._id.toString();
  const isAdmin = req.currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Not allowed to modify this voucher" });
  }

  const parsed = voucherPayloadSchema.partial().parse(req.body);
  const updated = await updateVoucher(existing.id, {
    ...parsed,
    expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined,
  });
  return res.json(updated);
};

export const deleteVoucherHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const voucherId = req.params.voucherId;
  if (!voucherId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "voucherId param is required" });
  }

  const existing = await getVoucherById(voucherId);
  if (!existing) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
  }

  const ownerId = existing.owner?._id?.toString() || existing.owner?.toString();
  const isOwner = ownerId === req.currentUser._id.toString();
  const isAdmin = req.currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Not allowed to delete this voucher" });
  }

  await deleteVoucher(existing.id);
  return res.status(StatusCodes.NO_CONTENT).send();
};

export const publishVoucherHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }
  const voucherId = req.params.voucherId;
  if (!voucherId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "voucherId param is required" });
  }

  const existing = await getVoucherById(voucherId);
  if (!existing) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
  }
  const ownerId = existing.owner?._id?.toString() || existing.owner?.toString();
  const isOwner = ownerId === req.currentUser._id.toString();
  const isAdmin = req.currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Not allowed to publish this voucher" });
  }

  const updated = await updateVoucherStatus(existing.id, "published");
  return res.json(updated);
};

export const approveVoucherHandler = async (req: Request, res: Response) => {
  if (!req.currentUser || req.currentUser.role !== "admin") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Admin access required" });
  }
  const voucherId = req.params.voucherId;
  const { isApproved } = req.body;

  const updated = await approveVoucher(voucherId!, Boolean(isApproved));
  return res.json(updated);
};

export const getMyVouchersHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const vouchers = await listVouchersWithTransactionStatus(req.currentUser._id.toString());
  return res.json(vouchers);
};

