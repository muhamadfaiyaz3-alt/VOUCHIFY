import { Router } from "express";
import {
    getScratchCodeHandler,
    getTransactionHandler,
    listTransactionsHandler,
    purchaseVoucherHandler,
    getAnalyticsHandler,
} from "../controllers/transaction.controller";

const router = Router();

router.get("/analytics", getAnalyticsHandler);
router.post("/purchase/:voucherId", purchaseVoucherHandler);
router.get("/", listTransactionsHandler);
router.get("/:id/scratch-code", getScratchCodeHandler);
router.get("/:id", getTransactionHandler);

export default router;
