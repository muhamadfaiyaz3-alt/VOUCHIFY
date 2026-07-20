import React from "react";
import {
    BanknotesIcon,
    TagIcon,
    ShoppingBagIcon,
    ArchiveBoxIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

export default function ProfileStats({ stats, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 dark:bg-slate-800 h-32 rounded-3xl"></div>
                ))}
            </div>
        );
    }

    const items = [
        {
            label: "Total Earnings",
            value: `₹${stats.earnings.toFixed(2)}`,
            icon: BanknotesIcon,
            gradient: "from-emerald-600 to-teal-600",
            shadow: "shadow-emerald-500/20",
            iconColor: "text-emerald-100",
            subtext: "+12% this month" // Mock or calc if real data exists
        },
        {
            label: "Total Savings",
            value: `₹${stats.savings.toFixed(2)}`,
            icon: TagIcon,
            gradient: "from-blue-600 to-indigo-600",
            shadow: "shadow-indigo-500/20",
            iconColor: "text-blue-100",
            subtext: "Best deals grabbed"
        },
        {
            label: "Vouchers Sold",
            value: stats.soldCount,
            icon: ArchiveBoxIcon,
            gradient: "from-orange-500 to-amber-500",
            shadow: "shadow-orange-500/20",
            iconColor: "text-orange-100",
            subtext: "Successful sales"
        },
        {
            label: "Vouchers Bought",
            value: stats.purchasedCount,
            icon: ShoppingBagIcon,
            gradient: "from-purple-600 to-pink-600",
            shadow: "shadow-purple-500/20",
            iconColor: "text-purple-100",
            subtext: "Collection size"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
                <div
                    key={item.label}
                    className="relative bg-white dark:bg-slate-900 p-1 rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-transform duration-300 shadow-xl dark:shadow-none"
                >
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-300`}></div>

                    <div className="relative bg-white dark:bg-slate-900 h-full p-6 rounded-[1.8rem] border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.gradient} ${item.shadow} shadow-lg`}>
                                <item.icon className="h-6 w-6 text-white" />
                            </div>
                            <span className="flex items-center text-[10px] text-gray-500 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-full border border-gray-100 dark:border-slate-700">
                                <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-green-500" />
                                Active
                            </span>
                        </div>

                        <div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{item.value}</p>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">{item.label}</p>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100/50 dark:bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
