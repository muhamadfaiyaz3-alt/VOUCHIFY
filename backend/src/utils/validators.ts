import { z } from "zod";
import { isAfter } from "date-fns";

export const voucherPayloadSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(2),
    tags: z.array(z.string()).optional().default([]),

    // Pricing
    originalPrice: z.number().positive(),
    listedPrice: z.number().positive(),
    discountPercent: z.number().min(0).max(1),
    sellerPayout: z.number().positive(),
    platformFeePercent: z.number().min(0).max(1),
    companySharePercent: z.number().min(0).max(1),

    quantity: z.number().int().positive(),
    limitPerUser: z.number().int().positive().optional().default(1),
    expiryDate: z.string().refine((value) => isAfter(new Date(value), new Date()), {
      message: "Expiry date must be in the future",
    }),
    terms: z.string().optional().default(""),
    instructions: z.string().optional().default(""),

    scratchCode: z.string().optional(),
    imageUrl: z.string().optional(),
    userVerificationImage: z.string().optional(),

    mediaUrls: z.array(z.string()).optional().default([]),
    status: z.enum(["draft", "published", "expired", "sold_out"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.listedPrice > data.originalPrice) {
      ctx.addIssue({
        path: ["listedPrice"],
        code: z.ZodIssueCode.custom,
        message: "Listed price cannot exceed original price",
      });
    }
  });

export const walletTopUpSchema = z.object({
  amount: z.number().positive(),
  reference: z.string().optional(),
});

export const reviewSchema = z.object({
  voucherId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(5).optional(), // Frontend sends message
  comment: z.string().min(5).optional(), // Legacy support
  voucherBrand: z.string().optional(),
  transactionType: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
  businessName: z.string().optional(),
  role: z.enum(["user", "business"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});


