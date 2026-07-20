import React, { useState, useEffect } from "react";
import client from "../../api/client";
import {
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleBottomCenterTextIcon,
    DocumentArrowDownIcon,
    CurrencyRupeeIcon,
    CheckBadgeIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

const AdminReactivationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewData, setReviewData] = useState({ id: null, action: "", note: "", penalty: 500 });
    const [modalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState("PENDING");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await client.get("/admin/reactivation-requests");
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        try {
            await client.post(`/admin/reactivation-requests/${reviewData.id}/review`, {
                action: reviewData.action,
                adminNote: reviewData.note,
                penaltyAmount: reviewData.penalty
            });
            fetchRequests();
            setModalOpen(false);
        } catch (err) {
            alert("Error submitting review");
        }
    };

    const filteredRequests = requests.filter(r => filter === "ALL" || r.status === filter);

    const getStatusGradient = (status) => {
        switch (status) {
            case "PENDING": return "from-amber-400 to-orange-500";
            case "APPROVED": return "from-emerald-400 to-teal-500";
            case "REJECTED": return "from-rose-500 to-red-600";
            case "REQUIRES_PENALTY": return "from-indigo-500 to-purple-600";
            default: return "from-slate-400 to-slate-500";
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="flex flex-col items-center">
                <ArrowPathIcon className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-bold tracking-wide animate-pulse">Loading Requests...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

                {/* Header with Glassmorphism */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-slate-900 p-10 md:p-14 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ShieldCheckIcon className="h-96 w-96 text-white rotate-12" />
                    </div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-start gap-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                            <ArrowPathIcon className="h-3.5 w-3.5 animate-spin-slow" /> Support Center
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight">
                            Reactivation Appeals
                        </h1>
                        <p className="text-indigo-200 text-lg max-w-2xl font-medium leading-relaxed">
                            Review and manage account suspension appeals. Ensure platform integrity by verifying user claims and evidence.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 sticky top-4 z-30">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 flex overflow-x-auto w-full md:w-auto">
                        {["PENDING", "APPROVED", "REJECTED", "ALL"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${filter === f
                                        ? 'bg-gradient-to-r ' + getStatusGradient(f === 'ALL' ? 'PENDING' : f) + ' text-white shadow-lg scale-105'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {f === "ALL" ? "All History" : f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <FunnelIcon className="h-4 w-4" />
                        <span>Showing {filteredRequests.length} Requests</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 pb-20">
                    {filteredRequests.map((req, idx) => (
                        <div
                            key={req._id}
                            style={{ animationDelay: `${idx * 100}ms` }}
                            className="group relative bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl hover:shadow-2xlborder border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-500 hover:-translate-y-1 animate-slide-up"
                        >
                            {/* Status Gradient Border/Stripe */}
                            <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${getStatusGradient(req.status)}`}></div>
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getStatusGradient(req.status)} opacity-50`}></div>

                            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">

                                {/* User Profile Section */}
                                <div className="lg:w-1/4 min-w-[240px] flex flex-col gap-6 lg:border-r border-gray-100 dark:border-slate-700/50 pb-6 lg:pb-0 pr-0 lg:pr-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black bg-gradient-to-br ${getStatusGradient(req.status)} shadow-2xl shadow-indigo-500/20 transform group-hover:scale-110 transition-transform duration-500`}>
                                            {req.user?.displayName?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">{req.user?.displayName || "Unknown"}</h3>
                                            <p className="text-sm text-gray-400 font-mono mt-1 truncate max-w-[150px]">{req.user?.email}</p>
                                            <span className={`inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300`}>
                                                User ID: {req.user?._id?.slice(-4)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Requested On</div>
                                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-300">
                                                <ClockIcon className="h-4 w-4 text-indigo-500" />
                                                {new Date(req.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                                            <ChatBubbleBottomCenterTextIcon className="h-4 w-4" /> Appeal Statement
                                        </h4>
                                        <div className="relative">
                                            <div className="absolute -left-3 -top-3 text-6xl text-gray-100 dark:text-slate-700 font-serif opacity-50 select-none">“</div>
                                            <p className="relative z-10 text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium italic pl-4 border-l-4 border-indigo-100 dark:border-indigo-900/50 py-1">
                                                {req.explanation}
                                            </p>
                                        </div>

                                        <div className="mt-8">
                                            <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                                                <DocumentArrowDownIcon className="h-4 w-4" /> Supporting Evidence
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {req.proofUrls.length > 0 ? req.proofUrls.map((url, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="group/link flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-700 dark:text-white hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        <span>Document {idx + 1}</span>
                                                        <MagnifyingGlassIcon className="h-4 w-4 group-hover/link:scale-125 transition-transform" />
                                                    </a>
                                                )) : (
                                                    <span className="text-sm text-gray-400 italic bg-gray-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                                                        No evidence attached.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="lg:w-64 flex flex-col justify-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-700 pt-8 lg:pt-0 lg:pl-10">
                                    {req.status === "PENDING" ? (
                                        <>
                                            <p className="text-xs font-bold text-center text-gray-400 uppercase tracking-widest mb-2">Review Action</p>

                                            <button
                                                onClick={() => { setReviewData({ ...reviewData, id: req._id, action: "APPROVE", penalty: 0 }); setModalOpen(true); }}
                                                className="w-full py-4 px-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn"
                                            >
                                                <CheckCircleIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" /> Approve
                                            </button>

                                            <button
                                                onClick={() => { setReviewData({ ...reviewData, id: req._id, action: "REQUIRE_PENALTY", penalty: 500 }); setModalOpen(true); }}
                                                className="w-full py-4 px-6 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold rounded-2xl border border-orange-100 dark:border-orange-900/50 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn"
                                            >
                                                <CurrencyRupeeIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" /> Penalty
                                            </button>

                                            <button
                                                onClick={() => { setReviewData({ ...reviewData, id: req._id, action: "REJECT", penalty: 0 }); setModalOpen(true); }}
                                                className="w-full py-4 px-6 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl border border-rose-100 dark:border-rose-900/50 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn"
                                            >
                                                <XCircleIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" /> Reject
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className={`w-full max-w-[200px] aspect-square rounded-[2rem] bg-gradient-to-br ${getStatusGradient(req.status)} flex flex-col items-center justify-center text-white shadow-xl relative overflow-hidden group/status`}>
                                                <div className="absolute inset-0 bg-black/10 group-hover/status:bg-transparent transition-colors"></div>
                                                <CheckBadgeIcon className="h-16 w-16 mb-3 text-white drop-shadow-md transform group-hover/status:scale-110 transition-transform duration-300" />
                                                <div className="font-black text-lg tracking-wider uppercase drop-shadow-sm">{req.status}</div>
                                                <div className="text-[10px] uppercase font-bold text-white/80 mt-1">Processed</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-32 bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-double border-gray-100 dark:border-slate-700">
                            <CheckBadgeIcon className="h-24 w-24 text-gray-200 dark:text-slate-600 mx-auto mb-6" />
                            <h3 className="text-3xl font-black text-gray-400 dark:text-slate-500">All Caught Up!</h3>
                            <p className="text-gray-400 dark:text-slate-500 mt-2 font-medium">No requests matching this filter found.</p>
                        </div>
                    )}
                </div>

                {/* Premium Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setModalOpen(false)}></div>

                        <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-white/10">
                            <div className={`p-8 bg-gradient-to-r ${getStatusGradient(reviewData.action === 'APPROVE' ? 'APPROVED' : reviewData.action === 'REJECT' ? 'REJECTED' : 'REQUIRES_PENALTY')} text-white relative overflow-hidden`}>
                                <div className="absolute -right-10 -top-10 opacity-20"><ShieldCheckIcon className="h-40 w-40 rotate-12" /></div>
                                <h2 className="text-3xl font-black flex items-center gap-3 relative z-10">
                                    {reviewData.action === 'APPROVE' && <CheckCircleIcon className="h-8 w-8" />}
                                    {reviewData.action === 'REJECT' && <XCircleIcon className="h-8 w-8" />}
                                    {reviewData.action === 'REQUIRE_PENALTY' && <CurrencyRupeeIcon className="h-8 w-8" />}
                                    Confirm {reviewData.action.replace("REQUIRE_", "").replace("_", " ")}
                                </h2>
                                <p className="text-white/90 font-medium text-sm mt-2 relative z-10">This action cannot be undone lightly. Please verify.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Official Admin Reason</label>
                                    <textarea
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium resize-none shadow-inner"
                                        rows={4}
                                        placeholder="Reason for decision (Visible to user)..."
                                        value={reviewData.note}
                                        onChange={e => setReviewData({ ...reviewData, note: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                {reviewData.action === "REQUIRE_PENALTY" && (
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Penalty Amount (₹)</label>
                                        <div className="relative group">
                                            <CurrencyRupeeIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                            <input
                                                type="number"
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 font-black text-xl text-gray-900 dark:text-white transition-all shadow-sm"
                                                value={reviewData.penalty}
                                                onChange={e => setReviewData({ ...reviewData, penalty: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 rounded-2xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition transform hover:scale-[1.02]">
                                        Cancel
                                    </button>
                                    <button onClick={handleReview} className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black hover:shadow-xl hover:-translate-y-1 transition-all transform flex justify-center items-center gap-2">
                                        Confirm Action <ArrowPathIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReactivationRequests;
