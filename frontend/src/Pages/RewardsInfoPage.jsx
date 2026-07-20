import React, { useEffect, useState } from 'react';
import client from '../api/client';
import {
    TrophyIcon,
    StarIcon,
    SparklesIcon,
    GiftIcon,
    FireIcon,
    CurrencyRupeeIcon,
    RocketLaunchIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/solid';

const RewardsInfoPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalSavings: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lbRes, statsRes, activityRes] = await Promise.all([
                    client.get('/public/leaderboard'),
                    client.get('/public/stats'),
                    client.get('/public/activity')
                ]);
                setLeaderboard(lbRes.data);
                setStats(statsRes.data);
                setRecentActivity(activityRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Format utility for large numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
        return num;
    };

    return (
        <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-500 font-sans">

            {/* --- BACKGROUND SKY ANIMATION (CSS based) --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="cloud c1"></div>
                <div className="cloud c2"></div>
                <div className="cloud c3"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-200/40 via-purple-100/20 to-transparent dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-slate-950"></div>
            </div>

            <main className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">

                {/* --- HERO SECTION --- */}
                <div className="text-center mb-20 perspective-1000">
                    <div className="inline-block animate-bounce-in transform-style-3d hover:rotate-y-12 transition-transform duration-500">
                        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-1 rounded-full shadow-[0_0_50px_rgba(168,85,247,0.5)] mb-6">
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-full">
                                <TrophyIcon className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-6 drop-shadow-sm tracking-tight">
                        Rewards & Leaderboard
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
                        Join the elite circle of top traders. Earn exclusive vouchers, badges, and recognition by buying and selling on Vouchify.
                    </p>
                </div>

                {/* --- MARQUEE SECTION --- */}
                {/* Shows REAL recent activity if available, else announcements */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-y border-indigo-100 dark:border-slate-800 py-4 mb-20 overflow-hidden relative shadow-lg">
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10"></div>

                    <div className="animate-marquee inline-flex items-center gap-12 group hover-pause">
                        {/* Duplicate content to ensure smooth loop */}
                        {[...Array(2)].map((_, loopIdx) => (
                            <React.Fragment key={loopIdx}>
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((act, i) => (
                                        <div key={`${loopIdx}-${i}`} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm flex-shrink-0">
                                            <SparklesIcon className="h-4 w-4 text-yellow-500" />
                                            <span>
                                                {act.buyer?.displayName || "Someone"} purchased <span className="text-pink-500">{act.voucher?.title}</span> for ₹{act.amountPaid}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    // Fallback if no recent activity
                                    ["New Reward Unlocked!", "Top Buyer Just Joined!", "Flash Sale Live!", "50% Off Fees Today!", "Weekly Winners Announced!"].map((msg, i) => (
                                        <div key={`${loopIdx}-${i}`} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm flex-shrink-0">
                                            <SparklesIcon className="h-4 w-4 text-yellow-500" />
                                            <span>{msg}</span>
                                        </div>
                                    ))
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* --- GRID LAYOUT: Leaderboard & Info --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Leaderboard (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-4 px-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <FireIcon className="h-8 w-8 text-orange-500 animate-pulse" />
                                Top Buyers Table
                            </h2>
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-200 dark:border-indigo-500/30">
                                Real-time Data
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-20 bg-white dark:bg-slate-800 rounded-3xl"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 perspective-1000">
                                {leaderboard.map((user, idx) => {
                                    // Rank Styles
                                    let rankColor = "text-slate-500 dark:text-slate-400";
                                    let crownColor = null;
                                    let shadowColor = "shadow-none";

                                    if (idx === 0) { // Gold
                                        rankColor = "text-yellow-500 drop-shadow-md";
                                        crownColor = "text-yellow-400";
                                        shadowColor = "shadow-yellow-500/50";
                                    } else if (idx === 1) { // Silver
                                        rankColor = "text-slate-400 drop-shadow-md";
                                        crownColor = "text-slate-300";
                                        shadowColor = "shadow-slate-400/50";
                                    } else if (idx === 2) { // Bronze
                                        rankColor = "text-amber-600 drop-shadow-md";
                                        crownColor = "text-amber-600";
                                        shadowColor = "shadow-amber-600/50";
                                    }

                                    return (
                                        <div
                                            key={user._id}
                                            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-4 md:p-6 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:-rotate-1 transition-all duration-300 transform-style-3d cursor-default overflow-hidden flex items-center gap-4 md:gap-6"
                                        >
                                            {/* Left: Rank & Crown */}
                                            <div className="flex flex-col items-center justify-center min-w-[3rem] md:min-w-[4rem]">
                                                {idx < 3 ? (
                                                    <div className={`mb-1 animate-bounce duration-1000 ${shadowColor}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 md:w-10 md:h-10 ${crownColor}`}>
                                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="h-4"></div> // Spacer
                                                )}
                                                <span className={`text-2xl md:text-4xl font-black ${rankColor}`}>#{idx + 1}</span>
                                            </div>

                                            {/* Divider */}
                                            <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 self-center hidden md:block"></div>

                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <div className={`absolute -inset-1 rounded-full blur opacity-70 transition duration-500 group-hover:opacity-100 ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                                    idx === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-500' :
                                                        idx === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                                                            'bg-indigo-500/50'
                                                    }`}></div>
                                                <img
                                                    src={user.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${user.displayName}`}
                                                    alt={user.displayName}
                                                    className="relative w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-slate-800 object-cover bg-white"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
                                                    {user.displayName || "Anonymous User"}
                                                </h3>
                                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                                    <RocketLaunchIcon className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
                                                    {user.transactionCount} Transactions
                                                </p>
                                            </div>

                                            {/* Stats */}
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 mb-1">Total Spent</p>
                                                <p className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-500">
                                                    ₹{user.totalSpent.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {leaderboard.length === 0 && (
                                    <div className="text-center py-20 text-slate-500 dark:text-slate-400 italic">
                                        No data available yet. Be the first to appear here!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Info & CTA (1/3) */}
                    <div className="space-y-8">
                        {/* Reward Tiers Card */}
                        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none group-hover:bg-white/20 transition-colors duration-500"></div>

                            <h3 className="text-2xl font-black mb-6 relative z-10">Why Buy Here?</h3>

                            <ul className="space-y-6 relative z-10">
                                {[
                                    { title: "Safe & Secure", desc: "Admin verified transactions.", icon: React.forwardRef((props, ref) => <ShieldCheckIcon {...props} />) },
                                    { title: "Instant Delivery", desc: "Get codes immediately after payment.", icon: RocketLaunchIcon },
                                    { title: "Exclusive Rewards", desc: "Top buyers win free vouchers monthly.", icon: GiftIcon }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                            <item.icon className="h-6 w-6 text-indigo-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{item.title}</h4>
                                            <p className="text-indigo-200 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full mt-10 hover:shadow-lg transition-all active:scale-[0.98]">
                                <a href="/vouchers" className="block w-full py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50">Buy Vouchers Now</a>
                            </button>
                        </div>

                        {/* Recent Activity / Mini Stats */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <CurrencyRupeeIcon className="h-6 w-6 text-green-500" />
                                Platform Highlight
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:scale-105 transition-transform">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{formatNumber(stats.totalUsers)}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Happy Users</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:scale-105 transition-transform">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">₹{formatNumber(stats.totalSavings)}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Saved Total</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default RewardsInfoPage;