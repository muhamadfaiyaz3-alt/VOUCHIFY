import React, { useEffect, useState } from "react";
import client from "../../api/client";
import { GiftIcon, EyeIcon, ClipboardIcon, CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function ProfileRewards() {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const { data } = await client.get("/me/rewards");
            setRewards(data);
        } catch (error) {
            console.error("Failed to load rewards", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-gray-200 dark:bg-slate-800 h-40 rounded-3xl"></div>
                ))}
            </div>
        );
    }

    if (rewards.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-slate-800 relative overflow-hidden text-center group transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="relative z-10 py-12">
                    <div className="inline-flex p-4 bg-gray-100 dark:bg-slate-800 rounded-full mb-6 relative">
                        <div className="absolute inset-0 bg-pink-500 rounded-full blur opacity-20 animate-pulse"></div>
                        <GiftIcon className="h-10 w-10 text-pink-500 relative z-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">My Rewards</h3>
                    <p className="text-gray-500 dark:text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">You haven't earned any rewards yet. Participate in contests to win exciting vouchers!</p>
                </div>
            </div>
        );
    }

    return (
        <div id="rewards-section" className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-slate-800 relative overflow-hidden flex flex-col max-h-[600px] transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8 relative z-10 border-b border-gray-100 dark:border-slate-800 pb-6 shrink-0">
                <div className="p-2 bg-pink-600 rounded-xl shadow-lg shadow-pink-600/30">
                    <GiftIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Reward Vault</h3>
                    <p className="text-xs text-pink-500 dark:text-pink-400 font-bold uppercase tracking-wider">Exclusive Perks</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 relative z-10 overflow-y-auto custom-scrollbar pr-2">
                {rewards.map((reward) => (
                    <RewardCard key={reward._id} reward={reward} />
                ))}
            </div>
        </div>
    );
}

function RewardCard({ reward }) {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(reward.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-1 relative group overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-lg dark:shadow-none border border-gray-100 dark:border-none">
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 h-full relative z-10 flex flex-col justify-between">

                {/* Background Decor */}
                <SparklesIcon className="absolute -right-6 -top-6 h-32 w-32 text-pink-500/5 group-hover:text-pink-500/10 transition-colors duration-500 rotate-12" />

                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-pink-100 dark:border-pink-500/20">
                            {reward.brand}
                        </span>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-slate-500 uppercase font-bold">Value</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">₹{reward.value}</p>
                        </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-tight group-hover:text-pink-500 dark:group-hover:text-pink-200 transition-colors">{reward.title}</h4>
                </div>

                {revealed ? (
                    <div className="space-y-3 animate-fade-in">
                        <div className="bg-gray-100 dark:bg-black/30 p-3 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between group/code relative overflow-hidden">
                            {/* Scanline effect */}
                            <div className="absolute inset-0 bg-pink-500/10 translate-x-[-100%] group-hover/code:translate-x-[100%] transition-transform duration-1000"></div>

                            <code className="font-mono text-pink-600 dark:text-pink-400 font-bold tracking-widest text-lg relative z-10">{reward.code}</code>
                            <button
                                onClick={handleCopy}
                                className={`p-2 rounded-lg transition-all ${copied ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10' : 'text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}
                            >
                                {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 text-center">Use this code at checkout</p>
                    </div>
                ) : (
                    <button
                        onClick={() => setRevealed(true)}
                        className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <EyeIcon className="h-5 w-5 group-hover/btn:animate-pulse" />
                        Reveal Code
                    </button>
                )}
            </div>
        </div>
    );
}
