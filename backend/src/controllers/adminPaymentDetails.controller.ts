import { Request, Response } from 'express';
import { AdminPaymentDetailsModel } from '../models/AdminPaymentDetails';

export const getPaymentDetails = async (req: Request, res: Response) => {
    try {
        let details = await AdminPaymentDetailsModel.findOne();
        if (!details) {
            // Create default
            details = await AdminPaymentDetailsModel.create({
                adminName: "Vouchify Admin",
                phoneNumber: "+91 0000000000",
                instructions: "Please pay the amount."
            });
        }
        res.status(200).json(details);
    } catch (error) {
        console.error("Error fetching admin payment details:", error);
        res.status(500).json({ message: "Failed to fetch payment details" });
    }
};

export const updatePaymentDetails = async (req: Request, res: Response) => {
    try {
        const updateData = req.body;
        // Use findOneAndUpdate with upsert: true to create if not exists
        const details = await AdminPaymentDetailsModel.findOneAndUpdate(
            {},
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json(details);
    } catch (error) {
        console.error("Error updating admin payment details:", error);
        res.status(500).json({ message: "Failed to update payment details" });
    }
};
