import { Router } from "express";
import { createReviewHandler, listReviewsHandler } from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createReviewHandler);
router.get("/", listReviewsHandler);

export default router;
