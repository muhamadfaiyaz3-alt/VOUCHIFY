import { Router } from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { checkSuspension } from "../middlewares/suspension.middleware";
import authRouter from "./auth.routes";
import transactionRouter from "./transaction.routes";
import adminRouter from "./admin.routes";
import payoutRouter from "./payout.routes";
import notificationRouter from "./notification.routes";
import reviewRouter from "./review.routes";
import paymentConfigRouter from "./paymentConfig.routes";
import {
  createVoucherHandler,
  deleteVoucherHandler,
  getVoucherHandler,
  listVoucherHandler,
  publishVoucherHandler,
  updateVoucherHandler,
  approveVoucherHandler,
  getMyVouchersHandler,
} from "../controllers/voucher.controller";
import {
  createReviewHandler,
  listReviewsHandler,
} from "../controllers/review.controller";
import {
  getCurrentProfile,
  updateCurrentProfile,
  getUserDashboardStats,
  verifyContact,
  getAllUsers,
  updateIdentityStatus,
  toggleBlockStatus,
} from "../controllers/user.controller";
import {
  getAdminPaymentDetailsHandler,
  updateAdminPaymentDetailsHandler,
  getUserRewardsHandler
} from "../controllers/admin.controller";

import {
  submitReactivationHandler,
  listUserRequestsHandler,
  listAllRequestsHandler,
  reviewRequestHandler
} from "../controllers/reactivation.controller";
import { getPublicStatsHandler, getPublicLeaderboardHandler, getRecentActivityHandler } from "../controllers/stats.controller";
import { getFAQHandler } from "../controllers/faq.controller";
import { getTermsHandler, getPrivacyHandler } from "../controllers/legal.controller";

const router = Router();

router.get("/health", (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

router.get("/", (_req, res) => {
  res.json({
    message: "Welcome to Vouchify API",
    status: "running",
    documentation: "/api-docs", // Placeholder if we had docs
    health_check: "/health"
  });
});

router.use("/api/auth", authRouter);

// Public Routes
const publicRouter = Router();
publicRouter.get("/public/stats", getPublicStatsHandler);
publicRouter.get("/public/leaderboard", getPublicLeaderboardHandler);
publicRouter.get("/public/activity", getRecentActivityHandler);
publicRouter.get("/public/faq", getFAQHandler);
publicRouter.get("/public/terms", getTermsHandler);
publicRouter.get("/public/privacy", getPrivacyHandler);
publicRouter.get("/vouchers", listVoucherHandler);
publicRouter.get("/vouchers/:voucherId", getVoucherHandler);
publicRouter.get("/vouchers/:voucherId/reviews", listReviewsHandler);
publicRouter.use("/reviews", reviewRouter);
publicRouter.use("/payment-config", paymentConfigRouter);

// Restricted Access (Bypasses Suspension Check)
const restrictedRouter = Router();
restrictedRouter.use(authMiddleware);
restrictedRouter.get("/me", getCurrentProfile); // Allow user to see their profile even if suspended
restrictedRouter.post("/reactivation/submit", submitReactivationHandler);
restrictedRouter.get("/reactivation/my-requests", listUserRequestsHandler);

// Private Routes (Blocked if Suspended)
const privateRouter = Router();
privateRouter.use(authMiddleware);
privateRouter.use(checkSuspension);

privateRouter.get("/me/stats", getUserDashboardStats);
privateRouter.get("/me/rewards", (req, res) => {
  (req.params as any).userId = (req.currentUser as any)._id.toString(); // Ensure string for strict comparison
  return getUserRewardsHandler(req, res);
});
privateRouter.put("/me", updateCurrentProfile);
privateRouter.patch("/me", updateCurrentProfile); // Support partial updates
privateRouter.post("/me/verify-contact", verifyContact);
privateRouter.post("/vouchers", createVoucherHandler);
privateRouter.get("/me/vouchers", getMyVouchersHandler);
privateRouter.patch("/vouchers/:voucherId", updateVoucherHandler);
privateRouter.delete("/vouchers/:voucherId", deleteVoucherHandler);
privateRouter.post("/vouchers/:voucherId/publish", publishVoucherHandler);
privateRouter.post("/vouchers/:voucherId/reviews", createReviewHandler);

// Admin Payout/Verification (Bypass checkSuspension for admins)
privateRouter.patch("/vouchers/:voucherId/approve", approveVoucherHandler);
privateRouter.use("/transactions", transactionRouter);
privateRouter.use("/payouts", payoutRouter);
privateRouter.use("/notifications", notificationRouter);
privateRouter.get("/payment-details", getAdminPaymentDetailsHandler);
privateRouter.put("/payment-details", adminMiddleware, updateAdminPaymentDetailsHandler);

// Admin Interface
adminRouter.get("/reactivation-requests", listAllRequestsHandler);
adminRouter.post("/reactivation-requests/:requestId/review", reviewRequestHandler);

adminRouter.get("/users", getAllUsers); // List all users
adminRouter.patch("/users/:userId/identity", updateIdentityStatus); // Verify/Reject ID
adminRouter.patch("/users/:userId/block", toggleBlockStatus); // Suspend/Unsuspend User

privateRouter.use("/admin", adminMiddleware, adminRouter);

router.use("/api", publicRouter);
router.use("/api", restrictedRouter);
router.use("/api", privateRouter);

export default router;
