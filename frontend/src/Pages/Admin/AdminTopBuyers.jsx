import React, { useEffect, useState } from "react";
import client from "../../api/client";
import {
    TrophyIcon,
    CurrencyRupeeIcon,
    StarIcon,
    UserGroupIcon,
    SparklesIcon,
    GiftIcon,
    XMarkIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";

export default function AdminTopBuyers() {
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rewardModal, setRewardModal] = useState({ open: false, user: null });
    const [rewardForm, setRewardForm] = useState({ title: '', brand: '', code: '', value: '' });

    useEffect(() => {
        fetchTopBuyers();
    }, []);

    const fetchTopBuyers = async () => {
        try {
            const { data } = await client.get("/admin/users/top-buyers");
            setBuyers(data);
        } catch (error) {
            console.error("Failed to load top buyers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReward = (user) => {
        setRewardModal({ open: true, user });
        setRewardForm({ title: '', brand: '', code: '', value: '' });
    };

    const submitReward = async () => {
        if (!rewardForm.title || !rewardForm.code || !rewardForm.value) return alert("Fill all fields");
        try {
            await client.post(`/admin/users/${rewardModal.user._id}/rewards`, rewardForm);
            alert("Reward sent successfully!");
            setRewardModal({ open: false, user: null });
        } catch (error) {
            console.error(error);
            alert("Failed to send reward");
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <ArrowPathIcon className="h-10 w-10 text-yellow-500 animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Calculating Ranks...</p>
            </div>
        </div>
    );

    // Podium Users (Top 3)
    const topThree = buyers.slice(0, 3);
    const restRunners = buyers.slice(3);

    return (
        <div className="space-y-12 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 dark:from-yellow-300 dark:via-orange-400 dark:to-red-400 flex items-center gap-3 drop-shadow-sm">
                        <TrophyIcon className="h-10 w-10 text-yellow-500 animate-bounce-slow" />
                        Buyer Leaderboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Recognize and reward our platform's most valuable customers.</p>
                </div>
                <div className="inline-flex bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 rounded-2xl items-center gap-2 shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform">
                    <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                    <span className="text-sm font-bold text-white">Monthly Rewards Active</span>
                </div>
            </div>

            {/* PODIUM SECTION - 3D Effect */}
            {topThree.length > 0 && (
                <div className="relative h-[450px] flex justify-center items-end gap-2 md:gap-8 pb-10 perspective-1000">

                    {/* Rank 2 (Silver) */}
                    {topThree[1] && (
                        <div className="flex flex-col items-center animate-slide-up relative z-10" style={{ animationDelay: '200ms' }}>
                            <div className="mb-4 relative group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                                <img
                                    src={topThree[1].avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${topThree[1].displayName}`}
                                    className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-2xl object-cover"
                                    alt="Rank 2"
                                />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800 text-sm font-black px-3 py-0.5 rounded-full shadow-lg border border-white">
                                    #2
                                </div>
                            </div>
                            <div className="w-32 md:w-48 h-52 bg-gradient-to-b from-gray-200 to-gray-400 dark:from-slate-600 dark:to-slate-800 rounded-t-[2rem] shadow-2xl flex flex-col items-center justify-start pt-6 relative border-t-4 border-white/30 transform-style-3d group hover:shadow-gray-500/50 transition-shadow">
                                <div className="absolute inset-0 bg-white/20 rounded-t-[2rem] pointer-events-none"></div>
                                <p className="font-bold text-gray-800 dark:text-gray-100 text-lg text-center truncate w-full px-4">{topThree[1].displayName}</p>
                                <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300 mt-1">₹{topThree[1].totalSpent.toLocaleString()}</p>
                                <button
                                    onClick={() => handleOpenReward(topThree[1])}
                                    className="mt-6 px-4 py-2 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-xs font-black rounded-xl shadow-lg hover:scale-105 transition-transform"
                                >
                                    REWARD
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 (Gold) */}
                    {topThree[0] && (
                        <div className="flex flex-col items-center z-20 animate-slide-up relative" style={{ animationDelay: '0ms' }}>
                            <div className="mb-6 relative group cursor-pointer hover:-translate-y-4 transition-transform duration-300">
                                <FireIcon className="h-12 w-12 text-orange-500 absolute -top-14 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-lg" />
                                <img
                                    src={topThree[0].avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${topThree[0].displayName}`}
                                    className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-[0_0_40px_-10px_rgba(250,204,21,0.5)] object-cover ring-4 ring-yellow-400/20"
                                    alt="Rank 1"
                                />
                                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-300 to-orange-500 text-white text-lg font-black px-4 py-1 rounded-full shadow-xl border-2 border-white">
                                    #1
                                </div>
                            </div>
                            <div className="w-40 md:w-56 h-72 bg-gradient-to-b from-yellow-300 to-orange-500 rounded-t-[2.5rem] shadow-[0_20px_50px_-12px_rgba(245,158,11,0.6)] flex flex-col items-center justify-start pt-10 relative border-t-4 border-yellow-200 transform-style-3d">
                                <span className="absolute top-3 right-4 text-yellow-100 opacity-60"><TrophyIcon className="h-10 w-10 rotate-12" /></span>
                                <p className="font-black text-white text-2xl text-center truncate w-full px-4 drop-shadow-md">{topThree[0].displayName}</p>
                                <div className="mt-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                                    <p className="text-sm font-mono font-bold text-white">₹{topThree[0].totalSpent.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleOpenReward(topThree[0])}
                                    className="mt-8 px-8 py-3 bg-white text-orange-600 text-sm font-black rounded-2xl shadow-xl hover:bg-orange-50 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all"
                                >
                                    SEND GIFT
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {topThree[2] && (
                        <div className="flex flex-col items-center animate-slide-up z-10" style={{ animationDelay: '400ms' }}>
                            <div className="mb-4 relative group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                                <img
                                    src={topThree[2].avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${topThree[2].displayName}`}
                                    className="w-20 h-20 rounded-full border-4 border-orange-700 shadow-2xl object-cover"
                                    alt="Rank 3"
                                />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-orange-600 to-orange-800 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-lg border border-white">
                                    #3
                                </div>
                            </div>
                            <div className="w-28 md:w-40 h-40 bg-gradient-to-b from-orange-300 to-orange-500 dark:from-orange-800 dark:to-orange-900 rounded-t-[2rem] shadow-2xl flex flex-col items-center justify-start pt-6 relative border-t-4 border-orange-200 transform-style-3d hover:shadow-orange-700/50 transition-shadow">
                                <div className="absolute inset-0 bg-black/5 rounded-t-[2rem] pointer-events-none"></div>
                                <p className="font-bold text-white text-lg text-center truncate w-full px-4 drop-shadow-sm">{topThree[2].displayName}</p>
                                <p className="text-xs font-mono font-bold text-orange-100 mt-1">₹{topThree[2].totalSpent.toLocaleString()}</p>
                                <button
                                    onClick={() => handleOpenReward(topThree[2])}
                                    className="mt-4 px-3 py-1 bg-white/90 text-orange-800 text-[10px] font-black rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all"
                                >
                                    REWARD
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* List Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
                    <h3 className="font-black text-gray-800 dark:text-gray-200 flex items-center gap-2 text-lg">
                        <UserGroupIcon className="h-6 w-6 text-indigo-500" />
                        Honorable Mentions
                    </h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ranked by volume</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase w-16 tracking-widest">Rank</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total Spent</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Transactions</th>
                                <th className="px-6 py-4 text-right w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                            {restRunners.length === 0 && topThree.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        No transaction data available yet.
                                    </td>
                                </tr>
                            ) : (
                                restRunners.map((user, index) => (
                                    <tr key={user._id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-black text-gray-300 dark:text-gray-600 text-xl group-hover:text-indigo-400 transition-colors">#{index + 4}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={user.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${user.displayName}`}
                                                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-600 object-cover shadow-sm"
                                                    alt={user.displayName}
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{user.displayName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.identityVerificationStatus === 'Verified' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            ₹{user.totalSpent.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-500 dark:text-gray-400">
                                            {user.transactionCount} <span className="text-[10px] uppercase font-medium">Orders</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenReward(user)}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg hover:scale-110 transition-all font-bold text-xs uppercase"
                                            >
                                                Reward
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reward Modal - Vibrant & Glassmorphic */}
            {
                rewardModal.open && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-white/10 relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="p-8 relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                            <GiftIcon className="h-7 w-7 text-pink-500" /> Send Reward
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">To: <span className="text-pink-600 dark:text-pink-400 font-bold">{rewardModal.user.displayName}</span></p>
                                    </div>
                                    <button onClick={() => setRewardModal({ open: false, user: null })} className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Voucher Title</label>
                                        <input
                                            className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl p-3 border outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 dark:text-white font-bold transition-all"
                                            placeholder="e.g. Free Amazon Gift Card"
                                            value={rewardForm.title}
                                            onChange={e => setRewardForm({ ...rewardForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Brand</label>
                                            <input
                                                className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl p-3 border outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 dark:text-white font-bold transition-all"
                                                placeholder="Amazon"
                                                value={rewardForm.brand}
                                                onChange={e => setRewardForm({ ...rewardForm, brand: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Value (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl p-3 border outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 dark:text-white font-bold transition-all"
                                                placeholder="500"
                                                value={rewardForm.value}
                                                onChange={e => setRewardForm({ ...rewardForm, value: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Voucher Code</label>
                                        <div className="p-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500">
                                            <input
                                                className="w-full bg-white dark:bg-slate-900 rounded-lg p-3 border-none outline-none font-mono text-center tracking-widest uppercase font-black text-lg text-gray-800 dark:text-white placeholder-gray-300"
                                                placeholder="ABCD-1234-XYZ"
                                                value={rewardForm.code}
                                                onChange={e => setRewardForm({ ...rewardForm, code: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={submitReward} className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 transform">
                                        <GiftIcon className="h-5 w-5 animate-bounce-slow" /> Send Reward Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
