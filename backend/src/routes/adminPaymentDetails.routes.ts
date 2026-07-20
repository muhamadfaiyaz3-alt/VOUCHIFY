import express from 'express';
import { getAdminPaymentDetailsHandler, updateAdminPaymentDetailsHandler } from '../controllers/admin.controller';
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

// Public route to get details (for users to see where to pay)
router.get('/', getAdminPaymentDetailsHandler);

// Admin route to update details
router.route('/').put(authMiddleware, adminMiddleware, updateAdminPaymentDetailsHandler);

export default router;
