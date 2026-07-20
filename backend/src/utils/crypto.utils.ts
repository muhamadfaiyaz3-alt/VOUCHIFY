import crypto from "crypto";
import Env from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Ensure encryption key is 32 bytes
const getKey = () => {
    return Buffer.from(Env.encryptionKey, "hex");
};

export const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    // Update cipher with text
    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encrypted
    return Buffer.concat([salt, iv, tag, encrypted]).toString("hex");
};

export const decrypt = (text: string): string => {
    const buffer = Buffer.from(text, "hex");

    // Extract parts
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final("utf8");
};

/**
 * Deterministic hash for duplicate detection.
 */
export const hash = (text: string): string => {
    return crypto.createHash("sha256").update(text).digest("hex");
};

