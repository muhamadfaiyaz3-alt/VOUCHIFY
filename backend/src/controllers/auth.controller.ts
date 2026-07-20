import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";
import { sendEmail } from "../utils/emailSender";
import { loginSchema, registerSchema } from "../utils/validators";
import Env from "../config/env";

const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, Env.jwtSecret, {
        expiresIn: "7d",
    });
};

export const registerHandler = async (req: Request, res: Response) => {
    const parsed = registerSchema.parse(req.body);

    const existingUser = await UserModel.findOne({ email: parsed.email });
    if (existingUser) {
        return res
            .status(StatusCodes.CONFLICT)
            .json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    let referredBy = undefined;
    if (parsed.referralCode) {
        const referrer = await UserModel.findOne({ referralCode: parsed.referralCode });
        if (referrer) {
            referredBy = referrer._id;
        }
    }

    // Generate unique referral code
    let newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    let isUnique = false;
    while (!isUnique) {
        const existing = await UserModel.findOne({ referralCode: newReferralCode });
        if (!existing) {
            isUnique = true;
        } else {
            newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        }
    }

    const user = await UserModel.create({
        ...parsed,
        password: hashedPassword,
        role: parsed.role || "user",
        walletBalance: 0,
        referralCode: newReferralCode,
        referredBy,
    });

    const token = generateToken(user.id);

    // Remove password from response
    const userJson = user.toJSON();
    delete (userJson as any).password;

    return res.status(StatusCodes.CREATED).json({
        user: userJson,
        token,
    });
};

export const loginHandler = async (req: Request, res: Response) => {
    const parsed = loginSchema.parse(req.body);

    const user = await UserModel.findOne({ email: parsed.email }).select("+password");
    if (!user || !user.password) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(parsed.password, user.password);
    if (!isMatch) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Invalid email or password" });
    }

    if (user.isSuspended) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: "🚨 ACCOUNT SUSPENDED",
            reason: user.suspensionReason || "Your account has been suspended due to policy violations.",
        });
    }

    const token = generateToken(user.id);

    const userJson = user.toJSON();
    delete (userJson as any).password;

    return res.json({
        user: userJson,
        token,
    });
};

export const getMeHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Not authenticated" });
    }

    // Ensure referral code exists (for backward compatibility)
    if (!req.currentUser.referralCode) {
        let newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        let isUnique = false;
        while (!isUnique) {
            const existing = await UserModel.findOne({ referralCode: newReferralCode });
            if (!existing) {
                isUnique = true;
            } else {
                newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            }
        }
        req.currentUser.referralCode = newReferralCode;
        await req.currentUser.save();
    }

    const referralCount = await UserModel.countDocuments({ referredBy: req.currentUser._id });

    return res.json({
        user: {
            ...req.currentUser.toJSON(),
            referralCount
        }
    });
};

export const updateMeHandler = async (req: Request, res: Response) => {
    if (!req.currentUser) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Not authenticated" });
    }

    const { displayName, phone, businessName, bio, avatarUrl } = req.body;
    const user = req.currentUser;

    if (displayName !== undefined) user.displayName = displayName;
    if (phone !== undefined) user.phone = phone;
    if (businessName !== undefined) user.businessName = businessName;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    return res.json({ user });
};

export const googleLoginHandler = async (req: Request, res: Response) => {
    const { email, displayName, photoURL, googleUid } = req.body;

    if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required" });
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
        // Create new user
        // Generate unique referral code
        let newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        let isUnique = false;
        while (!isUnique) {
            const existing = await UserModel.findOne({ referralCode: newReferralCode });
            if (!existing) isUnique = true;
            else newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        user = await UserModel.create({
            email,
            displayName: displayName || email.split('@')[0],
            avatarUrl: photoURL,
            googleUid,
            password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
            role: "user",
            walletBalance: 0,
            referralCode: newReferralCode,
            isEmailVerified: true
        });
    } else {
        // Update existing user info if needed
        if (photoURL && !user.avatarUrl) {
            user.avatarUrl = photoURL;
            await user.save();
        }
    }

    if (user.isSuspended) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: "🚨 ACCOUNT SUSPENDED",
            reason: user.suspensionReason || "Policy violation.",
        });
    }

    const token = generateToken(user.id);
    const userJson = user.toJSON();
    delete (userJson as any).password;

    return res.json({
        user: userJson,
        token,
    });
};

// --- Password Recovery & Username Retrieval ---

export const forgotPasswordHandler = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required" });

    const user = await UserModel.findOne({ email });
    if (!user) {
        // Security: Don't reveal user existence
        return res.status(StatusCodes.OK).json({ success: true, message: "If that email exists, we've sent an OTP." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send Real Email
    try {
        const emailSent = await sendEmail({
            to: email,
            subject: "Vouchify Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111;">${otp}</span>
                    </div>
                    <p>This code expires in 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #666;">Vouchify Security Team</p>
                </div>
            `
        });
    } catch (err) {
        console.error("Failed to send OTP email:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to send OTP email. Please report this to support."
        });
    }

    return res.json({ success: true, message: "OTP sent to your email." });
};

export const verifyOtpHandler = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email and OTP are required" });

    const user = await UserModel.findOne({ email }).select("+otp +otpExpires");

    if (!user || !user.otp || !user.otpExpires) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otp !== otp) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Incorrect OTP" });
    }

    if (user.otpExpires < new Date()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "OTP expired" });
    }

    // OTP Valid - Generate Reset Token
    const resetToken = jwt.sign({ id: user._id, type: "password_reset" }, Env.jwtSecret, { expiresIn: "15m" });

    // Clear OTP logic is usually done after successful reset, but here we can keep it until reset
    // Or we allow OTP to be used once. Let's keep it for now but maybe mark it used? 
    // For simplicity, we just return the token.

    return res.json({ success: true, username: user.displayName, resetToken });
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
    const { email, newPassword, resetToken } = req.body;

    if (!newPassword || !resetToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing fields" });
    }

    try {
        const decoded: any = jwt.verify(resetToken, Env.jwtSecret);
        if (decoded.type !== "password_reset") throw new Error("Invalid token type");

        const user = await UserModel.findById(decoded.id);
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

        // Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTPs
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.json({ success: true, message: "Password reset successfully. Please login." });

    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired reset token" });
    }
};

export const recoverUsernameHandler = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email }).select("+otp +otpExpires");

    if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Success
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ success: true, username: user.displayName || "User" });
};


