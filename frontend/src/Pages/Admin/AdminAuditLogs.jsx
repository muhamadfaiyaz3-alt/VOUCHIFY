import React, { useState, useEffect } from "react";
import client from "../../api/client";
import {
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    CommandLineIcon,
    ArrowRightIcon,
    EyeIcon,
    ClockIcon,
    UserIcon,
    DocumentMagnifyingGlassIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: "", actor: "" });
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.action) params.append("action", filter.action);
            if (filter.actor) params.append("actor", filter.actor);

            const { data } = await client.get(`/admin/audit-logs?${params.toString()}`);
            setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ action }) => {
        let color = "bg-gray-100 text-gray-800 border-gray-200";
        if (action.includes("SUSPEND")) color = "bg-red-100 text-red-800 border-red-200";
        if (action.includes("UPDATE")) color = "bg-blue-100 text-blue-800 border-blue-200";
        if (action.includes("VERIFY")) color = "bg-green-100 text-green-800 border-green-200";

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${color}`}>
                {action.replace(/_/g, " ")}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-8 space-y-8 animate-fade-in">
            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-900 shadow-xl p-10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheckIcon className="h-64 w-64 text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-indigo-300 font-bold uppercase tracking-wider text-sm">
                            <span className="p-1 px-3 bg-indigo-500/20 rounded-full backdrop-blur-sm border border-indigo-400/30">System Security</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                            Audit & Compliance Log
                        </h1>
                        <p className="text-indigo-200 max-w-xl text-lg">
                            Comprehensive tracking of all system activities, user verifications, and security events.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-auto">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                            <div className="relative bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center p-1 focus-within:bg-white/20 transition-all">
                                <MagnifyingGlassIcon className="h-6 w-6 text-indigo-300 ml-3" />
                                <input
                                    type="text"
                                    placeholder="Search specific actions..."
                                    className="w-full md:w-72 bg-transparent border-none outline-none text-white placeholder-indigo-300/70 px-4 py-2"
                                    value={filter.action}
                                    onChange={e => setFilter({ ...filter, action: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-8 py-6">Event Time</th>
                                <th className="px-8 py-6">Actor</th>
                                <th className="px-8 py-6">Action</th>
                                <th className="px-8 py-6">Summary</th>
                                <th className="px-8 py-6 text-center">Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {logs.map((log, index) => (
                                <tr
                                    key={log._id}
                                    className="hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition duration-200 group"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                <ClockIcon className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700 dark:text-gray-200">{new Date(log.timestamp).toLocaleDateString()}</span>
                                                <span className="text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-gray-800 dark:text-gray-200">
                                        {log.actor === "SYSTEM" ? (
                                            <span className="flex items-center gap-2 text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/30 px-3 py-1.5 rounded-xl w-fit border border-fuchsia-100 dark:border-fuchsia-800">
                                                <CommandLineIcon className="h-4 w-4" /> BOT
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl w-fit truncate max-w-[150px] border border-indigo-100 dark:border-indigo-800" title={log.actor}>
                                                <UserIcon className="h-4 w-4" /> {log.actor.toString().substring(0, 8)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <StatusBadge action={log.action} />
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300 max-w-sm font-medium">
                                        {log.details}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-indigo-600 hover:text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/40 p-2 rounded-xl transition-all transform hover:scale-110"
                                                title="View Details"
                                            >
                                                <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <span className="text-gray-300 dark:text-slate-600">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && !loading && (
                        <div className="p-20 text-center flex flex-col items-center justify-center text-gray-400">
                            <ShieldCheckIcon className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-gray-500">No logs found</h3>
                            <p className="text-sm">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Details Modal - kept mostly same structure but enhanced styles */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedLog(null)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 relative z-10 border border-white/20 animate-scale-in">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex justify-between items-center border-b border-gray-700/50">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <DocumentMagnifyingGlassIcon className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    Event Details
                                </h3>
                                <p className="text-indigo-300/60 text-xs mt-1 font-mono uppercase tracking-widest ml-14">{selectedLog.action}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-white transition p-2 hover:bg-white/10 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2 mb-2">
                                    <InformationCircleIcon className="h-4 w-4" /> Description
                                </span>
                                <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{selectedLog.details}</p>
                            </div>

                            {/* Diff View */}
                            {selectedLog.metadata && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <ArrowRightIcon className="h-4 w-4 text-indigo-500" /> Data Changes
                                    </h4>

                                    <div className="grid grid-cols-1 gap-6">
                                        {Object.entries(selectedLog.metadata).map(([key, value]) => (
                                            <React.Fragment key={key}>
                                                {(value?.old !== undefined || value?.new !== undefined) ? (
                                                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                                        <div className="bg-gray-50 dark:bg-slate-900/50 p-3 border-b border-gray-200 dark:border-slate-700 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                            Field: <span className="text-indigo-600 dark:text-indigo-400">{key}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-slate-700">
                                                            {/* Old Value */}
                                                            <div className="p-4 bg-red-50/30 dark:bg-red-900/10">
                                                                <span className="text-xs font-bold text-red-500 uppercase block mb-2">Previous</span>
                                                                {key.toLowerCase().includes('proof') || key.toLowerCase().includes('url') ? (
                                                                    value.old ? <img src={value.old} alt="Old" className="w-full h-32 object-contain rounded-lg border border-red-200 bg-white" /> : <span className="text-gray-400 text-sm italic">None</span>
                                                                ) : (
                                                                    <div className="text-red-800 dark:text-red-300 font-mono text-sm break-all">{String(value.old)}</div>
                                                                )}
                                                            </div>
                                                            {/* New Value */}
                                                            <div className="p-4 bg-green-50/30 dark:bg-green-900/10">
                                                                <span className="text-xs font-bold text-green-500 uppercase block mb-2">New Update</span>
                                                                {key.toLowerCase().includes('proof') || key.toLowerCase().includes('url') ? (
                                                                    value.new ? <img src={value.new} alt="New" className="w-full h-32 object-contain rounded-lg border-2 border-green-500 bg-white" /> : <span className="text-gray-400 text-sm italic">Removed</span>
                                                                ) : (
                                                                    <div className="text-green-800 dark:text-green-300 font-mono text-sm break-all font-bold">{String(value.new)}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                                        <span className="text-xs text-gray-500 uppercase font-bold">{key}</span>
                                                        <span className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-gray-200 dark:border-slate-600">{String(value)}</span>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-right text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 font-mono">
                                Log ID: {selectedLog._id} • IP: {selectedLog.ipAddress || 'Unknown'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;
