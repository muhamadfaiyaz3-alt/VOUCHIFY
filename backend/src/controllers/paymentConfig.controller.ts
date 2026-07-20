import { Request, Response } from 'express';
import { PaymentConfigModel } from '../models/PaymentConfig';

export const getPaymentConfig = async (req: Request, res: Response) => {
    try {
        let config = await PaymentConfigModel.findOne();
        if (!config) {
            // Create default if not exists
            config = await PaymentConfigModel.create({
                buyerDiscountPercent: 0.10,
                platformFeePercent: 0.15,
                companySharePercent: 0.05
            });
        }
        res.status(200).json(config);
    } catch (error) {
        console.error("Error fetching payment config:", error);
        res.status(500).json({ message: 'Error fetching payment config', error });
    }
};

export const updatePaymentConfig = async (req: Request, res: Response) => {
    try {
        const { buyerDiscountPercent, platformFeePercent, companySharePercent } = req.body;

        let config = await PaymentConfigModel.findOne();
        if (!config) {
            config = new PaymentConfigModel();
        }

        if (buyerDiscountPercent !== undefined) config.buyerDiscountPercent = parseFloat(buyerDiscountPercent);
        if (platformFeePercent !== undefined) config.platformFeePercent = parseFloat(platformFeePercent);
        if (companySharePercent !== undefined) config.companySharePercent = parseFloat(companySharePercent);

        // Optionally track who updated it if user info is in req
        // if ((req as any).user) config.updatedBy = (req as any).user._id;

        await config.save();
        res.status(200).json({ message: 'Payment config updated', config });
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment config', error });
    }
};
