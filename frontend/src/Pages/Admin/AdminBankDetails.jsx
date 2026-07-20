import React, { useState, useEffect } from "react";
import client from "../../api/client";
import {
    BanknotesIcon,
    UserIcon,
    PhoneIcon,
    QrCodeIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function AdminBankDetails() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        adminName: "",
        phoneNumber: "",
        upiId: "",
        instructions: ""
    });

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            const { data } = await client.get("/payment-details");
            if (data) {
                setFormData({
                    adminName: data.adminName || "",
                    phoneNumber: data.phoneNumber || "",
                    upiId: data.upiId || "",
                    instructions: data.instructions || ""
                });
            }
        } catch (err) {
            console.error("Failed to fetch payment details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await client.put("/payment-details", formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to update payment details", err);
            alert("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-indigo-500">
                <ArrowPathIcon className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans p-4 lg:p-8">
            {/* Sky Animation Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="cloud c1"></div>
                <div className="cloud c2"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-transparent dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-slate-950"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Payment Collection Details
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                        Update the bank account details shown to users for manual cash payments.
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 dark:border-slate-700 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Account Holder */}
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">
                                    Account Holder Name
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="adminName"
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                                        placeholder="e.g. Vouchify Admin"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">
                                    Phone Number / PayID
                                </label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                                        placeholder="e.g. +91 98765 43210"
                                        required
                                    />
                                </div>
                            </div>

                            {/* UPI ID */}
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">
                                    UPI ID (Optional)
                                </label>
                                <div className="relative">
                                    <QrCodeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="upiId"
                                        value={formData.upiId}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                                        placeholder="e.g. admin@upi"
                                    />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="group md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">
                                    Payment Instructions
                                </label>
                                <div className="relative">
                                    <DocumentTextIcon className="absolute left-4 top-6 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <textarea
                                        name="instructions"
                                        value={formData.instructions}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm resize-none"
                                        placeholder="Instructions for the user..."
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="flex items-center justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
                            {success && (
                                <span className="text-green-500 font-bold mr-4 animate-fade-in flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5" /> Saved Successfully!
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <BanknotesIcon className="h-5 w-5" /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Live Preview Card */}
                <div className="mt-12 opacity-80 hover:opacity-100 transition-opacity">
                    <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Live User View Preview</h3>
                    <div className="max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-6 border border-white/50 dark:border-slate-800 shadow-2xl scale-90">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BanknotesIcon className="h-5 w-5 text-indigo-500" /> Admin Bank Details
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Holder</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">{formData.adminName || "Name"}</p>
                                </div>
                                <UserIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone / PayId</p>
                                    <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{formData.phoneNumber || "Number"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
