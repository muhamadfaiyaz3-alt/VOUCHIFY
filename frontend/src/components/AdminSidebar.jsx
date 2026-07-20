import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import client from '../api/client';
import {
    HomeIcon,
    CurrencyRupeeIcon,
    ShoppingBagIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    BanknotesIcon,
    TicketIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserCircleIcon,
    IdentificationIcon,
    TrophyIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';

import ThemeToggle from './ThemeToggle';

const AdminSidebar = ({ isMobile = false, onClose = () => { } }) => {
    // If mobile, never collapsed.
    const [collapsed, setCollapsed] = useState(false);

    // Only allow collapsing if NOT mobile
    const isCollapsed = !isMobile && collapsed;

    const { logout } = useAuth();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({
        payments: 0,
        vouchers: 0,
        payouts: 0,
        reactivations: 0,
        pendingUsers: 0
    });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch independently to avoid one failure blocking all
                const fetchPayments = client.get('/admin/transactions?status=pending_admin_confirmation')
                    .then(res => res.data.length)
                    .catch(() => 0);

                const fetchVouchers = client.get('/admin/vouchers/pending')
                    .then(res => res.data.length)
                    .catch(() => 0);

                const fetchPayouts = client.get('/payouts')
                    .then(res => res.data.filter(p => p.status === 'pending').length)
                    .catch(() => 0);

                const fetchReactivations = client.get('/admin/reactivation-requests')
                    .then(res => res.data.filter(r => r.status === 'PENDING').length)
                    .catch(() => 0);

                const fetchPendingUsers = client.get('/admin/users/verification')
                    .then(res => res.data.filter(u => u.identityVerificationStatus === 'Pending' || (u.identityProofUrl && u.identityVerificationStatus === 'None')).length)
                    .catch(() => 0);

                const [payments, vouchers, payouts, reactivations, pendingUsers] = await Promise.all([
                    fetchPayments,
                    fetchVouchers,
                    fetchPayouts,
                    fetchReactivations,
                    fetchPendingUsers
                ]);

                setCounts({ payments, vouchers, payouts, reactivations, pendingUsers });
            } catch (error) {
                console.error("Error fetching sidebar counts:", error);
            }
        };

        fetchCounts();
        // Optional: Interval for polling
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        await logout();
        if (isMobile) onClose();
        navigate('/');
    };

    const handleNavClick = () => {
        if (isMobile) onClose();
    }

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: HomeIcon, end: true },
        { name: 'Transactions', path: '/admin/transactions', icon: ShoppingBagIcon },
        { name: 'Verify Users', path: '/admin/verify-users', icon: IdentificationIcon, badge: counts.pendingUsers },
        { name: 'Top Buyers', path: '/admin/top-buyers', icon: TrophyIcon },
        { name: 'Verify Payments', path: '/admin/verify-payments', icon: CheckBadgeIcon, badge: counts.payments },
        { name: 'Verify Vouchers', path: '/admin/verify-vouchers', icon: TicketIcon, badge: counts.vouchers },
        { name: 'Payouts', path: '/admin/payouts', icon: BanknotesIcon, badge: counts.payouts },
        { name: 'Reactivations', path: '/admin/reactivations', icon: ShieldCheckIcon, badge: counts.reactivations },
        { name: 'Bank Details', path: '/admin/bank-details', icon: CreditCardIcon },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardDocumentListIcon },
        { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
    ];

    // Removed overflow-hidden to allow tooltips to pop out
    const baseClass = "flex items-center p-3 mb-2 rounded-xl transition-all duration-300 ease-out group relative border border-transparent";
    const activeClass = "bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/30 transform scale-[1.02] font-semibold ring-1 ring-white/10";
    const inactiveClass = "text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-white hover:pl-4 hover:shadow-sm dark:hover:border-white/5";

    return (
        <div
            className={`bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-full flex flex-col transition-all duration-300 ${isMobile ? 'w-full' : isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800 shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            Vouchify<span className="text-indigo-500 font-medium text-sm ml-1">Admin</span>
                        </span>
                    </div>
                )}
                {!isMobile && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-indigo-600 dark:hover:text-white transition"
                    >
                        {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            {/* Added overflow-x-visible to allow tooltips to show outside */}
            <nav className="flex-1 overflow-y-auto overflow-x-visible py-4 px-3 custom-scrollbar">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                end={item.end}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `${baseClass} ${isActive ? activeClass : inactiveClass}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`h-6 w-6 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                                        {!isCollapsed && (
                                            <div className="flex-1 flex justify-between items-center ml-1">
                                                <span className={`whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                                                {item.badge > 0 && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Collapsed Badge Indicator */}
                                        {isCollapsed && item.badge > 0 && (
                                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-gray-900 rounded-full"></span>
                                        )}

                                        {/* Tooltip for collapsed state - Positioned outside to the right */}
                                        {isCollapsed && (
                                            <div className="absolute left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[100] whitespace-nowrap border border-slate-700/50 flex items-center gap-2 translate-x-2 group-hover:translate-x-0">
                                                {item.name}
                                                {item.badge > 0 && (
                                                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full shadow-sm">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {/* Little triangle pointer */}
                                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-slate-700/50"></div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-800/50 space-y-2 bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-sm shrink-0">
                <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center mb-3 px-1 transition-all`}>
                    {!isCollapsed && <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Appearance</span>}
                    <ThemeToggle />
                </div>

                <div className="space-y-2">
                    <button
                        onClick={() => { navigate('/profile'); if (isMobile) onClose(); }}
                        className={`flex items-center w-full p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all duration-300 group border border-transparent hover:border-gray-200 dark:hover:border-slate-700 ${isCollapsed ? 'justify-center' : ''}`}
                        title="Back to Profile"
                    >
                        <UserCircleIcon className={`h-5 w-5 ${!isCollapsed && 'mr-3'} transition-transform group-hover:scale-110`} />
                        {!isCollapsed && <span className="font-semibold text-sm">Profile</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full p-2.5 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-300 hover:shadow-md transition-all duration-300 group border border-transparent hover:border-rose-200 dark:hover:border-rose-800/30 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <ArrowLeftOnRectangleIcon className={`h-5 w-5 ${!isCollapsed && 'mr-3'} transition-transform group-hover:-translate-x-1`} />
                        {!isCollapsed && <span className="font-semibold text-sm">Sign Out</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
