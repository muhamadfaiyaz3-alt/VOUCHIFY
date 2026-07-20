import { Router } from "express";
import {
    getAnalyticsHandler,
    listAllTransactionsHandler,
    getSettingsHandler,
    updateSettingsHandler,
    verifyTransactionHandler,
    updateAdminPaymentDetailsHandler,
    getPendingVouchersHandler,
    verifyVoucherHandler,
    listRiskUsersHandler,
    listRiskVouchersHandler,
    triggerFraudAnalysisHandler,
    listAuditLogsHandler,
    listUsersForVerificationHandler,
    verifyUserIdentityHandler,
    getTopBuyersHandler,
    assignRewardVoucherHandler,
    getUserRewardsHandler,
    getAdminPaymentDetailsHandler,
    markAuditLogReadHandler,
    getReferralsListHandler,
    getSavedVouchersStatsHandler
} from "../controllers/admin.controller";

const router = Router();

// Analytics & Dashboard
router.get("/analytics", getAnalyticsHandler);

// Transactions
router.get("/transactions", listAllTransactionsHandler);
router.patch("/transactions/:transactionId/verify", verifyTransactionHandler);

// System Settings
router.get("/settings", getSettingsHandler);
router.put("/settings", updateSettingsHandler);

// Vouchers Management
router.get("/vouchers/pending", getPendingVouchersHandler);
router.patch("/vouchers/:voucherId/verify", verifyVoucherHandler);
router.get("/saved-vouchers", getSavedVouchersStatsHandler);

// Risk & Fraud
router.get("/risk/users", listRiskUsersHandler);
router.get("/risk/vouchers", listRiskVouchersHandler);
router.post("/risk/analyze", triggerFraudAnalysisHandler);

// User Verification
router.get("/users/verification", listUsersForVerificationHandler);
router.patch("/users/:userId/verify", verifyUserIdentityHandler);

// Audit Logs
router.get("/audit-logs", listAuditLogsHandler);
router.patch("/audit-logs/:id/read", markAuditLogReadHandler);

// Admin payment details routes
router.get("/payment-details", getAdminPaymentDetailsHandler);
router.put("/payment-details", updateAdminPaymentDetailsHandler);

// Rewards & Leaderboard
router.get("/top-buyers", getTopBuyersHandler);
router.post("/users/:userId/rewards", assignRewardVoucherHandler);
router.get("/users/:userId/rewards", getUserRewardsHandler);
router.get("/referrals", getReferralsListHandler);

export default router;
