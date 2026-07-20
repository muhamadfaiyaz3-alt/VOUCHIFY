import { Types } from "mongoose";
import { WalletModel, TransactionType, TransactionSource } from "../models/Wallet";
import Env from "../config/env";

export const getOrCreateWallet = async (userId: Types.ObjectId) => {
  return WalletModel.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { balance: 0, currency: Env.defaultCurrency } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const addTransaction = async (params: {
  userId: Types.ObjectId;
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  description: string;
  reference?: string;
  voucher?: Types.ObjectId;
}) => {
  const wallet = await getOrCreateWallet(params.userId);
  const nextBalance =
    params.type === "credit"
      ? wallet.balance + params.amount
      : wallet.balance - params.amount;

  if (nextBalance < 0) {
    throw new Error("Insufficient wallet balance");
  }

  wallet.balance = nextBalance;
  wallet.transactions.unshift({
    type: params.type,
    source: params.source,
    amount: params.amount,
    description: params.description,
    reference: params.reference,
    voucher: params.voucher,
  } as any);
  await wallet.save();
  return wallet;
};

export const getWalletHistory = (userId: Types.ObjectId, limit = 20) => {
  return WalletModel.findOne({ user: userId }).select({
    balance: 1,
    currency: 1,
    transactions: { $slice: limit },
  });
};

