import { AuditLogModel } from "../models/AuditLog";
import { Types } from "mongoose";

export class AuditService {
    /**
     * Log a system or admin action.
     */
    static async log(params: {
        actor: string | Types.ObjectId;
        target?: string | Types.ObjectId;
        action: string;
        details: string;
        metadata?: any;
        ipAddress?: string;
    }) {
        try {
            await AuditLogModel.create({
                actor: params.actor,
                target: params.target ? new Types.ObjectId(params.target.toString()) : undefined,
                action: params.action,
                details: params.details,
                metadata: params.metadata,
                ipAddress: params.ipAddress,
                timestamp: new Date()
            });
            console.log(`[Audit] ${params.action}: ${params.details}`);
        } catch (error) {
            console.error("[Audit Error] Failed to create audit log:", error);
        }
    }
}
