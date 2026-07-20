import { Router } from 'express';
import { getPaymentConfig, updatePaymentConfig } from '../controllers/paymentConfig.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.get('/', getPaymentConfig);
// Update should probably be protected and admin only
router.put('/', authMiddleware, adminMiddleware, updatePaymentConfig);

export default router;
