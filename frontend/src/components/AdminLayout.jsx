import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import AdminSidebar from "./AdminSidebar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const AdminLayout = () => {
    const { user, loading } = useAuth();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen grid place-content-center bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
                <div className="flex flex-col items-center p-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse"></div>
                        </div>
                    </div>
                    <p className="mt-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-lg tracking-wide animate-pulse">
                        Verifying Access...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative font-sans">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 z-0 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

            {/* Mobile Header / Toggle */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 z-30 flex items-center px-4 justify-between transition-all duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                        VouchifyAdmin
                    </span>
                </div>
                <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block relative z-20 h-full shadow-xl">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex justify-start">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                        onClick={() => setMobileSidebarOpen(false)}
                    ></div>

                    {/* Drawer */}
                    <div className="relative w-[300px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-in-left transform transition-transform">
                        <div className="absolute top-4 right-4 z-50">
                            <button
                                onClick={() => setMobileSidebarOpen(false)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-red-500 transition"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <AdminSidebar isMobile={true} onClose={() => setMobileSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 scroll-smooth pt-16 md:pt-0">
                <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 min-h-full">
                    <div className="animate-slide-up-fade">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
