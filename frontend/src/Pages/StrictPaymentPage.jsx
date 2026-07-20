// src/Pages/StrictPaymentPage.jsx - Manual Cash Payment with Admin Verification
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../Contexts/AuthContext";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PhoneIcon,
    UserIcon,
    BanknotesIcon,
    InformationCircleIcon,
    ArrowUpTrayIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    DocumentDuplicateIcon
} from "@heroicons/react/24/outline";

export default function StrictPaymentPage() {
    const { voucherId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [voucher, setVoucher] = useState(null);
    const [adminDetails, setAdminDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [transaction, setTransaction] = useState(null);

    const [scratchCode, setScratchCode] = useState(null);
    const [paymentProof, setPaymentProof] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        fetchData();
    }, [voucherId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch voucher details
            const { data: voucherData } = await client.get(`/vouchers/${voucherId}`);
            setVoucher(voucherData);

            // Fetch admin payment details
            try {
                const { data: adminData } = await client.get("/payment-details");
                setAdminDetails(adminData);
            } catch (err) {
                console.warn("Could not fetch admin details, using defaults", err);
                // Fallback dummy data as requested
                setAdminDetails({
                    adminName: "Vouchify Admin",
                    phoneNumber: "+91 98765 43210",
                    upiId: "admin@upi",
                    instructions: "Please mention the Voucher ID in the payment remarks."
                });
            }

            // Check for existing transaction
            const { data: transactions } = await client.get("/transactions?type=bought");
            const existingTx = transactions.find(t => (t.voucher?._id === voucherId || t.voucher === voucherId));

            if (existingTx) {
                setTransaction(existingTx);
                // If completed, try to get scratch code
                if (existingTx.status === "completed" || existingTx.status === "paid") {
                    try {
                        const { data: codeData } = await client.get(`/transactions/${existingTx._id}/scratch-code`);
                        setScratchCode(codeData.code);
                    } catch (err) {
                        console.error("Failed to fetch scratch code initially:", err);
                    }
                }
            }

            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load payment details");
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file (JPG, PNG)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("File size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPaymentProof(reader.result);
            setPreviewUrl(reader.result);
            setError("");
        };
        reader.readAsDataURL(file);
    };

    const handleRequestPurchase = async () => {
        if (!paymentProof) {
            setError("Please upload a screenshot of your payment.");
            return;
        }

        try {
            setProcessing(true);
            setError("");

            // Create transaction with pending status
            const { data } = await client.post(`/transactions/purchase/${voucherId}`, {
                paymentMethod: "cash",
                paymentProof: paymentProof,
            });

            setTransaction(data.transaction);
            setProcessing(false);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error("Error creating transaction:", err);
            setError(err.response?.data?.message || "Failed to create purchase request");
            setProcessing(false);
        }
    };

    const checkTransactionStatus = async () => {
        if (!transaction) return;

        try {
            const { data } = await client.get(`/transactions/${transaction._id}`);
            setTransaction(data);

            // If completed, try to get scratch code
            if (data.status === "completed" || data.status === "paid") {
                try {
                    const { data: codeData } = await client.get(`/transactions/${transaction._id}/scratch-code`);
                    setScratchCode(codeData.code); // Note: Backend returns { code: ... }, not { scratchCode: ... }
                } catch (err) {
                    console.error("Failed to fetch scratch code:", err);
                }
            }
        } catch (err) {
            console.error("Error checking status:", err);
        }
    };

    // Auto-check status every 10 seconds if pending
    useEffect(() => {
        if (transaction && transaction.status === "pending_admin_confirmation") {
            const interval = setInterval(checkTransactionStatus, 10000);
            return () => clearInterval(interval);
        }
    }, [transaction]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-indigo-50 dark:bg-slate-950 font-sans">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-300 font-bold animate-pulse">Initializing Payment Gateway...</p>
                </div>
            </div>
        );
    }

    if (error && !voucher) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-indigo-50 dark:bg-slate-950 font-sans p-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-800">
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Transaction Error</h2>
                    <p className="text-red-500 font-medium mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/vouchers")}
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        Back to Vouchers
                    </button>
                </div>
            </div>
        );
    }

    // Success View
    if (scratchCode) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-indigo-50 dark:bg-slate-950 font-sans py-12 px-4 transition-colors duration-500 flex items-center justify-center">
                {/* --- SKY ANIMATION --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="cloud c1"></div>
                    <div className="cloud c2"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-indigo-500/10 dark:from-green-900/20 dark:to-indigo-900/20"></div>
                </div>

                <div className="relative z-10 w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 lg:p-12 border border-green-200 dark:border-green-900 overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>

                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                            <div className="absolute -inset-2 bg-green-500/20 rounded-full animate-ping"></div>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Payment Verified!</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Your transaction was successful.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 mb-8 relative group border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Your Voucher Code</p>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 relative overflow-hidden">
                            <p className="text-3xl md:text-5xl font-mono font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-wider">
                                {scratchCode}
                            </p>
                        </div>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium flex items-center justify-center gap-2">
                            <ShieldCheckIcon className="h-4 w-4" /> Keep this code safe
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate("/profile")}
                            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            View Receipt
                        </button>
                        <button
                            onClick={() => navigate("/vouchers")}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-1"
                        >
                            Buy Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Pending View
    if (transaction && transaction.status === "pending_admin_confirmation") {
        return (
            <div className="min-h-screen relative overflow-hidden bg-indigo-50 dark:bg-slate-950 font-sans py-12 px-4 transition-colors duration-500 flex items-center justify-center">
                {/* --- SKY ANIMATION --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="cloud c1"></div>
                    <div className="cloud c2"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 dark:from-yellow-900/20 dark:to-orange-900/20"></div>
                </div>

                <div className="relative z-10 w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 lg:p-12 border border-yellow-200 dark:border-yellow-900 overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-600 animate-pulse"></div>

                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <ClockIcon className="h-12 w-12 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Analyzing Proof...</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Please wait while we verify your transaction.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Transaction Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Voucher</span>
                                <span className="text-slate-900 dark:text-white font-bold">{voucher?.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Amount</span>
                                <span className="text-slate-900 dark:text-white font-bold">₹{transaction.amountPaid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded text-xs font-bold uppercase">Pending Verification</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-8 flex items-start gap-3">
                        <InformationCircleIcon className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-800 dark:text-indigo-200 font-semibold leading-relaxed">
                            <span className="font-bold">Auto-Refresh Enabled:</span> This page will automatically update once the Admin approves your payment. You don't need to refresh manually.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => navigate("/profile")}
                            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            Go to Profile (Run in Background)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 font-sans relative overflow-hidden transition-colors duration-500 py-12 px-4">
            {/* --- SKY ANIMATION --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="cloud c1"></div>
                <div className="cloud c2"></div>
                <div className="cloud c3"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent dark:from-indigo-900/30 dark:via-purple-900/10 dark:to-slate-950"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Back Button */}
                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors mb-6 group">
                        <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Cancel Transaction
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* LEFT PANEL - INSTRUCTIONS & ADMIN INFO */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <h2 className="text-2xl font-black mb-1">Manual Payment</h2>
                            <p className="text-indigo-200 font-medium text-sm mb-8">Follow steps to complete purchase</p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0">1</div>
                                    <div>
                                        <h3 className="font-bold text-lg">Send Money</h3>
                                        <p className="text-indigo-100 text-xs leading-relaxed opacity-80">Transfer exact amount to the Admin account details below.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0">2</div>
                                    <div>
                                        <h3 className="font-bold text-lg">Upload Proof</h3>
                                        <p className="text-indigo-100 text-xs leading-relaxed opacity-80">Take a screenshot of the success screen and upload it here.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0">3</div>
                                    <div>
                                        <h3 className="font-bold text-lg">Wait for Approval</h3>
                                        <p className="text-indigo-100 text-xs leading-relaxed opacity-80">Admin will verify and release your voucher code instantly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Details Card */}
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white/50 dark:border-slate-800 shadow-lg">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <BanknotesIcon className="h-5 w-5 text-indigo-500" /> Admin Bank Details
                            </h3>

                            {adminDetails ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Holder</p>
                                            <p className="font-bold text-slate-700 dark:text-slate-300">{adminDetails.adminName}</p>
                                        </div>
                                        <UserIcon className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition" onClick={() => navigator.clipboard.writeText(adminDetails.phoneNumber)}>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone / PayId</p>
                                            <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{adminDetails.phoneNumber}</p>
                                        </div>
                                        <DocumentDuplicateIcon className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                                    </div>

                                    {adminDetails.upiId && (
                                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition" onClick={() => navigator.clipboard.writeText(adminDetails.upiId)}>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI ID</p>
                                                <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{adminDetails.upiId}</p>
                                            </div>
                                            <DocumentDuplicateIcon className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                                        </div>
                                    )}

                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                                        <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                                            {adminDetails.instructions}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-400 text-sm">Loading details...</div>
                            )}
                        </div>
                    </div>


                    {/* RIGHT PANEL - UPLOAD & CONFIRM */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-10 border border-white/50 dark:border-slate-800 shadow-2xl h-full flex flex-col">

                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                                {voucher?.imageUrl && (
                                    <img src={voucher.imageUrl} alt="Voucher" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                                )}
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white line-clamp-1">{voucher?.title}</h2>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-bold text-slate-400">Total to Pay:</span>
                                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">₹{voucher?.listedPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-center">
                                    Upload Payment Screenshot <span className="text-red-500">*</span>
                                </label>

                                <div className="relative group cursor-pointer w-full">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                                    />

                                    <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 min-h-[300px] ${previewUrl
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}>
                                        {previewUrl ? (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <img src={previewUrl} alt="Preview" className="max-h-[250px] object-contain rounded-lg shadow-lg" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg">
                                                    <p className="text-white font-bold flex items-center gap-2"><ArrowUpTrayIcon className="h-5 w-5" /> Change Image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <ArrowUpTrayIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                                                </div>
                                                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-2">Click to Upload</p>
                                                <p className="text-slate-400 text-xs">Supports JPG, PNG (Max 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg">
                                        <p className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
                                            <XCircleIcon className="h-5 w-5" /> {error}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={handleRequestPurchase}
                                    disabled={processing}
                                    className={`w-full py-5 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 ${processing
                                        ? 'bg-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30'
                                        }`}
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        "I Have Paid - Confirm"
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
                                    By clicking confirm, you agree that you have transferred the funds. False claims can lead to account suspension.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
