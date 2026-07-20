import nodemailer from 'nodemailer';
import Env from '../config/env';

// Create generic transporter
const createTransporter = () => {
    // If no credentials, we can't send real emails
    if (!Env.smtpUser || !Env.smtpPass) {
        if (Env.isDev) {
            console.warn("⚠️ SMTP credentials missing. Emails will theoretically NOT be sent.");
        }
        // We initiate it anyway, might be configured with internal relay or mock
    }

    return nodemailer.createTransport({
        host: Env.smtpHost,
        port: Env.smtpPort,
        secure: Env.smtpPort === 465, // true for 465, false for other ports
        auth: {
            user: Env.smtpUser,
            pass: Env.smtpPass,
        },
    });
};

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    try {
        // If we are in dev and have no credentials, just log it and return (to avoid crashing)
        // But if credentials EXIST, we try to send.
        if (Env.isDev) {
            console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
            if (!Env.smtpUser) {
                console.log(`[EMAIL DEV] Body: ${text || html}`);
                return true;
            }
        }

        const transporter = createTransporter();

        const info = await transporter.sendMail({
            from: `"${Env.smtpFromName}" <${Env.smtpFromEmail}>`,
            to,
            subject,
            text,
            html: html || text,
        });

        console.log(`[EMAIL] Message sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
        // In dev, don't crash the flow
        if (Env.isDev) return false;
        throw error;
    }
};
