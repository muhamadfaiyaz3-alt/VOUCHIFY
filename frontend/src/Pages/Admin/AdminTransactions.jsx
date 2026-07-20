import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    BanknotesIcon,
    ClockIcon,
    TagIcon,
    UserIcon,
    PhotoIcon,
    ArrowPathIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [fetchingVoucher, setFetchingVoucher] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data } = await client.get('/admin/transactions');
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchVoucherDetails = async (voucherId) => {
        setFetchingVoucher(true);
        try {
            const { data } = await client.get(`/vouchers/${voucherId}`);
            setSelectedVoucher(data);
        } catch (error) {
            console.error("Failed to fetch voucher details", error);
            alert("Could not load voucher detailed view.");
        } finally {
            setFetchingVoucher(false);
        }
    };

    const handleAction = async (id, action) => {
        const confirmMsg = action === 'complete'
            ? "Confirm payment received? This will release the code to the buyer."
            : "Reject this transaction?";

        if (!window.confirm(confirmMsg)) return;

        try {
            await client.patch(`/admin/transactions/${id}`, { action });
            fetchTransactions();
        } catch (error) {
            console.error("Action failed", error);
            alert("Failed to update transaction");
        }
    };

    const filteredTransactions = transactions.filter(txn => {
        const matchesFilter = filter === 'all' || txn.status === filter;
        const matchesSearch =
            txn._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.buyer?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.voucher?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Helper for Status Badge
    const StatusBadge = ({ status }) => {
        const styles = {
            completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
            paid: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
            pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            pending_admin_confirmation: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
            failed: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            rejected: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
        };

        const label = status === 'pending_admin_confirmation' ? 'Action Required' : status.replace('_', ' ');
        const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style} shadow-sm inline-flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'completed' || status === 'paid' ? 'bg-emerald-500' : 'bg-current animate-pulse'}`}></span>
                {label}
            </span>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
            <ArrowPathIcon className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-4 border-b border-gray-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 tracking-tight mb-2">
                            Transaction Ledger
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 font-medium">
                            Real-time monitoring of all financial movements on the platform.
                        </p>
                    </div>
                    {/* Search Bar - Glassmorphic */}
                    <div className="relative group w-full md:w-96">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative bg-white dark:bg-slate-800 rounded-xl flex items-center p-1 border border-gray-200 dark:border-slate-700">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-3" />
                            <input
                                type="text"
                                placeholder="Search ID, user, or voucher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2 text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All Transactions' },
                        { id: 'pending', label: 'Pending Payment' },
                        { id: 'pending_admin_confirmation', label: 'Needs Approval', icon: true },
                        { id: 'completed', label: 'Completed' },
                        { id: 'failed', label: 'Failed/Rejected' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setFilter(opt.id)}
                            className={`
                                relative whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                                ${filter === opt.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                                    : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                {opt.icon && <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>}
                                {opt.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Glassmorphic Table Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden relative">
                    {/* Decorative blurred blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Voucher</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Buyer</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-50">
                                                <BanknotesIcon className="h-16 w-16 text-gray-300 dark:text-slate-600 mb-4" />
                                                <p className="text-lg font-bold text-gray-400 dark:text-slate-500">No transactions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((txn, idx) => (
                                        <tr
                                            key={txn._id}
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                            className="group hover:bg-indigo-50/50 dark:hover:bg-slate-700/30 transition-colors animate-slide-up"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">#{txn._id.slice(-6).toUpperCase()}</div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                                    <ClockIcon className="h-3 w-3" />
                                                    {new Date(txn.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">{txn.voucher?.title || 'Unknown Voucher'}</div>
                                                <button
                                                    onClick={() => fetchVoucherDetails(txn.voucher._id)} // Fetch detailed voucher
                                                    className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold hover:underline mt-1 flex items-center gap-1 cursor-pointer"
                                                >
                                                    <TagIcon className="h-3 w-3" /> View Details
                                                </button>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {txn.buyer?.displayName?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-xs">{txn.buyer?.displayName}</div>
                                                        <div className="text-[10px] text-gray-400">{txn.buyer?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="font-black text-gray-900 dark:text-white">₹{txn.amountPaid?.toLocaleString()}</div>
                                                <div className="text-[10px] uppercase font-bold text-gray-400">{txn.paymentMethod || 'Manual'}</div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <StatusBadge status={txn.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {(txn.status === 'pending' || txn.status === 'pending_admin_confirmation') && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleAction(txn._id, 'complete')}
                                                            className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:scale-110 hover:shadow-lg transition-all"
                                                            title="Approve / Confirm Payment"
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(txn._id, 'reject')}
                                                            className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:scale-110 hover:shadow-lg transition-all"
                                                            title="Reject Transaction"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {txn.status === 'completed' && (
                                                    <span className="text-xs font-bold text-gray-300 dark:text-slate-600">Archived</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Full-Screen Voucher Detail Modal */}
                {(selectedVoucher || fetchingVoucher) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4 animate-fade-in" onClick={() => !fetchingVoucher && setSelectedVoucher(null)}>
                        {fetchingVoucher ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl animate-pulse">
                                <ArrowPathIcon className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                                <p className="font-bold text-gray-500 dark:text-gray-400">Loading Voucher Details...</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-3xl shadow-2xl relative animate-scale-up flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedVoucher(null)}
                                    className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-red-500 text-white rounded-full transition-all backdrop-blur-sm"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>

                                {/* Left Side: Image */}
                                <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 dark:bg-black relative">
                                    <img
                                        src={selectedVoucher.imageUrl || "https://dummyimage.com/600x800/2d2d2d/fff&text=No+Image"}
                                        className="w-full h-full object-cover"
                                        alt={selectedVoucher.title}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                                        {selectedVoucher.category}
                                    </div>
                                </div>

                                {/* Right Side: Details */}
                                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white dark:bg-slate-900">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">{selectedVoucher.brand}</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{selectedVoucher.title}</h2>

                                        <div className="flex items-end gap-3 mb-6">
                                            <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{selectedVoucher.listedPrice}</div>
                                            <div className="text-lg font-bold text-gray-400 line-through mb-1">₹{selectedVoucher.originalPrice}</div>
                                            <div className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold px-2 py-1 rounded text-sm">
                                                {Math.round(((selectedVoucher.originalPrice - selectedVoucher.listedPrice) / selectedVoucher.originalPrice) * 100)}% OFF
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="pb-6 border-b border-gray-100 dark:border-slate-800">
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                                    {selectedVoucher.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={selectedVoucher.owner?.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${selectedVoucher.owner?.displayName}`}
                                                    className="w-12 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-900"
                                                    alt="Seller"
                                                />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Listed By</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{selectedVoucher.owner?.displayName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                                <p className="text-[10px] font-black uppercase text-gray-400">Verified</p>
                                                <ShieldCheckIcon className="h-6 w-6 text-indigo-500 mx-auto mt-1" />
                                            </div>
                                            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                                <p className="text-[10px] font-black uppercase text-gray-400">Secure</p>
                                                <CheckCircleIcon className="h-6 w-6 text-emerald-500 mx-auto mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminTransactions;
