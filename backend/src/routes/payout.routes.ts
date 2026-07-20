import { Router } from "express";
import {
    listPayoutsHandler,
    processPayoutHandler,
    requestPayoutHandler,
    addPayoutQueryHandler,
    bulkProcessPayoutHandler
} from "../controllers/payout.controller";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

router.get("/", listPayoutsHandler);
router.post("/request", requestPayoutHandler);

// Admin only
router.post("/bulk-process", adminMiddleware, bulkProcessPayoutHandler);
router.patch("/:id/process", adminMiddleware, processPayoutHandler);
router.post("/:id/query", addPayoutQueryHandler);

export default router;
