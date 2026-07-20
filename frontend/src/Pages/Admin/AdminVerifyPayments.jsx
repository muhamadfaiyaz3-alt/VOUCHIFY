// src/Pages/Admin/AdminVerifyPayments.jsx - Admin Panel to Verify Manual Payments
import { useState, useEffect } from "react";
import client from "../../api/client";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    PaperAirplaneIcon,
    BanknotesIcon
} from "@heroicons/react/24/outline";

export default function AdminVerifyPayments() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [filter, setFilter] = useState("pending_admin_confirmation");
    const [viewProof, setViewProof] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetchTransactions();

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data } = await client.get(`/admin/transactions?status=${filter}`);
            setTransactions(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setLoading(false);
        }
    };

    const handleVerifyPayment = async (transactionId, action) => {
        let note = action === "complete" ? "Payment verified and confirmed" : "Payment not received";

        if (action === "reject") {
            const reason = prompt("Enter reason for rejection (this will be sent to the user):", "Payment not received within time limit.");
            if (reason === null) return; // Cancelled
            note = reason;
        }

        try {
            setProcessing(transactionId);
            await client.patch(`/admin/transactions/${transactionId}/verify`, {
                action, // "complete" or "reject"
                adminNote: note,
            });
            await fetchTransactions();
            setProcessing(null);
        } catch (err) {
            console.error("Error verifying payment:", err);
            alert("Failed to verify payment: " + (err.response?.data?.message || err.message));
            setProcessing(null);
        }
    };

    if (loading) return (
        <div className="min-h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500/30 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-full p-4 md:p-6 overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-500 font-sans rounded-3xl">
            {/* Dynamic Sky Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 transition-colors duration-500">
                <div
                    className="absolute top-[-20%] right-[-10%] w-[350px] md:w-[700px] h-[350px] md:h-[700px] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[80px] md:blur-[100px] animate-pulse transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)` }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-[70px] md:blur-[90px] transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)` }}
                />
            </div>

            {/* Header */}
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl shadow-lg p-6 md:p-8 mb-8 border border-white/20 dark:border-slate-700/50 relative overflow-hidden group">
                {/* Decorative sheen */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex flex-wrap items-center gap-3">
                    <BanknotesIcon className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 animate-bounce-slow" />
                    Verify Manual Payments
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg max-w-2xl">Review and confirm cash payments from users. Ensure funds are received before approving.</p>

                {/* Stats Summary - Optional quick view */}
                <div className="mt-6 flex flex-wrap gap-4">
                    <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold text-sm border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Pending: {transactions.filter(t => t.status === 'pending_admin_confirmation').length}
                    </div>
                </div>
            </div>

            {/* Filter Tabs - Stack on Mobile */}
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-lg mb-8 p-1 border border-white/20 dark:border-slate-700/50 flex flex-col md:flex-row gap-2">
                <button
                    onClick={() => setFilter("pending_admin_confirmation")}
                    className={`flex-1 px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${filter === "pending_admin_confirmation"
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30 scale-[1.02]"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                        }`}
                >
                    <ClockIcon className="h-5 w-5" />
                    <span className="text-sm md:text-base">Pending</span>
                </button>
                <button
                    onClick={() => setFilter("completed")}
                    className={`flex-1 px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${filter === "completed"
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                        }`}
                >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="text-sm md:text-base">History</span>
                </button>
                <button
                    onClick={() => setFilter("failed")}
                    className={`flex-1 px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${filter === "failed"
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                        }`}
                >
                    <XCircleIcon className="h-5 w-5" />
                    <span className="text-sm md:text-base">Failed</span>
                </button>
            </div>

            {/* Transactions List */}
            {transactions.length === 0 ? (
                <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl shadow-lg p-12 md:p-20 text-center border border-white/20 dark:border-slate-700/50 animate-fade-in-up">
                    <ClockIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                    <p className="text-gray-600 dark:text-gray-300 text-2xl font-bold">No transactions found</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try changing the filter or check back later.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:gap-8">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction._id}
                            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/40 dark:border-slate-700/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="p-6 md:p-8">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                                    {/* Left Column - User & Voucher Info */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white/50 dark:bg-slate-700/30 rounded-2xl border border-white/20 dark:border-slate-600/30 text-center sm:text-left">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shrink-0">
                                                <UserIcon className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Buyer</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white break-all">
                                                    {transaction.buyer?.displayName || "Unknown"}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">{transaction.buyer?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white/50 dark:bg-slate-700/30 rounded-2xl border border-white/20 dark:border-slate-600/30 text-center sm:text-left">
                                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg shrink-0">
                                                <ShoppingBagIcon className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Voucher</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {transaction.voucher?.title || "Unknown Voucher"}
                                                </p>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">ID: {transaction.voucher?._id?.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Payment Info */}
                                    <div className="flex flex-col justify-between gap-4">
                                        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800/50 relative overflow-hidden text-center sm:text-left">
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                                                    <CurrencyDollarIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Total Amount</p>
                                                </div>
                                                <p className="text-4xl md:text-5xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                                                    ₹{transaction.amountPaid.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none">
                                                <BanknotesIcon className="w-40 h-40 transform translate-x-10 translate-y-10" />
                                            </div>
                                        </div>

                                        {/* View Proof Button */}
                                        {transaction.paymentProof ? (
                                            <button
                                                onClick={() => setViewProof(transaction.paymentProof)}
                                                className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-3 border border-indigo-200 dark:border-indigo-800/50 group-hover:scale-[1.02]"
                                            >
                                                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                                View Payment Proof
                                            </button>
                                        ) : (
                                            <div className="w-full py-4 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-center text-sm border border-gray-200 dark:border-slate-600">
                                                No Proof Uploaded
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Transaction Details Footer */}
                                <div className="bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-slate-700/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Transaction ID</p>
                                            <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
                                                {transaction._id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Payment Method</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                                                {transaction.paymentMethod}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Date</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Status</p>
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${transaction.status === "completed"
                                                    ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                                                    : transaction.status === "pending_admin_confirmation"
                                                        ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                                                        : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300"
                                                    }`}
                                            >
                                                {transaction.status.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons (only for pending) */}
                                {transaction.status === "pending_admin_confirmation" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <button
                                            onClick={() => handleVerifyPayment(transaction._id, "reject")}
                                            disabled={processing === transaction._id}
                                            className="px-6 py-4 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-xl font-bold text-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-1"
                                        >
                                            <XCircleIcon className="h-6 w-6" />
                                            {processing === transaction._id ? "Processing..." : "Reject"}
                                        </button>
                                        <button
                                            onClick={() => handleVerifyPayment(transaction._id, "complete")}
                                            disabled={processing === transaction._id}
                                            className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-1"
                                        >
                                            <CheckCircleIcon className="h-6 w-6" />
                                            {processing === transaction._id ? "Processing..." : "Confirm"}
                                        </button>
                                    </div>
                                )}

                                {/* Admin Note (if any) */}
                                {transaction.adminNote && (
                                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl p-4">
                                        <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase mb-1">Admin Note</p>
                                        <p className="text-blue-800 dark:text-blue-200">{transaction.adminNote}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Proof Modal */}
            {viewProof && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setViewProof(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl animate-scale-up border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <PaperAirplaneIcon className="w-6 h-6 text-indigo-500 -rotate-45" />
                                Payment Proof
                            </h3>
                            <button
                                onClick={() => setViewProof(null)}
                                className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                            >
                                <XCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black/50 rounded-2xl p-2 flex items-center justify-center border border-gray-200 dark:border-slate-800">
                            <img src={viewProof} alt="Payment Proof" className="max-w-full max-h-full object-contain shadow-lg" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
