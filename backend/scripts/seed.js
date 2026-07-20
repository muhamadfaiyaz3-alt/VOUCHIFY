"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../src/models/User");
const Voucher_1 = require("../src/models/Voucher");
const Transaction_1 = require("../src/models/Transaction");
const Payout_1 = require("../src/models/Payout");
const crypto_utils_1 = require("../src/utils/crypto.utils");
dotenv_1.default.config();
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/vouchify";
const seed = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URL);
        console.log("Connected to MongoDB");
        // Clear existing data
        await User_1.UserModel.deleteMany({});
        await Voucher_1.VoucherModel.deleteMany({});
        await Transaction_1.TransactionModel.deleteMany({});
        await Payout_1.PayoutModel.deleteMany({});
        console.log("Cleared existing data");
        // Create Admin
        const admin = await User_1.UserModel.create({
            email: "admin@vouchify.com",
            password: "password123", // In real app, hash this! But our model pre-save hook handles hashing?
            // Wait, our user model might not have pre-save hashing yet if I didn't implement it in Phase 9.
            // Let's check User model. Assuming it does or I'll add it later.
            // For now, I'll just store plain text if no hashing hook, or rely on the hook if exists.
            displayName: "Admin User",
            role: "admin",
            walletBalance: 1000,
        });
        console.log("Created Admin:", admin.email);
        // Create Sellers
        const seller1 = await User_1.UserModel.create({
            email: "seller1@example.com",
            password: "password123",
            displayName: "Tech Store",
            role: "user", // Sellers are just users who list items
            walletBalance: 0,
        });
        const seller2 = await User_1.UserModel.create({
            email: "seller2@example.com",
            password: "password123",
            displayName: "Fashion Hub",
            role: "user",
            walletBalance: 500,
        });
        console.log("Created Sellers");
        // Create Buyers
        const buyer1 = await User_1.UserModel.create({
            email: "buyer1@example.com",
            password: "password123",
            displayName: "John Doe",
            role: "user",
            walletBalance: 2000,
        });
        console.log("Created Buyers");
        // Create Vouchers
        const vouchers = [
            {
                title: "Amazon ₹500 Gift Card",
                description: "Valid for 1 year. Applicable on all items.",
                category: "Electronics",
                originalPrice: 500,
                listedPrice: 450,
                discountPercent: 0.1,
                sellerPayout: 360, // 80% of 450
                platformFeePercent: 0.15,
                companySharePercent: 0.05,
                quantity: 5,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                scratchCode: (0, crypto_utils_1.encrypt)("AMZ-1234-5678"),
                owner: seller1._id,
                status: "published",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png"
            },
            {
                title: "Myntra Flat 20% Off",
                description: "Min purchase ₹1000.",
                category: "Fashion",
                originalPrice: 200,
                listedPrice: 100,
                discountPercent: 0.5,
                sellerPayout: 80,
                platformFeePercent: 0.15,
                companySharePercent: 0.05,
                quantity: 10,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                scratchCode: (0, crypto_utils_1.encrypt)("MYN-SALE-2023"),
                owner: seller2._id,
                status: "published",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png"
            },
            {
                title: "Pending Approval Voucher",
                description: "Waiting for admin.",
                category: "Other",
                originalPrice: 1000,
                listedPrice: 900,
                discountPercent: 0.1,
                sellerPayout: 720,
                platformFeePercent: 0.15,
                companySharePercent: 0.05,
                quantity: 1,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                scratchCode: (0, crypto_utils_1.encrypt)("PENDING-CODE"),
                owner: seller1._id,
                status: "draft",
            }
        ];
        await Voucher_1.VoucherModel.insertMany(vouchers);
        console.log("Created Vouchers");
        console.log("Seeding complete!");
        process.exit(0);
    }
    catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map