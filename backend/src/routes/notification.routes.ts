import { Router } from "express";
import { getMyNotificationsHandler, markAsReadHandler } from "../controllers/notification.controller";

const router = Router();

router.get("/", getMyNotificationsHandler);
router.put("/:id/read", markAsReadHandler);

export default router;
