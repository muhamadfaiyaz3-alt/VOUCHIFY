import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ArrowDownTrayIcon,
    CalendarDaysIcon,
    ShoppingBagIcon,
    BanknotesIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const TransactionAnalytics = () => {
    const [period, setPeriod] = useState('month'); // week, month, year
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/transactions/analytics?period=${period}`);
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    // Dark Mode Chart Options (Dynamically adjusted in real app, but simplified here for now)
    // To support light mode properly in charts, we ideally need to detect theme. 
    // For now, we'll use a neutral color scheme that works on both or slightly darker text.
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: '#64748b' } // slate-500
            },
            title: { display: false }
        },
        scales: {
            y: {
                grid: { color: '#cbd5e1' }, // slate-300
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            }
        }
    };

    const downloadCSV = () => {
        if (!data?.transactions) return;

        const headers = ["Date", "Type", "Title", "Amount", "Status", "Counterparty"];
        const rows = data.transactions.map(t => {
            return [
                new Date(t.createdAt).toLocaleDateString(),
                t.buyer?.displayName ? "Order" : "Sale",
                t.voucher?.title,
                t.amountPaid,
                t.status,
                t.buyer?.displayName || t.seller?.displayName
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transactions_${period}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-slate-800 h-40 rounded-3xl"></div>
            ))}
        </div>
    );

    if (!data) return <div className="p-8 text-center text-gray-500 dark:text-slate-500">Failed to load analytics data.</div>;

    const { bought, sold } = data.analytics;
    const transactions = data.transactions;

    // Charts Data
    const barData = {
        labels: ['Bought', 'Sold'],
        datasets: [
            {
                label: 'Total Value (₹)',
                data: [bought.current.totalAmount, sold.current.totalAmount],
                backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(34, 197, 94, 0.8)'],
                borderColor: ['rgb(99, 102, 241)', 'rgb(34, 197, 94)'],
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const pieData = {
        labels: ['Bought', 'Sold'],
        datasets: [
            {
                data: [bought.current.count, sold.current.count],
                backgroundColor: ['#6366f1', '#22c55e'], // indigo-500, green-500
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    return (
        <div className="space-y-8 animate-fade-in transition-colors duration-300">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800">
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl">
                    {['week', 'month', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${period === p
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all shadow-lg"
                >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Smart Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bought Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-900 dark:to-slate-900 p-8 rounded-[2.5rem] border border-indigo-200 dark:border-indigo-500/30 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-indigo-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute top-6 right-6 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <ShoppingBagIcon className="w-20 h-20 text-white dark:text-indigo-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/20 dark:bg-indigo-500/20 rounded-lg backdrop-blur-sm">
                                <ShoppingBagIcon className="h-6 w-6 text-white dark:text-indigo-400" />
                            </div>
                            <h3 className="text-white dark:text-indigo-200 font-bold text-sm uppercase tracking-wider">Vouchers Bought</h3>
                        </div>

                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-5xl font-black text-white tracking-tight">₹{bought.current.totalAmount.toLocaleString()}</span>
                            <span className="text-sm font-bold text-indigo-100 dark:text-slate-400 bg-white/20 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-white/10 dark:border-slate-700/50">{bought.current.count} items</span>
                        </div>

                        <div className={`flex items-center gap-2 text-sm font-bold bg-white/20 dark:bg-slate-900/40 inline-block px-3 py-1.5 rounded-lg border border-white/10 ${bought.percentChange >= 0 ? 'text-white dark:text-emerald-400' : 'text-white dark:text-red-400'}`}>
                            {bought.percentChange >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                            {Math.abs(bought.percentChange)}%
                            <span className="text-indigo-100 dark:text-slate-400 font-normal ml-1">vs last {period}</span>
                        </div>
                    </div>
                </div>

                {/* Sold Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-slate-900 p-8 rounded-[2.5rem] border border-emerald-200 dark:border-emerald-500/30 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-emerald-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute top-6 right-6 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <BanknotesIcon className="w-20 h-20 text-white dark:text-emerald-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/20 dark:bg-emerald-500/20 rounded-lg backdrop-blur-sm">
                                <BanknotesIcon className="h-6 w-6 text-white dark:text-emerald-400" />
                            </div>
                            <h3 className="text-white dark:text-emerald-200 font-bold text-sm uppercase tracking-wider">Vouchers Sold</h3>
                        </div>

                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-5xl font-black text-white tracking-tight">₹{sold.current.totalAmount.toLocaleString()}</span>
                            <span className="text-sm font-bold text-emerald-100 dark:text-slate-400 bg-white/20 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-white/10 dark:border-slate-700/50">{sold.current.count} items</span>
                        </div>

                        <div className={`flex items-center gap-2 text-sm font-bold bg-white/20 dark:bg-slate-900/40 inline-block px-3 py-1.5 rounded-lg border border-white/10 ${sold.percentChange >= 0 ? 'text-white dark:text-emerald-400' : 'text-white dark:text-red-400'}`}>
                            {sold.percentChange >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                            {Math.abs(sold.percentChange)}%
                            <span className="text-emerald-100 dark:text-slate-400 font-normal ml-1">vs last {period}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visuals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-200 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                            <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Volume Comparison</h3>
                    </div>
                    <Bar data={barData} options={chartOptions} />
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-200 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                            <ChartBarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Distribution</h3>
                    </div>
                    <div className="relative h-64 flex items-center justify-center">
                        <Doughnut data={pieData} options={{ ...chartOptions, cutout: '70%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94a3b8' } } } }} />
                    </div>
                </div>
            </div>

            {/* Detailed History List */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Detailed History</h3>
                    <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{period} View</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-950/50">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Voucher</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {transactions.map((t) => (
                                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-100 dark:bg-slate-800 p-2 rounded-xl group-hover:bg-gray-200 dark:group-hover:bg-slate-700 transition">
                                                <CalendarDaysIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(t.createdAt).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-500 font-mono">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{t.voucher?.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider font-bold">{t.voucher?.brand}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">₹{t.amountPaid}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${t.status === 'completed' || t.status === 'paid'
                                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                            : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-400 dark:text-slate-500 italic">No transactions found for this period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionAnalytics;
