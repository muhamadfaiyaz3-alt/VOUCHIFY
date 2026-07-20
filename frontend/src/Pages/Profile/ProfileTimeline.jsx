import React, { useEffect, useState } from "react";
import client from "../../api/client";
import { ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function ProfileTimeline() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                // Using transactions as timeline
                const { data } = await client.get('/transactions?type=all');
                setActivities(data);
            } catch (e) {
                console.error("Timeline fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    if (loading) return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-slate-800 h-[500px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-slate-800 relative overflow-hidden h-[600px] flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 relative z-10 shrink-0">
                <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-600/30">
                    <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Timeline</h3>
                    <p className="text-xs text-purple-500 dark:text-purple-400 font-bold uppercase tracking-wider">Recent Activity</p>
                </div>
            </div>

            <div className="relative border-l-2 border-gray-200 dark:border-slate-800 ml-4 space-y-8 pb-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activities.slice(0, 10).map((act, idx) => (
                    <div key={act._id} className="relative ml-8 group">
                        {/* Timeline Node */}
                        <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-[45px] ring-8 ring-white dark:ring-slate-900 transition-all duration-500 ${act.status === 'COMPLETED' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
                            act.status === 'FAILED' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                                'bg-amber-500 shadow-lg shadow-amber-500/50'
                            }`}>
                            {act.status === 'COMPLETED' ? <CheckCircleIcon className="w-5 h-5 text-white" /> :
                                act.status === 'FAILED' ? <XCircleIcon className="w-5 h-5 text-white" /> :
                                    <ArrowPathIcon className="w-4 h-4 text-white animate-spin" />}
                        </span>

                        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-750 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {act.voucher?.title || "Transaction"}
                                </h3>
                                <time className="text-xs font-mono text-gray-500 dark:text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-800">
                                    {new Date(act.createdAt).toLocaleDateString()}
                                </time>
                            </div>

                            <div className="flex justify-between items-end">
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                    Status: <span className={`font-bold ${act.status === 'COMPLETED' ? 'text-emerald-500 dark:text-emerald-400' :
                                        act.status === 'FAILED' ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'
                                        }`}>{act.status}</span>
                                </p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">₹{act.amountPaid}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <div className="ml-8 py-8 text-gray-400 dark:text-slate-500 italic text-center">No recent activity found.</div>
                )}
            </div>

            {/* Fade out bottom */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-20"></div>
        </div>
    );
}
