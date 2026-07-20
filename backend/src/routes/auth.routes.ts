import { Router } from "express";
import {
    getMeHandler,
    loginHandler,
    registerHandler,
    updateMeHandler,
    googleLoginHandler,
    forgotPasswordHandler,
    verifyOtpHandler,
    resetPasswordHandler,
    recoverUsernameHandler
} from "../controllers/auth.controller";
import { toggleSaveVoucher } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/google", googleLoginHandler);
router.get("/me", authMiddleware, getMeHandler);
router.put("/me", authMiddleware, updateMeHandler);
router.post("/me/saved-vouchers", authMiddleware, toggleSaveVoucher);

// Recovery

router.post("/forgot-password", forgotPasswordHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/recover-username", recoverUsernameHandler);

export default router;
