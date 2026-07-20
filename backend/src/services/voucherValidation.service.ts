import { VoucherModel, IVoucher } from "../models/Voucher";
import { UserModel } from "../models/User";
import { FraudDetectionService } from "./fraudDetection.service";
import { hash } from "../utils/crypto.utils";
import { VoucherArchiveModel } from "../models/VoucherArchive";

// Regex patterns for common brands
const BRAND_PATTERNS: Record<string, RegExp> = {
    "amazon": /^[A-Z0-9]{4}-[A-Z0-9]{6}-[A-Z0-9]{4}$/i,
    "flipkart": /^[A-Z0-9]{15,16}$/i,
    "myntra": /^[A-Z0-9]{16}$/i,
    // overly strict google_play removed to allow variations
    "uber": /^[A-Z0-9]{10,12}$/i,
    "zomato": /^[A-Z0-9]{10,16}$/i, // Relaxed length
    "swiggy": /^[A-Z0-9]{10,16}$/i, // Relaxed length
    // Allow broader set of chars for default: A-Z, 0-9, and common separators like - _ . @
    // Length 4 to 64 to cover short pins and long tokens
    "default": /^[A-Z0-9-_@.]{4,64}$/i
};

const DUMMY_STRINGS = [
    "12345", "ABCDE", "TEST", "DUMMY", "PLACEHOLDER", "PASSWORD", "VOUCHER", "SCRATCH", "CODE",
    "11111", "00000", "123123", "ADMIN", "ROOT"
];

export class VoucherValidationService {

    /**
     * Check if a code is a common dummy/placeholder.
     */
    static isDummyCode(code: string): boolean {
        const normalized = code.toUpperCase().trim();

        // 1. Common patterns
        if (DUMMY_STRINGS.some(ds => normalized.includes(ds))) return true;

        // 2. Repeating characters (e.g., AAAAAA, 111111)
        if (/^(.)\1{4,}$/.test(normalized)) return true;

        // 3. Sequential characters (e.g., 123456, ABCDEF)
        const sequence = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < sequence.length - 5; i++) {
            const sub = sequence.substring(i, i + 6);
            if (normalized.includes(sub)) return true;
        }

        // 4. Low Entropy (very few unique characters for long string)
        const uniqueChars = new Set(normalized.split("")).size;
        if (normalized.length > 10 && uniqueChars < 4) return true;

        return false;
    }

    /**
     * Check for duplicates across active and archived vouchers.
     */
    static async checkDuplicates(code: string, currentVoucherId?: string): Promise<{
        isDuplicate: boolean;
        location: "ACTIVE" | "ARCHIVE" | "NONE";
    }> {
        const codeHash = hash(code);

        // Check active
        const query: any = { scratchCodeHash: codeHash };
        if (currentVoucherId) query._id = { $ne: currentVoucherId };

        const activeExists = await VoucherModel.exists(query);
        if (activeExists) return { isDuplicate: true, location: "ACTIVE" };

        // Check archive
        const archiveExists = await VoucherArchiveModel.exists({ "history.scratchCodeHash": codeHash });
        if (archiveExists) return { isDuplicate: true, location: "ARCHIVE" };

        return { isDuplicate: false, location: "NONE" };
    }

    /**
     * Validate the format of the voucher code based on the brand.
     */
    static validateFormat(brand: string, code: string): boolean {
        const normalizedBrand = brand.toLowerCase().replace(/\s+/g, '_');
        const pattern = BRAND_PATTERNS[normalizedBrand] || BRAND_PATTERNS["default"];
        return !!pattern && pattern.test(code.trim());
    }

    /**
     * Perform a deep validation of a voucher for a user.
     * Includes real-time authentication, locking, and ownership cross-checks.
     */
    static async validateForUsage(voucherId: string, userId: string): Promise<{
        isValid: boolean;
        message: string;
        voucher?: IVoucher;
    }> {
        // Atomic lock to avoid race conditions
        const voucher = await VoucherModel.findOneAndUpdate(
            {
                _id: voucherId,
                isLocked: false,
                status: "published",
                isActive: true
            },
            { isLocked: true },
            { new: true }
        ).populate("owner");

        if (!voucher) {
            const exists = await VoucherModel.findById(voucherId);
            if (!exists) return { isValid: false, message: "Voucher not found." };
            if (exists.isLocked) return { isValid: false, message: "⚠️ Voucher is currently being processed." };
            if (exists.status !== "published") return { isValid: false, message: `❌ Voucher status is ${exists.status.toUpperCase()}.` };
            return { isValid: false, message: "❌ Voucher is not available." };
        }

        try {
            // Real-time authentication checks
            const now = new Date();
            if (voucher.expiryDate < now) {
                voucher.status = "expired";
                voucher.isLocked = false;
                await voucher.save();
                return { isValid: false, message: "❌ Voucher has expired.", voucher };
            }

            // Cross-check ownership (You can't buy your own voucher)
            if (voucher.owner._id.toString() === userId) {
                voucher.isLocked = false;
                await voucher.save();
                return { isValid: false, message: "❌ Security Check: You cannot purchase your own voucher.", voucher };
            }

            // Seller Compliance Check
            const seller = voucher.owner as any;
            if (!seller || seller.isSuspended) {
                voucher.isLocked = false;
                await voucher.save();
                return { isValid: false, message: "❌ Seller account is currently suspended for violations.", voucher };
            }

            // Usage Limits
            if (voucher.quantity <= 0) {
                voucher.status = "sold_out";
                voucher.isLocked = false;
                await voucher.save();
                return { isValid: false, message: "❌ Voucher is sold out.", voucher };
            }

            // Trust Verification (Fraud Engine Integration)
            if (voucher.fraudRiskLevel === "Critical" || voucher.fraudRiskLevel === "High") {
                voucher.isLocked = false;
                await voucher.save();
                return { isValid: false, message: "⚠️ Voucher Under Review due to high risk score.", voucher };
            }

            // Success: Keep locked until caller finishes the purchase/redemption flow
            return { isValid: true, message: "✅ Voucher Verified & Accepted", voucher };

        } catch (error) {
            voucher.isLocked = false;
            await voucher.save();
            throw error;
        }
    }

    /**
     * Unlock a voucher manually.
     */
    static async unlockVoucher(voucherId: string) {
        await VoucherModel.findByIdAndUpdate(voucherId, { isLocked: false });
    }

    /**
     * Perform a full verification check including fraud analysis.
     */
    static async verifyAndAnalyze(voucherId: string): Promise<any> {
        const fraudAnalysis = await FraudDetectionService.analyzeVoucher(voucherId);
        const voucher = await VoucherModel.findById(voucherId);
        if (!voucher) return null;

        const userAnalysis = await FraudDetectionService.analyzeUser(voucher.owner.toString());

        if (fraudAnalysis.level === "Critical" || userAnalysis.level === "Critical") {
            voucher.verificationStatus = "REJECTED";
            voucher.rejectionReason = "Automatic rejection due to critical fraud risk.";
            voucher.status = "rejected";
            voucher.isActive = false;
            await voucher.save();
        }

        return { voucher, fraudAnalysis, userAnalysis };
    }
}

