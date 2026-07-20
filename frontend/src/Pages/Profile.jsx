import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../Contexts/AuthContext";
import ProfileHeader from "./Profile/ProfileHeader";
import ProfileStats from "./Profile/ProfileStats";
import ProfileVouchers from "./Profile/ProfileVouchers";
import TransactionAnalytics from "./Profile/TransactionAnalytics";
import ProfileNotifications from "./Profile/ProfileNotifications";
import ProfileSettings from "./Profile/ProfileSettings";
import ProfileRewards from "./Profile/ProfileRewards";
import ProfileTimeline from "./Profile/ProfileTimeline";
import { useLocation } from "react-router-dom";
import { ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState({ earnings: 0, savings: 0, purchasedCount: 0, soldCount: 0, activeListings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const location = useLocation();

  const fetchStats = async () => {
    try {
      const { data } = await client.get("/me/stats");
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-8 transition-colors duration-300">
      <div className="text-center text-gray-500 dark:text-slate-500 animate-pulse font-bold">Please log in to view your profile.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 text-gray-900 dark:text-white pb-32 selection:bg-indigo-500 selection:text-white relative transition-colors duration-300">
      {/* Background Decor Layer - Fixed */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-200/60 to-transparent dark:from-indigo-900/20 dark:to-transparent pointer-events-none z-0"></div>

      {/* Main Container - Relative z-10 to stay above background */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Header */}
        <div className="animate-fade-in-down">
          <ProfileHeader user={user} onUpdate={async () => { await refreshUser(); await fetchStats(); }} />
        </div>

        {/* SUSPENSION BANNER */}
        {user.isSuspended && (
          <div className="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/80 dark:to-red-600/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between border border-red-200 dark:border-red-500/30 animate-bounce-in">
            <div className="flex items-start gap-6 max-w-2xl">
              <div className="p-4 bg-red-500/10 dark:bg-red-500/20 rounded-2xl shadow-inner shadow-red-500/10 hidden md:block">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-red-900 dark:text-white mb-2 tracking-tight">Account Suspended</h2>
                <p className="text-red-700 dark:text-red-200 text-lg leading-relaxed">
                  Your account currently has limited access.
                  {user.suspensionReason && <span className="block mt-1 font-bold bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg inline-block text-sm border border-red-500/20">Reason: {user.suspensionReason}</span>}
                </p>
              </div>
            </div>
            <a
              href="/reactivation-request"
              className="mt-6 md:mt-0 bg-red-600 dark:bg-white text-white dark:text-red-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-700 dark:hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Appeal Now
            </a>
          </div>
        )}

        {/* ADMIN DASHBOARD ACCESS */}
        {user?.role === "admin" && (
          <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900 p-1 rounded-[2rem] shadow-2xl overflow-hidden group">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-[1.8rem] flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform hidden md:block">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Admin Dashboard</h2>
                  <p className="text-gray-600 dark:text-indigo-200 font-medium">Manage platform activity, transactions, and users.</p>
                </div>
              </div>
              <a
                href="/admin"
                className="mt-6 md:mt-0 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 ring-1 ring-white/10"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8">
          <ProfileStats stats={stats} loading={loadingStats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-4">

          {/* Left Column (Main) - 2/3 width on large screens */}
          <div className="xl:col-span-2 space-y-8">
            <ProfileVouchers />
            <TransactionAnalytics />
            <ProfileTimeline />
          </div>

          {/* Right Column (Sidebar) - 1/3 width */}
          <div className="space-y-8">
            <ProfileNotifications />
            <ProfileRewards />
            <ProfileSettings />
          </div>

        </div>
      </div>
    </div>
  );
}
