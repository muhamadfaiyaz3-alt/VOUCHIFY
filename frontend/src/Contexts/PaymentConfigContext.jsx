import React, { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
import { useAuth } from "./AuthContext";

const PaymentConfigContext = createContext();

export const usePaymentConfig = () => {
    return useContext(PaymentConfigContext);
};

export const PaymentConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await client.get("/admin/settings"); // Updated endpoint
            const data = response.data;

            // Normalize: Backend stores "15" for 15%. Frontend app logic expects "0.15".
            // If data is missing (first run), use reasonable defaults.
            setConfig({
                buyerDiscountPercent: (data.buyerDiscountPercent ?? 0.50), // This is likely stored as 0.50 or 50? In admin controller step 270 I set default 50. Wait, check controller.
                // Controller step 270: buyerDiscountPercent: 50. 
                // AdminSettings.jsx step 279 sends: parseFloat(value)/100. So if slider is 50, it sends 0.5.
                // So DB has 0.5. So no division needed for Discount.

                // AdminSettings.jsx sends platformFeePercent: parseFloat(value) (e.g. 15).
                // So DB has 15. Frontend needs 0.15.
                platformFeePercent: (data.platformFeePercent ?? 15) / 100,

                // AdminSettings.jsx sends companySharePercent: parseFloat(value) (e.g. 5).
                // So DB has 5. Frontend needs 0.05.
                companySharePercent: (data.companySharePercent ?? 5) / 100
            });
            setError(null);
        } catch (err) {
            console.error("Failed to fetch payment config:", err);
            // Fallback default config if API fails
            setConfig({
                buyerDiscountPercent: 0.50, // 50%
                platformFeePercent: 0.15,   // 15%
                companySharePercent: 0.05   // 5%
            });
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (newConfig) => {
        try {
            // Note: Backend expects Integers for fees (15 not 0.15) if using AdminSettings logic.
            // But this method might be unused given AdminSettings does direct calls.
            // We just ensure it hits the right endpoint.
            await client.put("/admin/settings", newConfig);
            await fetchConfig(); // Refresh
            return { success: true };
        } catch (err) {
            console.error("Failed to update config:", err);
            return { success: false, message: err.response?.data?.message || "Update failed" };
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const value = {
        config,
        loading,
        error,
        refreshConfig: fetchConfig,
        updateConfig
    };

    return (
        <PaymentConfigContext.Provider value={value}>
            {children}
        </PaymentConfigContext.Provider>
    );
};
