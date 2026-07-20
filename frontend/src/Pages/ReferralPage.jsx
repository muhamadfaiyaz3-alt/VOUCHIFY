import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    UserGroupIcon,
    GiftIcon,
    CurrencyRupeeIcon,
    ClipboardDocumentCheckIcon,
    ClipboardIcon,
    ShareIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../Contexts/AuthContext";

export default function ReferralPage() {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    // Mock referral data - In a real app, this would be dynamic based on the user's ID or unique code
    const referralCode = user?.displayName ? `${user.displayName.toUpperCase().slice(0, 4)}2024` : "VOUCH2024";
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Invite Friends & <span className="text-indigo-600">Earn Rewards</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Spread the word about Vouchify! Help your friends discover great deals and earn exclusive perks for every successful referral.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 border border-gray-100">
                    <div className="bg-indigo-600 px-8 py-10 text-center relative overflow-hidden">
                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 -ml-10 -mt-10 h-32 w-32 rounded-full bg-white opacity-10 blur-xl"></div>
                        <div className="absolute bottom-0 right-0 -mr-10 -mb-10 h-32 w-32 rounded-full bg-white opacity-10 blur-xl"></div>

                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Your Unique Referral Link</h2>
                        <p className="text-indigo-100 mb-8 relative z-10">Share this link with your friends to get started.</p>

                        <div className="bg-white rounded-xl p-2 flex items-center shadow-lg max-w-lg mx-auto relative z-10">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-600 font-medium px-4 truncate"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                {copied ? (
                                    <>
                                        <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <ClipboardIcon className="h-5 w-5" />
                                        Copy Link
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="p-8 text-center hover:bg-gray-50 transition">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShareIcon className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">1. Send Invitation</h3>
                            <p className="text-gray-500 text-sm">copy your link and share it via WhatsApp, Email, or Social Media.</p>
                        </div>
                        <div className="p-8 text-center hover:bg-gray-50 transition">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">2. Friend Joins</h3>
                            <p className="text-gray-500 text-sm">Your friend signs up using your link and purchases their first voucher.</p>
                        </div>
                        <div className="p-8 text-center hover:bg-gray-50 transition">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GiftIcon className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">3. Earn Rewards</h3>
                            <p className="text-gray-500 text-sm">You both get ₹50 credit in your Vouchify wallet instantly!</p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-8 text-white shadow-lg transform hover:-translate-y-1 transition duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Power Seller Status</h3>
                                <p className="text-orange-100">Unlock lower platform fees by referring more users.</p>
                            </div>
                            <CurrencyRupeeIcon className="h-12 w-12 text-white opacity-80" />
                        </div>
                        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Current Fee</span>
                                <span className="font-bold">15%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-yellow-200">After 5 Referrals</span>
                                <span className="font-bold text-white text-lg">10%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Referral Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                    <span className="font-medium text-gray-700">Total Referrals</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">0</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CurrencyRupeeIcon className="h-6 w-6 text-gray-400" />
                                    <span className="font-medium text-gray-700">Earnings</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">₹0</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <Link to="/rewards-info" className="text-indigo-600 font-medium hover:text-indigo-800 text-sm">
                                View detailed terms & conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
