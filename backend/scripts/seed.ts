import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { UserModel } from "../src/models/User";
import { VoucherModel } from "../src/models/Voucher";
import { TransactionModel } from "../src/models/Transaction";
import { PayoutModel } from "../src/models/Payout";
import { encrypt } from "../src/utils/crypto.utils";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://root:12345@cluster1.hhqtg3p.mongodb.net/vouchify";

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

        // Clear existing data
        await UserModel.deleteMany({});
        await VoucherModel.deleteMany({});
        await TransactionModel.deleteMany({});
        await PayoutModel.deleteMany({});
        console.log("Cleared existing data");

        const hashedPassword = await bcrypt.hash("password123", 10);

        // Create Admin
        const admin = await UserModel.create({
            email: "admin@vouchify.com",
            password: hashedPassword,
            displayName: "Admin User",
            role: "admin",
            walletBalance: 1000,
        });
        console.log("Created Admin:", admin.email);

        // Create Sellers
        const seller1 = await UserModel.create({
            email: "seller1@example.com",
            password: hashedPassword,
            displayName: "Tech Store",
            role: "user", // Sellers are just users who list items
            walletBalance: 0,
        });
        const seller2 = await UserModel.create({
            email: "seller2@example.com",
            password: hashedPassword,
            displayName: "Fashion Hub",
            role: "user",
            walletBalance: 500,
        });
        console.log("Created Sellers");

        // Create Buyers
        const buyer1 = await UserModel.create({
            email: "buyer1@example.com",
            password: hashedPassword,
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
                scratchCode: encrypt("AMZ-1234-5678"),
                owner: seller1._id,
                status: "published",
                isApproved: true,
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
                scratchCode: encrypt("MYN-SALE-2023"),
                owner: seller2._id,
                status: "published",
                isApproved: true,
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
                scratchCode: encrypt("PENDING-CODE"),
                owner: seller1._id,
                status: "draft",
            }
        ];

        await VoucherModel.insertMany(vouchers);
        console.log("Created Vouchers");

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seed();
