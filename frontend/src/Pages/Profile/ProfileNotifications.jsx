import React from "react";
import { useNotifications } from "../../Contexts/NotificationContext";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, BellIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ProfileNotifications() {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    return (
        <div id="notifications-section" className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-slate-800 relative overflow-hidden h-[600px] flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30">
                        <BellIcon className="h-6 w-6 text-white" />
                    </div>
                    Notifications
                </h2>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all shadow-lg border border-gray-200 dark:border-slate-700 hover:border-indigo-500"
                    >
                        Mark All Read
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {notifications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 h-full flex flex-col items-center justify-center">
                        <BellIcon className="h-12 w-12 text-gray-400 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-slate-400 font-medium">No new notifications</p>
                        <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">We'll notify you when something happens.</p>
                    </div>
                ) : (
                    notifications.map((note) => (
                        <div
                            key={note._id}
                            onClick={() => {
                                if (note.link && note.link.includes('rewards')) {
                                    const el = document.getElementById('rewards-section');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }
                                if (!note.read) markAsRead(note._id);
                            }}
                            className={`group relative p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${note.read
                                    ? "bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
                                    : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {note.type === "success" ? (
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                            <CheckCircleIcon className="h-5 w-5" />
                                        </div>
                                    ) : note.type === "error" ? (
                                        <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-full text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                                            <XCircleIcon className="h-5 w-5" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                                            <InformationCircleIcon className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm ${note.read ? "text-gray-600 dark:text-slate-300" : "text-gray-900 dark:text-white font-bold"} leading-relaxed`}>
                                        {note.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-mono flex items-center gap-2">
                                        {new Date(note.createdAt).toLocaleString()}
                                        {!note.read && (
                                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                        )}
                                    </p>
                                </div>
                                {!note.read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(note._id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg absolute top-4 right-4"
                                        title="Mark as read"
                                    >
                                        <CheckCircleIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
