import { Request, Response } from "express";

export const getFAQHandler = async (req: Request, res: Response) => {
    // In a real app, this could be fetched from a database (FAQModel)
    // For now, we serve a comprehensive, categorized list dynamically
    const faqs = [
        {
            category: "General",
            questions: [
                {
                    id: "g1",
                    question: "What is Vouchify exactly?",
                    answer: "Vouchify is a secure peer-to-peer marketplace that allows you to sell your unused gift cards and vouchers for cash, or buy them at a discount. We act as the trusted middleman to ensure safety for both parties."
                },
                {
                    id: "g2",
                    question: "Is Vouchify free to use?",
                    answer: "Browsing and listing vouchers is free! We only charge a small platform fee (typically 5-10%) when a transaction is successfully completed to cover secure payment processing and buyer protection."
                },
                {
                    id: "g3",
                    question: "Is it safe to share my voucher codes?",
                    answer: "Never share your voucher code in the public description! On Vouchify, your code is encrypted and hidden. It is only revealed to the buyer *after* we have secured their payment."
                }
            ]
        },
        {
            category: "Buying",
            questions: [
                {
                    id: "b1",
                    question: "How do I receive the voucher after payment?",
                    answer: "Instantly! Once your payment is verified, the secure scratch code is revealed on your 'Transaction History' page and also sent to your email."
                },
                {
                    id: "b2",
                    question: "What if the voucher code doesn't work?",
                    answer: "We offer a 48-hour Money-Back Guarantee. If a code is invalid, you can raise a dispute immediately. Our team pauses the payout to the seller and investigates. If the code is proven bad, you get a full refund."
                },
                {
                    id: "b3",
                    question: "Can I return a voucher I bought by mistake?",
                    answer: "Unfortunately, due to the nature of digital codes, we cannot accept returns for 'change of mind' once the code has been revealed, as it cannot be un-seen."
                }
            ]
        },
        {
            category: "Selling",
            questions: [
                {
                    id: "s1",
                    question: "How do I get paid?",
                    answer: "We support direct bank transfers (NEFT/IMPS) and UPI. You can set your payout preferences in your Profile. Payouts are processed 24-48 hours after the buyer confirms the purchase."
                },
                {
                    id: "s2",
                    question: "How do I price my voucher?",
                    answer: "We recommend pricing it at 10-20% off the face value to attract buyers quickly. For example, sell a ₹1000 Amazon card for ₹850 or ₹900."
                },
                {
                    id: "s3",
                    question: "Can I edit my listing after posting?",
                    answer: "Yes, you can edit the price or description from your 'My Vouchers' dashboard, as long as the voucher hasn't been sold yet."
                }
            ]
        },
        {
            category: "Security",
            questions: [
                {
                    id: "sec1",
                    question: "How does Vouchify prevent fraud?",
                    answer: "We use AI-driven fraud detection to flag suspicious users. We also hold payments in escrow—money isn't released to the seller until the voucher is delivered, and the voucher isn't released to the buyer until payment is secured."
                },
                {
                    id: "sec2",
                    question: "Do I need to verify my identity?",
                    answer: "For high-value transactions or frequent sellers, we may request a one-time KYC (Government ID) verification to ensure the platform remains safe for everyone."
                }
            ]
        }
    ];

    res.json(faqs);
};
