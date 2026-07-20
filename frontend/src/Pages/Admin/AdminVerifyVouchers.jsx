import { useState, useEffect } from "react";
import client from "../../api/client";
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    UserIcon,
    ShieldCheckIcon,
    ArrowsRightLeftIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon
} from "@heroicons/react/24/outline";

export default function AdminVerifyVouchers() {
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [expandedDescriptions, setExpandedDescriptions] = useState({}); // New state for text expansion

    // Helper to toggle description
    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Background animation
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetchPendingVouchers();

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const fetchPendingVouchers = async () => {
        try {
            setLoading(true);
            const { data } = await client.get("/admin/vouchers/pending");
            setVouchers(data);
        } catch (err) {
            console.error("Error fetching vouchers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (voucherId, action) => {
        let rejectionReason = "";
        if (action === "reject") {
            const reason = prompt("Enter reason for rejection:");
            if (reason === null) return; // Cancelled
            rejectionReason = reason;
        }

        try {
            setProcessing(voucherId);
            await client.patch(`/admin/vouchers/${voucherId}/verify`, {
                action,
                rejectionReason
            });

            // Remove from list
            setVouchers(prev => prev.filter(v => v._id !== voucherId));

            // Close modal if open for this voucher
            if (selectedVoucher?._id === voucherId) {
                setSelectedVoucher(null);
            }
        } catch (err) {
            console.error("Verification error:", err);
            alert("Failed to update voucher status.");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return (
        <div className="min-h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-fuchsia-500/30 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-fuchsia-500 rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-full p-6 md:p-8 overflow-x-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-500 font-sans rounded-3xl">
            {/* Dynamic Sky Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 transition-colors duration-500">
                <div
                    className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-fuchsia-500/20 dark:bg-fuchsia-600/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[60px] md:blur-[100px] transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` }}
                />
            </div>

            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl shadow-lg p-6 md:p-8 mb-8 border border-white/20 dark:border-slate-700/50 animate-fade-in-down">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <ShieldCheckIcon className="h-8 w-8 md:h-10 md:w-10 text-fuchsia-600 dark:text-fuchsia-400" />
                    Verify Pending Vouchers
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Detailed review of voucher authenticity and seller verification.</p>
            </div>

            {vouchers.length === 0 ? (
                <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl shadow-lg p-12 md:p-20 text-center border border-white/20 dark:border-slate-700/50 animate-fade-in-up">
                    <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6 opacity-80" />
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">All caught up!</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">No pending vouchers to verify.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {vouchers.map((voucher) => (
                        <div key={voucher._id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/40 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 group">
                            <div className="p-0 lg:p-0"> {/* Removed padding here to let inner layout handle it */}
                                {/* Improved Grid Layout: Clear Separation for Desktop */}
                                <div className="grid grid-cols-1 xl:grid-cols-12 min-h-[400px]">

                                    {/* --- LEFT SECTION: Voucher Details (Spans 4 cols) --- */}
                                    <div className="xl:col-span-4 p-8 xl:border-r border-gray-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/20 flex flex-col">
                                        <div className="flex items-center gap-2 flex-wrap mb-6">
                                            {voucher.brand && voucher.brand !== voucher.category ? (
                                                <>
                                                    <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                                                        {voucher.brand}
                                                    </span>
                                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                                        {voucher.category}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                                                    {voucher.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3 break-words pr-2">{voucher.title}</h3>
                                            <div className="mb-6 relative">
                                                <p className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap ${expandedDescriptions[voucher._id] ? '' : 'line-clamp-4'}`}>
                                                    {voucher.description}
                                                </p>
                                                {voucher.description && voucher.description.length > 100 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleDescription(voucher._id);
                                                        }}
                                                        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-1 hover:underline focus:outline-none"
                                                    >
                                                        {expandedDescriptions[voucher._id] ? 'Show Less' : 'Read More'}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="bg-white/50 dark:bg-slate-700/30 p-5 rounded-2xl border border-gray-100 dark:border-slate-600/50 mb-6">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">Original Value</p>
                                                    <p className="font-bold text-gray-400 line-through">₹{voucher.originalPrice}</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">Selling Price</p>
                                                    <p className="font-extrabold text-3xl text-emerald-600 dark:text-emerald-400">₹{voucher.listedPrice}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Badge if High */}
                                        {voucher.fraudRiskScore > 0 && (
                                            <div className={`p-4 rounded-xl border flex items-center gap-3 mt-auto
                                                    ${voucher.fraudRiskLevel === 'Critical' || voucher.fraudRiskScore > 75 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' :
                                                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'}`}>
                                                <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-xs uppercase">Fraud Risk: {voucher.fraudRiskLevel}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* --- MIDDLE SECTION: Comparisons & Seller (Spans 6 cols) --- */}
                                    <div className="xl:col-span-6 p-8 flex flex-col justify-center bg-gray-50/50 dark:bg-slate-800/50">

                                        {/* Seller Micro-Profile */}
                                        <div className="flex items-center gap-4 mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-0.5 shadow-lg shrink-0">
                                                <img
                                                    src={voucher.owner?.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${voucher.owner?.displayName}`}
                                                    alt=""
                                                    className="h-full w-full object-cover rounded-full bg-white dark:bg-slate-900"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-0.5">Verified Seller</p>
                                                <p className="text-base font-bold text-gray-900 dark:text-white truncate">{voucher.owner?.displayName || "Unknown Seller"}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{voucher.owner?.email}</p>
                                            </div>
                                        </div>

                                        {/* Comparison Interface */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-end mb-3 px-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                                                    <ShieldCheckIcon className="w-4 h-4 text-fuchsia-500" /> Proof Comparison
                                                </p>
                                                <span className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 px-2 py-0.5 rounded text-[10px] font-bold border border-fuchsia-200 dark:border-fuchsia-800">Click to Inspect</span>
                                            </div>

                                            <button
                                                onClick={() => { setSelectedVoucher(voucher); setZoomLevel(1); }}
                                                className="w-full group/btn relative bg-white dark:bg-black/40 p-3 rounded-3xl border border-gray-200 dark:border-slate-700 hover:border-fuchsia-400 dark:hover:border-fuchsia-600 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-300 overflow-hidden flex-1 min-h-[220px]"
                                            >
                                                <div className="grid grid-cols-2 gap-3 h-full">
                                                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900/50 shadow-inner h-full border border-gray-100 dark:border-gray-800">
                                                        {voucher.imageUrl ? (
                                                            <img src={voucher.imageUrl} className="w-full h-full object-cover group-hover/btn:scale-105 transition duration-700 ease-out" alt="Asset" />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                                <ExclamationTriangleIcon className="w-8 h-8 mb-2 opacity-50" />
                                                                <span className="text-[10px] font-bold uppercase">No Asset</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Reference</span>
                                                        </div>
                                                    </div>

                                                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900/50 shadow-inner h-full border border-gray-100 dark:border-gray-800">
                                                        {voucher.userVerificationImage ? (
                                                            <img src={voucher.userVerificationImage} className="w-full h-full object-cover group-hover/btn:scale-105 transition duration-700 ease-out" alt="Selfie" />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-red-400">
                                                                <ExclamationTriangleIcon className="w-8 h-8 mb-2 opacity-50" />
                                                                <span className="text-[10px] font-bold uppercase">No Proof</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 left-2 bg-fuchsia-600/80 backdrop-blur-sm px-2 py-1 rounded-md">
                                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Submitted</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Button Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                                    <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-black shadow-2xl flex items-center gap-2 transform scale-90 group-hover/btn:scale-100 transition-all duration-300 hover:scale-105 border-4 border-white/20 dark:border-black/20">
                                                        <ArrowsRightLeftIcon className="w-5 h-5" /> EXPAND VIEW
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* --- RIGHT SECTION: Actions (Spans 2 cols) --- */}
                                    <div className="xl:col-span-2 p-4 xl:border-l border-gray-200 dark:border-slate-700 flex flex-col justify-center gap-4 bg-white/40 dark:bg-slate-800/20">
                                        <button
                                            onClick={() => handleVerify(voucher._id, "approve")}
                                            disabled={processing === voucher._id}
                                            className="w-full py-6 xl:py-0 xl:h-1/2 bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-emerald-500/40 transition-all flex flex-col items-center justify-center gap-2 group/act disabled:opacity-50 disabled:grayscale relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/act:opacity-100 transition-opacity"></div>
                                            <CheckCircleIcon className="h-10 w-10 transition-transform group-hover/act:scale-110" />
                                            <span className="text-xs uppercase tracking-widest">Approve</span>
                                        </button>

                                        <button
                                            onClick={() => handleVerify(voucher._id, "reject")}
                                            disabled={processing === voucher._id}
                                            className="w-full py-6 xl:py-0 xl:h-1/2 bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-rose-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-2 group/act disabled:opacity-50 hover:border-rose-300 dark:hover:border-rose-700"
                                        >
                                            <XCircleIcon className="h-10 w-10 transition-transform group-hover/act:scale-110 opacity-80" />
                                            <span className="text-xs uppercase tracking-widest">Reject</span>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SIDE-BY-SIDE COMPARISON MODAL */}
            {selectedVoucher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-4 animate-fade-in text-sans">
                    <div className="bg-white dark:bg-slate-900 w-full md:max-w-[95vw] h-full md:h-[90vh] rounded-none md:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-up border border-white/10 ring-1 ring-white/10 relative">

                        {/* Mobile Close Button (Absolute) */}
                        <button onClick={() => setSelectedVoucher(null)} className="md:hidden absolute top-4 right-4 z-[60] bg-black/50 text-white p-2 rounded-full">
                            <XCircleIcon className="h-8 w-8" />
                        </button>

                        {/* Modal Header */}
                        <div className="bg-gray-900 text-white px-6 py-4 md:px-8 md:py-5 flex items-center justify-between relative shrink-0 border-b border-gray-800">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                                    <ShieldCheckIcon className="h-7 w-7 text-fuchsia-500" />
                                    <span className="hidden md:inline">Proof Verification Console</span>
                                    <span className="md:hidden">Verify Proof</span>
                                </h2>
                                <p className="text-gray-400 text-xs mt-1 font-mono tracking-wide">ID: {selectedVoucher._id.slice(-6)}</p>
                            </div>

                            <div className="hidden md:flex items-center gap-4">
                                <div className="flex bg-gray-800 rounded-lg p-1">
                                    <button onClick={() => setZoomLevel(1)} className={`px-3 py-1 rounded text-xs font-bold transition ${zoomLevel === 1 ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}>1x</button>
                                    <button onClick={() => setZoomLevel(1.5)} className={`px-3 py-1 rounded text-xs font-bold transition ${zoomLevel === 1.5 ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}>1.5x</button>
                                    <button onClick={() => setZoomLevel(2)} className={`px-3 py-1 rounded text-xs font-bold transition ${zoomLevel === 2 ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}>2x</button>
                                </div>
                                <button onClick={() => setSelectedVoucher(null)} className="p-2 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white">
                                    <XCircleIcon className="h-8 w-8" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Images */}
                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-black relative">
                            {/* Grid overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

                            {/* Left: Voucher Asset */}
                            <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col min-h-0 relative group">
                                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/20">
                                    Voucher Image
                                </div>
                                <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-auto relative cursor-grab active:cursor-grabbing bg-gray-900/50" >
                                    {selectedVoucher.imageUrl ? (
                                        <img
                                            src={selectedVoucher.imageUrl}
                                            className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-200"
                                            style={{ transform: `scale(${zoomLevel})` }}
                                            alt="Voucher Asset"
                                        />
                                    ) : (
                                        <p className="text-gray-600 font-bold">No Image Provided</p>
                                    )}
                                </div>
                            </div>

                            {/* Right: Live Selfie */}
                            <div className="flex-1 flex flex-col min-h-0 relative group">
                                <div className="absolute top-4 left-4 z-10 bg-fuchsia-900/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-fuchsia-500/50 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    Live Selfie
                                </div>
                                <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-auto relative cursor-grab active:cursor-grabbing bg-black">
                                    {selectedVoucher.userVerificationImage ? (
                                        <img
                                            src={selectedVoucher.userVerificationImage}
                                            className="max-w-full max-h-full object-contain shadow-2xl border-4 border-fuchsia-500/30 rounded-lg transition-transform duration-200"
                                            style={{ transform: `scale(${zoomLevel})` }}
                                            alt="Live Selfie"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center">
                                            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-4 animate-pulse" />
                                            <p className="text-red-500 font-bold text-xl">Missing Verification Photo</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Actions */}
                        <div className="bg-gray-900 border-t border-gray-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
                            <div className="text-sm hidden md:block">
                                <p className="font-bold text-white text-lg">{selectedVoucher.title}</p>
                                <p className="text-gray-400">Listed by: <span className="text-fuchsia-400">{selectedVoucher.owner?.displayName}</span></p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => handleVerify(selectedVoucher._id, "reject")}
                                    className="flex-1 md:flex-none flex items-center justify-center px-4 md:px-8 py-3 bg-red-500/10 text-red-400 border border-red-500/50 rounded-xl font-bold hover:bg-red-500/20 transition whitespace-nowrap"
                                >
                                    <XCircleIcon className="h-5 w-5 mr-2" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerify(selectedVoucher._id, "approve")}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 md:px-10 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl font-bold hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-900/30 transition transform hover:-translate-y-1 whitespace-nowrap"
                                >
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    Approve Matching
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
