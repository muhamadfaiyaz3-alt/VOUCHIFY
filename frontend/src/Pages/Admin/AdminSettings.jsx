import React, { useState, useEffect } from "react";
import { usePaymentConfig } from "../../Contexts/PaymentConfigContext";
import { useNotifications } from "../../Contexts/NotificationContext";
import {
    ArrowPathIcon,
    CalculatorIcon,
    BanknotesIcon,
    Cog6ToothIcon,
    CurrencyRupeeIcon,
    ReceiptPercentIcon,
    ScaleIcon,
    PresentationChartLineIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon
} from "@heroicons/react/24/outline";

export default function AdminSettings() {
    const { config, updateConfig, loading: configLoading } = usePaymentConfig();
    const { soundEnabled, toggleSound } = useNotifications();

    // Global Config State (Persisted)
    // We maintain a local state for the sliders to allow smooth dragging before saving.
    const [settings, setSettings] = useState({
        platformFeePercent: 15,
        companySharePercent: 5,
        buyerDiscountPercent: 0.50
    });

    // Simulator State (Visual Only, but inputs now in Left Column)
    const [simOriginalPrice, setSimOriginalPrice] = useState(10);
    const [saving, setSaving] = useState(false);

    // Sync from Global Context when loaded or updated externally
    useEffect(() => {
        if (config) {
            setSettings({
                // Context provides Decimals (0.15), UI Sliders need Integers (15)
                platformFeePercent: (config.platformFeePercent || 0) * 100,
                companySharePercent: (config.companySharePercent || 0) * 100,
                // Context provides Decimal for discount (0.50), UI logic below handles scalar
                buyerDiscountPercent: config.buyerDiscountPercent || 0.50
            });
        }
    }, [config]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // We send Integers for fees (15) and Decimal for discount (0.50) to match Backend/Context expectations.
            // validPayload will be what is sent to backend.
            const validPayload = {
                platformFeePercent: settings.platformFeePercent,
                companySharePercent: settings.companySharePercent,
                buyerDiscountPercent: settings.buyerDiscountPercent
            };

            const result = await updateConfig(validPayload);
            if (result.success) {
                alert("Configuration updated successfully! App contexts refreshed.");
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    // --- CALCULATIONS FOR PREVIEW (Uses LIVE inputs) ---

    // settings.buyerDiscountPercent is 0.50. Slider uses 50.
    const discountAmount = simOriginalPrice * settings.buyerDiscountPercent;

    // Listing Price (What Buyer Pays)
    const listingPrice = simOriginalPrice - discountAmount;

    // Platform Fee (Based on Listing Price, not Original)
    // Formula: Fee = ListingPrice * (Percent / 100)
    // settings.platformFeePercent is 15.
    const platformFeeAmount = listingPrice * (settings.platformFeePercent / 100);

    // Company Share (Based on Listing Price)
    const companyShareAmount = listingPrice * (settings.companySharePercent / 100);

    // Net Payout
    const netPayout = listingPrice - platformFeeAmount - companyShareAmount;


    if (configLoading && !config) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <ArrowPathIcon className="h-12 w-12 text-indigo-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-gray-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight mb-2">
                            Revenue Ratio Engine
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 font-medium max-w-2xl">
                            Adjust global allocation ratios. The preview on the right updates in real-time.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 min-w-[200px] justify-center"
                    >
                        {saving ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <Cog6ToothIcon className="h-5 w-5" />}
                        {saving ? "Deploying..." : "Save Ratios"}
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: RATIO ALLOCATION (Inputs) */}
                    <div className="xl:col-span-5 space-y-6">

                        {/* --- NEW: ADMIN PREFERENCES --- */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-slate-700/50 relative overflow-hidden">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4">
                                <Cog6ToothIcon className="h-6 w-6 text-indigo-500" /> Admin Preferences
                            </h2>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${soundEnabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-200 text-gray-500 dark:bg-slate-600 dark:text-slate-400'}`}>
                                        {soundEnabled ? <SpeakerWaveIcon className="h-6 w-6" /> : <SpeakerXMarkIcon className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notification Sound</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Audio alert on new activity</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleSound}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${soundEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>



                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-slate-700/50 relative overflow-hidden">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4">
                                <ScaleIcon className="h-6 w-6 text-indigo-500" /> Ratio Allocation
                            </h2>

                            <div className="space-y-8">

                                {/* 1. Simulator Base Price (Input) */}
                                <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                        Test Original Price (₹)
                                    </label>
                                    <div className="relative">
                                        <CurrencyRupeeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={simOriginalPrice}
                                            onChange={(e) => setSimOriginalPrice(parseFloat(e.target.value) || 0)}
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-12 pr-4 text-xl font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2">Adjust this to test scenarios. Not saved.</p>
                                </div>

                                {/* 2. Discount Slider (Global Setting) */}
                                <div className="group">
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                            Buyer Discount
                                            <span className="text-[10px] bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded-full">Global</span>
                                        </label>
                                        <div className="text-3xl font-black text-pink-500 font-mono">
                                            {(settings.buyerDiscountPercent * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="90"
                                        step="5"
                                        value={settings.buyerDiscountPercent * 100}
                                        onChange={(e) => setSettings({ ...settings, buyerDiscountPercent: parseFloat(e.target.value) / 100 })}
                                        className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                                    />
                                </div>

                                {/* 3. Platform Fee Slider */}
                                <div className="group pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                                Platform Fee
                                            </label>
                                            <p className="text-[10px] text-gray-400">On Listing Price</p>
                                        </div>
                                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                                            {settings.platformFeePercent}%
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        step="0.5"
                                        value={settings.platformFeePercent}
                                        onChange={(e) => setSettings({ ...settings, platformFeePercent: parseFloat(e.target.value) })}
                                        className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                                    />
                                </div>

                                {/* 4. Company Share Slider */}
                                <div className="group">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                                Company Share
                                            </label>
                                            <p className="text-[10px] text-gray-400">On Listing Price</p>
                                        </div>
                                        <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                                            {settings.companySharePercent}%
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="30"
                                        step="0.5"
                                        value={settings.companySharePercent}
                                        onChange={(e) => setSettings({ ...settings, companySharePercent: parseFloat(e.target.value) })}
                                        className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW BOX MODEL (Output Only) */}
                    <div className="xl:col-span-7">
                        <div className="sticky top-8">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-700">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                                <div className="p-8 md:p-12 relative z-10">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest flex items-center gap-3">
                                            <CalculatorIcon className="h-6 w-6" /> Payout Preview
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs font-mono text-green-400">Live Sync</span>
                                        </div>
                                    </div>

                                    {/* The Box Model Flow */}
                                    <div className="space-y-4 font-mono text-base md:text-lg">

                                        {/* 1. Original */}
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-gray-400 text-sm md:text-base">Original Value</span>
                                            <span className="font-bold text-2xl">₹{simOriginalPrice.toFixed(2)}</span>
                                        </div>

                                        {/* 2. Discount */}
                                        <div className="flex justify-between items-center px-4 py-2 text-pink-400">
                                            <span className="text-sm flex items-center gap-2"><ReceiptPercentIcon className="w-4 h-4" /> Discount ({(settings.buyerDiscountPercent * 100).toFixed(0)}%)</span>
                                            <span className="font-bold text-xl">- ₹{discountAmount.toFixed(2)}</span>
                                        </div>

                                        {/* Divider / Result Line for Listing Price */}
                                        <div className="my-2 border-t border-dashed border-white/20"></div>

                                        {/* 3. Listing Price */}
                                        <div className="flex justify-between items-center p-5 bg-indigo-600/20 border border-indigo-500/50 rounded-2xl shadow-lg ring-1 ring-indigo-500/20">
                                            <div>
                                                <span className="text-indigo-200 font-bold block uppercase text-xs tracking-wider">Listing Price</span>
                                                <span className="text-[10px] text-indigo-300/70">Base for fees</span>
                                            </div>
                                            <span className="text-3xl font-black text-white">₹{listingPrice.toFixed(2)}</span>
                                        </div>

                                        {/* 4. Fees */}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                                                <span className="block text-[10px] text-orange-400 uppercase font-bold mb-1">Platform Fee ({settings.platformFeePercent}%)</span>
                                                <span className="block text-xl font-bold text-orange-200">- ₹{platformFeeAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                                                <span className="block text-[10px] text-purple-400 uppercase font-bold mb-1">Company Share ({settings.companySharePercent}%)</span>
                                                <span className="block text-xl font-bold text-purple-200">- ₹{companyShareAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="my-4 border-t-2 border-white/10"></div>

                                        {/* 5. Net Payout */}
                                        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 rounded-3xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full -mr-10 -mt-10"></div>
                                            <div className="relative z-10">
                                                <span className="text-emerald-300 font-bold uppercase tracking-wider text-xs block mb-1">Total Payout</span>
                                                <span className="text-white text-sm opacity-80">Credited to Seller</span>
                                            </div>
                                            <span className="relative z-10 text-5xl font-black text-emerald-400 drop-shadow-lg">₹{netPayout.toFixed(2)}</span>
                                        </div>

                                        <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
                                            * Processed within 24hrs of verified sale
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
