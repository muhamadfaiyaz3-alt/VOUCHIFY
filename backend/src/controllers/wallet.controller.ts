import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { addTransaction, getWalletHistory } from "../services/wallet.service";
import { walletTopUpSchema } from "../utils/validators";
import { VoucherModel } from "../models/Voucher";
import { RedemptionModel } from "../models/Redemption";
import { v4 as uuid } from "uuid";

export const getWalletHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }
  const wallet = await getWalletHistory(req.currentUser._id, 25);
  return res.json(wallet);
};

export const manualTopUpHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const currentUser = req.currentUser!;
  const payload = walletTopUpSchema.parse(req.body);
  const txPayload: Parameters<typeof addTransaction>[0] = {
    userId: currentUser._id,
    type: "credit",
    source: "manual",
    amount: payload.amount,
    description: "Manual wallet top-up",
  };
  if (payload.reference) {
    txPayload.reference = payload.reference;
  }
  const wallet = await addTransaction(txPayload);

  return res.status(StatusCodes.CREATED).json(wallet);
};

export const purchaseVoucherHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  const currentUser = req.currentUser!;
  const voucherId = req.params.voucherId;
  if (!voucherId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "voucherId param is required" });
  }

  const voucher = await VoucherModel.findById(voucherId);
  if (!voucher) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
  }

  if (voucher.quantity <= 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Voucher is sold out" });
  }

  if (voucher.expiryDate < new Date()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Voucher already expired" });
  }

  await addTransaction({
    userId: currentUser._id,
    type: "debit",
    source: "voucher-purchase",
    amount: voucher.listedPrice,
    description: `Purchase voucher ${voucher.title}`,
    voucher: voucher._id,
  });

  voucher.quantity -= 1;
  if (!voucher.stats) {
    voucher.stats = { saved: 0, redeemed: 0, views: 0 } as any;
  }
  voucher.stats.redeemed += 1;
  if (voucher.quantity === 0) {
    voucher.status = "sold_out";
  }
  await voucher.save();

  const redemptionCode = uuid().split("-")[0] ?? "";

  const redemption = await RedemptionModel.create({
    voucher: voucher._id,
    user: currentUser._id,
    code: redemptionCode.toUpperCase(),
  });

  return res.status(StatusCodes.CREATED).json({
    voucher,
    redemption,
  });
};

