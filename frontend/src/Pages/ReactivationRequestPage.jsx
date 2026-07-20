import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../Contexts/AuthContext";
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowUpTrayIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    PaperAirplaneIcon,
    DocumentTextIcon,
    LinkIcon
} from "@heroicons/react/24/solid";

const ReactivationRequestPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [explanation, setExplanation] = useState("");
    const [proofUrls, setProofUrls] = useState("");
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await client.get("/reactivation/my-requests");
            setRequests(data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await client.post("/reactivation/submit", {
                explanation,
                proofUrls: proofUrls.split(",").map(u => u.trim()).filter(u => u),
            });
            setMessage({ type: "success", text: "Appeal Submitted. Our specialized team will review your case." });
            setExplanation("");
            setProofUrls("");
            fetchRequests();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Submission failed. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
            case "APPROVED": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
            case "REJECTED": return "bg-red-500/20 text-red-300 border-red-500/50";
            case "REQUIRES_PENALTY": return "bg-orange-500/20 text-orange-300 border-orange-500/50";
            default: return "bg-gray-500/20 text-gray-300";
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-indigo-500 ml-0 pl-0 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">

                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl mb-6 shadow-2xl backdrop-blur-xl border border-red-500/30 animate-bounce-slow">
                        <LockClosedIcon className="h-10 w-10 text-red-400" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-gray-400 mb-6 tracking-tight">
                        Account Access <span className="text-red-500">Restricted</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Your account has been temporarily suspended due to a violation of our policies.
                        We believe in fairness. If you think this is a mistake, appeal below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left: Appeal Form */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <DocumentTextIcon className="h-7 w-7 text-indigo-400" />
                            Submit an Appeal
                        </h2>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                                {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-400 mb-2 group-focus-within:text-indigo-400 transition">Why should we reactivate your account?</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-200 placeholder-gray-600 resize-none"
                                    placeholder="Explain the situation clearly..."
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-400 mb-2 group-focus-within:text-indigo-400 transition">Supporting Evidence (Link)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-200 placeholder-gray-600"
                                        placeholder="https://drive.google.com/..."
                                        value={proofUrls}
                                        onChange={(e) => setProofUrls(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>
                                        Submit Appeal <PaperAirplaneIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right: History Timeline */}
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full shadow-2xl">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <ClockIcon className="h-7 w-7 text-emerald-400" />
                                Review Status
                            </h2>

                            {requests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
                                    <ShieldCheckIcon className="h-12 w-12 mb-4 opacity-50" />
                                    <p>No appeals submitted yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-8 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>

                                    {requests.map((req, idx) => (
                                        <div key={req._id} className="relative pl-12 group">
                                            {/* Dot */}
                                            <div className={`absolute left-[11px] top-1 h-3 w-3 rounded-full border-2 border-[#0a0a0f] ring-2 ${req.status === 'APPROVED' ? 'bg-emerald-500 ring-emerald-500/50' : 'bg-indigo-500 ring-indigo-500/50'} z-10 transition-all group-hover:scale-125`}></div>

                                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition duration-300">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(req.status)}`}>
                                                        {req.status.replace("_", " ")}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                <p className="text-gray-300 text-sm italic mb-4 border-l-2 border-white/10 pl-3">"{req.explanation}"</p>

                                                {req.adminNote && (
                                                    <div className="bg-black/30 rounded-xl p-4 mt-3">
                                                        <p className="text-xs font-bold text-indigo-300 uppercase mb-1 flex items-center gap-2">
                                                            <ShieldCheckIcon className="h-3 w-3" /> Admin Response
                                                        </p>
                                                        <p className="text-sm text-gray-300">{req.adminNote}</p>
                                                    </div>
                                                )}

                                                {req.status === "REQUIRES_PENALTY" && !req.isPenaltyPaid && (
                                                    <button className="mt-4 w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl text-sm font-bold hover:brightness-110 transition shadow-lg shadow-orange-900/50 flex items-center justify-center gap-2">
                                                        Pay Penalty (₹{req.penaltyAmount || 500})
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReactivationRequestPage;
