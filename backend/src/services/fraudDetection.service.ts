import { VoucherModel, IVoucher } from "../models/Voucher";
import { UserModel } from "../models/User";
import { TransactionModel } from "../models/Transaction";
import { VoucherArchiveModel } from "../models/VoucherArchive";
import { FraudIncidentModel } from "../models/FraudIncident";
import { NotificationModel } from "../models/Notification";
import { AuditService } from "./audit.service";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export class FraudDetectionService {

    /**
     * Log a fraud incident and potentially trigger enforcement.
     */
    static async logIncident(data: {
        userId: string;
        voucherId?: string;
        type: "DUPLICATE_CODE" | "ABNORMAL_DISCOUNT" | "SUSPICIOUS_UPLOAD" | "FAILED_AUTH_LIMIT" | "OTHER";
        severity: RiskLevel;
        evidence: string;
    }) {
        const incident = await FraudIncidentModel.create({
            user: data.userId,
            voucher: data.voucherId,
            type: data.type,
            severity: data.severity,
            evidence: data.evidence,
        });

        // 1. Notify Admins
        console.log(`[ALERT] Fraud Incident detected: ${data.type} by User ${data.userId}. Severity: ${data.severity}`);

        await AuditService.log({
            actor: "SYSTEM",
            target: data.userId,
            action: "FRAUD_INCIDENT_LOGGED",
            details: `Detected ${data.type} incident. Evidence: ${data.evidence}`,
            metadata: { severity: data.severity, voucherId: data.voucherId }
        });

        // 2. Automated First-Level Warning for Low/Medium
        if (data.severity === "Low" || data.severity === "Medium") {
            await NotificationModel.create({
                user: data.userId,
                message: `⚠️ SECURITY WARNING: Our system detected ${data.evidence.toLowerCase()}. Continued violations may lead to account suspension.`,
                type: "error"
            });
        }

        return incident;
    }

    /**
     * Analyze a voucher for potential fraud.
     */
    static async analyzeVoucher(voucherId: string): Promise<{
        score: number,
        level: RiskLevel,
        findings: string[]
    }> {
        const voucher = await VoucherModel.findById(voucherId).select("+scratchCodeHash");

        if (!voucher) throw new Error("Voucher not found");

        let score = 0;
        const findings: string[] = [];

        // 1. Duplicate Detection (Code Reuse)
        if (voucher.scratchCodeHash) {
            const duplicateInActive = await VoucherModel.countDocuments({
                _id: { $ne: voucher._id },
                scratchCodeHash: voucher.scratchCodeHash
            });

            if (duplicateInActive > 0) {
                score += 80;
                const evidence = `Duplicate code found in ${duplicateInActive} other active vouchers.`;
                findings.push(evidence);
                await this.logIncident({
                    userId: voucher.owner.toString(),
                    voucherId: voucher._id.toString(),
                    type: "DUPLICATE_CODE",
                    severity: "Critical",
                    evidence
                });
            }

            const duplicateInArchives = await VoucherArchiveModel.countDocuments({
                "history.scratchCodeHash": voucher.scratchCodeHash
            });
            if (duplicateInArchives > 0) {
                score += 50;
                const evidence = `Duplicate code found in ${duplicateInArchives} archived vouchers.`;
                findings.push(evidence);
                await this.logIncident({
                    userId: voucher.owner.toString(),
                    voucherId: voucher._id.toString(),
                    type: "DUPLICATE_CODE",
                    severity: "High",
                    evidence
                });
            }
        }


        // 2. Abnormal Discount Analysis
        if (voucher.discountPercent > 0.95) {
            score += 40;
            const evidence = "Abnormally high discount percentage (> 95%).";
            findings.push(evidence);
            await this.logIncident({
                userId: voucher.owner.toString(),
                voucherId: voucher._id.toString(),
                type: "ABNORMAL_DISCOUNT",
                severity: "Medium",
                evidence
            });
        }

        // 3. Suspicious Upload Patterns
        const recentVouchersFromSeller = await VoucherModel.countDocuments({
            owner: voucher.owner,
            createdAt: { $gte: new Date(Date.now() - 3600000) }
        });
        if (recentVouchersFromSeller > 10) {
            score += 30;
            const evidence = `Seller uploaded ${recentVouchersFromSeller} vouchers in the last hour.`;
            findings.push(evidence);
            await this.logIncident({
                userId: voucher.owner.toString(),
                type: "SUSPICIOUS_UPLOAD",
                severity: "Medium",
                evidence
            });
        }

        // 4. Failed Authentication attempts
        if (voucher.attempts > 5) {
            score += 20;
            const evidence = `High number of authentication attempts (${voucher.attempts}).`;
            findings.push(evidence);
            await this.logIncident({
                userId: voucher.owner.toString(),
                voucherId: voucher._id.toString(),
                type: "FAILED_AUTH_LIMIT",
                severity: "Low",
                evidence
            });
        }

        // Determine Level
        let level: RiskLevel = "Low";
        if (score >= 80) level = "Critical";
        else if (score >= 50) level = "High";
        else if (score >= 20) level = "Medium";

        // Update Voucher
        voucher.fraudRiskScore = Math.min(score, 100);
        voucher.fraudRiskLevel = level;

        // If critical level detected, deactivate voucher immediately
        if (level === "Critical") {
            voucher.isActive = false;
            voucher.status = "rejected";
            voucher.rejectionReason = "Deactivated due to critical fraud risk level.";
        }

        await voucher.save();

        return { score, level, findings };
    }

    /**
     * Analyze a user for fraudulent behavior.
     */
    static async analyzeUser(userId: string): Promise<{
        score: number,
        level: RiskLevel,
        isSuspended: boolean
    }> {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        let score = 0;

        const vouchers = await VoucherModel.find({ owner: userId });
        const highRiskVouchers = vouchers.filter(v => v.fraudRiskLevel === "High" || v.fraudRiskLevel === "Critical").length;

        if (highRiskVouchers > 0) score += highRiskVouchers * 20;
        if (highRiskVouchers > 5) score += 50;

        const failedTransactions = await TransactionModel.countDocuments({
            buyer: userId,
            status: "failed"
        });
        if (failedTransactions > 5) score += 30;

        let level: RiskLevel = "Low";
        if (score >= 100) level = "Critical";
        else if (score >= 60) level = "High";
        else if (score >= 30) level = "Medium";

        user.fraudRiskScore = Math.min(score, 100);
        user.fraudRiskLevel = level;

        // Trust Score Impact
        if (level === "Critical") user.trustScore = Math.max(user.trustScore - 50, 0);
        else if (level === "High") user.trustScore = Math.max(user.trustScore - 20, 0);
        else if (level === "Medium") user.trustScore = Math.max(user.trustScore - 10, 0);

        let isSuspended = user.isSuspended;
        if (level === "Critical" && !user.isSuspended) {
            isSuspended = true;
            user.isSuspended = true;
            user.suspensionReason = "Automatic suspension due to critical fraud risk score.";

            await AuditService.log({
                actor: "SYSTEM",
                target: user._id,
                action: "USER_SUSPENDED",
                details: "Automated account suspension due to critical risk levels.",
            });

            await this.logIncident({
                userId: user._id.toString(),
                type: "OTHER",
                severity: "Critical",
                evidence: "Automated account suspension due to system-wide risk analysis."
            });
        }

        await user.save();

        return { score: user.fraudRiskScore, level, isSuspended };
    }

    /**
     * Increment failed authentication attempt for a voucher.
     */
    static async reportFailedAttempt(voucherId: string) {
        const voucher = await VoucherModel.findByIdAndUpdate(voucherId, {
            $inc: { attempts: 1 }
        }, { new: true });

        if (voucher && voucher.attempts > 10) {
            await this.analyzeVoucher(voucherId);
        }
    }
}
