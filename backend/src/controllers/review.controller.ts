import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ReviewModel } from "../models/Review";
import { reviewSchema } from "../utils/validators";

export const listReviewsHandler = async (req: Request, res: Response) => {
  const voucherId = req.params.voucherId || req.query.voucherId;
  const filter: any = {};

  if (voucherId && voucherId !== "general") {
    filter.voucher = voucherId;
  } else if (voucherId === "general") {
    // If asking for general reviews, explicitly look for ones without a specific voucher
    // Or should it be all reviews for the platform? 
    // The previous implementation was specific to a voucher. 
    // Let's assume 'general' means reviews that don't have a specific voucher ID attached (site reviews).
    filter.voucher = { $exists: false };
  }
  // If no voucherId provided, list all? Or just fail? 
  // For safety, if strictly asking without ID, maybe list all is fine aka recent reviews.

  const reviews = await ReviewModel.find(filter)
    .populate("user", "displayName avatarUrl")
    .sort({ createdAt: -1 });
  return res.json(reviews);
};

export const createReviewHandler = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  // Frontend sends voucherId='general' in body. REST might use params.
  const rawVoucherId = req.params.voucherId || req.body.voucherId;

  const payload = reviewSchema.parse({
    ...req.body,
    voucherId: rawVoucherId
  });

  const comment = payload.message || payload.comment || "";

  const updateData: any = {
    rating: payload.rating,
    comment: comment,
    voucherBrand: payload.voucherBrand,
    transactionType: payload.transactionType,
    user: req.currentUser._id,
  };

  const filter: any = { user: req.currentUser._id };

  if (payload.voucherId && payload.voucherId !== "general") {
    updateData.voucher = payload.voucherId;
    filter.voucher = payload.voucherId;
  } else {
    // General review
    // If we want to allow only 1 general review per user
    filter.voucher = { $exists: false };
    // If we want to allow multiple, we would use create() instead of findOneAndUpdate
    // But Testimonials usually implies one per person.
  }

  // Use findOneAndUpdate to upsert
  const review = await ReviewModel.findOneAndUpdate(
    filter,
    updateData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(StatusCodes.CREATED).json(review);
};

