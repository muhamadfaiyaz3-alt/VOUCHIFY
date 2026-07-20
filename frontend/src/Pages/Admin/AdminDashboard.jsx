import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import {
    ChartBarIcon,
    CurrencyRupeeIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    BanknotesIcon,
    CheckBadgeIcon,
    Cog6ToothIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        pendingTransactions: 0,
        activeVouchers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await client.get('/admin/analytics');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { name: 'Total Sales', value: `₹${stats.totalSales?.toFixed(2) || '0.00'}`, icon: CurrencyRupeeIcon, color: 'bg-green-500' },
        { name: 'Platform Revenue', value: `₹${stats.totalRevenue?.toFixed(2) || '0.00'}`, icon: BanknotesIcon, color: 'bg-indigo-500' },
        { name: 'Pending Orders', value: stats.pendingTransactions || 0, icon: ShoppingBagIcon, color: 'bg-yellow-500' },
        { name: 'Active Vouchers', value: stats.activeVouchers || 0, icon: CheckBadgeIcon, color: 'bg-blue-500' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Top Marquee for System Status */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 rounded-xl shadow-lg">
                <div className="animate-marquee whitespace-nowrap flex gap-8 font-bold text-sm tracking-wide">
                    <span>🚀 System Status: Operational</span>
                    <span>•</span>
                    <span>🔥 High Traffic Alert: Server Load Normal</span>
                    <span>•</span>
                    <span>💎 Premium Features Enabled</span>
                    <span>•</span>
                    <span>🛡️ Security Protocol: Active</span>
                    <span>•</span>
                    <span>🚀 System Status: Operational</span>
                    <span>•</span>
                    <span>🔥 High Traffic Alert: Server Load Normal</span>
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 drop-shadow-sm">
                Admin Center
            </h1>

            {/* Stats Grid with 3D Hover Effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 perspective-1000">
                {cards.map((card, idx) => (
                    <div
                        key={card.name}
                        className="relative group transition-all duration-500 transform-style-3d hover:rotate-y-12"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className={`
                            absolute inset-0 bg-gradient-to-br ${card.color.replace('bg-', 'from-')}/20 to-transparent 
                            rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                        `}></div>

                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700 
                            rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col justify-between overflow-hidden">

                            {/* Decorative Background blob */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${card.color.replace('bg-', 'from-')} to-transparent rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>

                            <div className="flex items-center justify-between w-full mb-6 z-10">
                                <div className={`p-4 rounded-2xl ${card.color} text-white shadow-lg shadow-${card.color.split('-')[1]}-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                                    <card.icon className="h-7 w-7" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{card.name}</span>
                            </div>

                            <div className="z-10">
                                <p className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    {loading ? (
                                        <span className="animate-pulse bg-gray-200 dark:bg-slate-700 h-8 w-24 rounded block"></span>
                                    ) : (
                                        card.value
                                    )}
                                </p>
                                <div className="h-1 w-full bg-gray-100 dark:bg-slate-700 mt-4 rounded-full overflow-hidden">
                                    <div className={`h-full ${card.color} w-3/4 animate-pulse rounded-full`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Links Grid - Bento Box Style */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">

                {/* Large Featured Card */}
                <Link to="/admin/transactions" className="md:col-span-3 lg:col-span-2 group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors duration-500"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <ShoppingBagIcon className="h-10 w-10 text-indigo-200 group-hover:scale-110 transition-transform" />
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Core</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Transactions</h3>
                            <p className="text-indigo-100/80 text-sm leading-relaxed">Monitor all flow, verify manual payments and track status.</p>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-sm font-bold">
                            Open Dashboard <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </Link>

                {/* Medium Cards */}
                <Link to="/admin/payouts" className="md:col-span-3 lg:col-span-2 group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl group-hover:rotate-12 transition-transform">
                                <BanknotesIcon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Payouts</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Process seller withdrawals and manage platform revenue streams.</p>
                    </div>
                </Link>

                <Link to="/admin/verify-payments" className="md:col-span-2 lg:col-span-2 group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-2xl group-hover:rotate-12 transition-transform">
                                <CheckBadgeIcon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Verify Pay</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Approve manual cash transfers to release codes.</p>
                    </div>
                </Link>

                {/* Small Cards Row */}
                <Link to="/admin/verify-vouchers" className="md:col-span-2 group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-purple-500/20 hover:border-purple-500 transition-all duration-300">
                    <div className="flex flex-col h-full justify-between">
                        <ShieldCheckIcon className="h-10 w-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Verify Vouchers</h3>
                            <p className="text-xs text-slate-500">Security check for new listings.</p>
                        </div>
                    </div>
                </Link>

                <Link to="/admin/users" className="md:col-span-2 group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-blue-500/20 hover:border-blue-500 transition-all duration-300">
                    <div className="flex flex-col h-full justify-between">
                        <UserGroupIcon className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Users</h3>
                            <p className="text-xs text-slate-500">Manage identity & fraud.</p>
                        </div>
                    </div>
                </Link>

                <Link to="/admin/settings" className="md:col-span-2 group bg-gradient-to-br from-slate-800 to-black text-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex flex-col h-full justify-center items-center text-center">
                        <Cog6ToothIcon className="h-10 w-10 text-gray-300 mb-4 group-hover:rotate-90 transition-transform duration-700" />
                        <h3 className="font-bold text-lg">System Settings</h3>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
