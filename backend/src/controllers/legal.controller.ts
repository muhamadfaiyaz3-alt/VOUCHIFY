import { Request, Response } from "express";

export const getTermsHandler = async (req: Request, res: Response) => {
    const termsContent = {
        lastUpdated: "December 26, 2025",
        sections: [
            {
                id: "overview",
                title: "1. Overview & Acceptance",
                content: `
                    <p>Welcome to Vouchify! These Terms of Service ("Terms") cover your use of our website, services, and applications. By creating an account or using our services, you agree to these Terms.</p>
                    <p class="mt-4"><strong>Key Principle:</strong> We are a peer-to-peer marketplace. We facilitate connections between buyers and sellers but do not own the vouchers traded unless explicitly stated.</p>
                `
            },
            {
                id: "dos-donts",
                title: "2. User Conduct: Do's and Don'ts",
                content: `
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                            <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">✅ Do's</h4>
                            <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li><strong>Verify Descriptions:</strong> Always double-check voucher values and expiry dates before listing.</li>
                                <li><strong>Report Issues:</strong> Immediately flag any suspicious activity or invalid codes to support.</li>
                                <li><strong>Use Secure Payments:</strong> Only transact through Vouchify's official payment gateways.</li>
                                <li><strong>Rate Honestly:</strong> Leave fair reviews for sellers/buyers to build community trust.</li>
                            </ul>
                        </div>
                        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                            <h4 class="font-bold text-red-700 dark:text-red-300 mb-2">❌ Don'ts</h4>
                            <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li><strong>No Off-Platform Deals:</strong> Taking transactions off Vouchify voids all protections.</li>
                                <li><strong>No Fake Listings:</strong> Posting used or invalid codes is fraud and leads to immediate banning.</li>
                                <li><strong>No Harassment:</strong> Abusive language towards other users or support staff is strictly prohibited.</li>
                                <li><strong>No Multiple Accounts:</strong> Creating duplicate accounts to manipulate ratings is forbidden.</li>
                            </ul>
                        </div>
                    </div>
                `
            },
            {
                id: "selling",
                title: "3. Selling Policy",
                content: `
                    <p>As a seller, you warrant that all vouchers listed are valid, unredeemed, and legally obtained.</p>
                    <ul class="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Payouts:</strong> Funds are held in escrow and released 24-48 hours after the buyer confirms receipt or automatically if no dispute is raised.</li>
                        <li><strong>Fees:</strong> A platform success fee (5-10%) is deducted from the final sale price.</li>
                        <li><strong>Disputes:</strong> If a buyer claims a code is invalid, you must provide proof of validity (e.g., receipt, balance screenshot) within 24 hours.</li>
                    </ul>
                `
            },
            {
                id: "buying",
                title: "4. Buying & Refunds",
                content: `
                    <p>Buyers are protected by our <strong>Money-Back Guarantee</strong>.</p>
                    <ul class="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Coverage:</strong> You are covered if the code is invalid, expired, or not as described.</li>
                        <li><strong>Claim Window:</strong> You must report issues within 48 hours of purchase.</li>
                        <li><strong>Exclusions:</strong> "Change of mind" refunds are not permitted once the code has been revealed.</li>
                    </ul>
                `
            },
            {
                id: "termination",
                title: "5. Termination & Suspension",
                content: `We reserve the right to suspend or terminate accounts for violations of these terms, suspicious activity, or upon legal request. Suspended users may appeal by contacting compliance@vouchify.com.`
            }
        ]
    };
    res.json(termsContent);
};

export const getPrivacyHandler = async (req: Request, res: Response) => {
    const privacyContent = {
        lastUpdated: "December 26, 2025",
        sections: [
            {
                id: "summary",
                title: "1. Privacy Summary",
                content: `
                    <p>Your privacy is non-negotiable. We collect only what is necessary to facilitate secure transactions and prevent fraud.</p>
                    <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p class="font-semibold text-blue-800 dark:text-blue-300">💡 Quick Takeaway:</p>
                        <p class="text-sm text-blue-700 dark:text-blue-200 mt-1">We never sell your data. We only share it with payment processors (to get you paid) and fraud detection systems (to keep you safe).</p>
                    </div>
                `
            },
            {
                id: "collection",
                title: "2. What We Collect",
                content: `
                    <ul class="list-disc pl-5 space-y-2">
                        <li><strong>Identity Data:</strong> Name, Email, Phone Number (Verified via OTP).</li>
                        <li><strong>Financial Data:</strong> Encrypted bank details/UPI IDs for payouts. We do NOT store credit card numbers (handled by Stripe/Razorpay).</li>
                        <li><strong>Transaction Data:</strong> History of vouchers bought/sold and chat logs related to disputes.</li>
                        <li><strong>Device Data:</strong> IP address and device fingerprinting for anti-fraud purposes.</li>
                    </ul>
                `
            },
            {
                id: "dos-donts-privacy",
                title: "3. Privacy Best Practices: Do's and Don'ts",
                content: `
                   <div class="grid md:grid-cols-2 gap-6">
                        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                            <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">✅ Do's</h4>
                            <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li><strong>Use Strong Passwords:</strong> Enable 2FA if available.</li>
                                <li><strong>Check URLs:</strong> Ensure you are on vouchify.com before entering credentials.</li>
                                <li><strong>Review Permissions:</strong> Only grant necessary permissions for app functionality.</li>
                            </ul>
                        </div>
                        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                            <h4 class="font-bold text-red-700 dark:text-red-300 mb-2">❌ Don'ts</h4>
                            <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li><strong>Share OTPs:</strong> Never share your login OTP with anyone, including support.</li>
                                <li><strong>Publicly Post Details:</strong> Never post email or phone numbers in public voucher descriptions.</li>
                                <li><strong>Share Account Access:</strong> Do not allow others to access your Vouchify account.</li>
                            </ul>
                        </div>
                    </div>
                `
            },
            {
                id: "usage",
                title: "4. How We Use Data",
                content: `
                    <p>We use your data mainly to:</p>
                    <ol class="list-decimal pl-5 space-y-2 mt-2">
                        <li>Process payments and payouts.</li>
                        <li>Verify identity to comply with KYC (Know Your Customer) regulations.</li>
                        <li>Detect and block fraudulent users.</li>
                        <li>Send transaction updates (e.g., "Your voucher has been sold!").</li>
                    </ol>
                `
            },
            {
                id: "rights",
                title: "5. Your Rights",
                content: `You have the right to request a copy of your data or request deletion of your account. Note that we may retain financial transaction records for up to 7 years as required by tax laws.`
            }
        ]
    };
    res.json(privacyContent);
};
