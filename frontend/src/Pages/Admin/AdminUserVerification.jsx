import React, { useEffect, useState } from "react";
import client from "../../api/client";
import {
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    XCircleIcon,
    CheckCircleIcon,
    XMarkIcon,
    EyeIcon,
    UserCircleIcon, // kept for potential use
    MapPinIcon, // kept for potential use
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon,
    BellAlertIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    CalendarDaysIcon,
    BriefcaseIcon
} from "@heroicons/react/24/outline";

export default function AdminUserVerification() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Pending"); // Pending, All
    const [selectedUser, setSelectedUser] = useState(null); // For Proof Modal (Verification Action)
    const [viewUserDetails, setViewUserDetails] = useState(null); // For Profile Details Modal (Read Only)
    const [selectedUpdate, setSelectedUpdate] = useState(null); // For Update Detail Modal (Audit Log View)
    const [zoomLevel, setZoomLevel] = useState(1);
    const [proofModalOpen, setProofModalOpen] = useState(false);

    // Notification / Updates State
    const [updates, setUpdates] = useState([]);
    const [notifSidebarOpen, setNotifSidebarOpen] = useState(false);

    // Background animation state
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetchUsers();
        fetchUpdates();

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const fetchUpdates = async () => {
        try {
            // Fetch unread logs. 
            const { data } = await client.get("/admin/audit-logs?isRead=false");
            // Client-side filter to ensure we strictly show profile updates here
            const profileUpdates = data.filter(log => log.action && log.action.startsWith("PROFILE_UPDATE"));
            setUpdates(profileUpdates);
        } catch (error) {
            console.error("Failed to fetch updates", error);
        }
    };

    const handleMarkAsRead = async (e, logId) => {
        if (e) e.stopPropagation();
        try {
            await client.patch(`/admin/audit-logs/${logId}/read`);
            setUpdates(prev => prev.filter(u => u._id !== logId));
            if (selectedUpdate && selectedUpdate._id === logId) {
                setSelectedUpdate(null);
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await client.get("/admin/users/verification");
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId, status, remarks = "") => {
        // Optimistic UI Update
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, identityVerificationStatus: status } : u));

        // If currently viewing this user in verify modal
        if (selectedUser?._id === userId) {
            setSelectedUser(prev => ({ ...prev, identityVerificationStatus: status }));
            if (status === 'Verified' || status === 'Rejected') {
                setTimeout(() => setProofModalOpen(false), 1000); // Close after 1s success feedback
            }
        }

        try {
            await client.patch(`/admin/users/${userId}/verify`, { status, rejectionReason: remarks });
        } catch (error) {
            console.error("Failed to update status", error);
            fetchUsers(); // Revert
        }
    };

    const filteredUsers = filter === "All"
        ? users
        : users.filter(u => u.identityVerificationStatus === "Pending" || (u.identityProofUrl && u.identityVerificationStatus === "None"));

    if (loading) return (
        <div className="min-h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/30 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-full p-4 md:p-6 overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-500 font-sans rounded-3xl">
            {/* Dynamic Sky Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 transition-colors duration-500">
                <div
                    className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[60px] md:blur-[100px] transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)` }}
                />
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 relative z-10 animate-fade-in-down gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 mb-2 filter drop-shadow-sm">
                        Identity Verification
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Securely verify user documents to prevent fraud.</p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap w-full lg:w-auto bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-white/20 dark:border-slate-700/50 gap-2 mt-4 lg:mt-0">
                    <button
                        onClick={() => setNotifSidebarOpen(!notifSidebarOpen)}
                        className={`flex-1 md:flex-none relative px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${notifSidebarOpen ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}
                    >
                        <BellAlertIcon className="w-5 h-5" />
                        <span className="relative flex h-3 w-3 absolute top-2 right-2">
                            {updates.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${updates.length > 0 ? "bg-white" : "hidden"}`}></span>
                        </span>
                        <span className="hidden md:inline">Updates</span>
                    </button>
                    <div className="w-px bg-gray-300 dark:bg-slate-600 my-1 mx-1 hidden md:block"></div>
                    <button
                        onClick={() => { setFilter("Pending"); setNotifSidebarOpen(false); }}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${filter === "Pending" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => { setFilter("All"); setNotifSidebarOpen(false); }}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${filter === "All" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}
                    >
                        All Users
                    </button>
                </div>
            </div>

            <div className="flex gap-6 items-start relative z-10">
                {/* Main Table */}
                <div className="flex-1 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden min-h-[500px] animate-fade-in-up w-full">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-white/50 dark:bg-slate-900/50 border-b border-gray-200/50 dark:border-slate-700/50">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Details</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submission Date</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/30 dark:divide-slate-700/30">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-50">
                                                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                                                <p className="text-xl font-bold text-gray-500 dark:text-gray-400">
                                                    {filter === "Pending" ? "All caught up!" : "No users found"}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {filter === "Pending" ? "No pending verifications found." : "There are no users in the system matching this filter."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-white/60 dark:hover:bg-slate-700/40 transition duration-300 group">
                                            {/* Clickable User Details Row - Triggers User Details Modal */}
                                            <td className="px-8 py-5 cursor-pointer" onClick={() => setViewUserDetails(user)}>
                                                <div className="flex items-center gap-4 group/user">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 p-0.5 shadow-md group-hover/user:scale-110 transition-transform flex-shrink-0">
                                                        <img src={user.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${user.displayName}`} alt="" className="h-full w-full object-cover rounded-full bg-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-lg group-hover/user:text-indigo-600 dark:group-hover/user:text-indigo-400 transition-colors">
                                                            {user.displayName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md border ${user.identityVerificationStatus === 'Verified' ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' :
                                                    user.identityVerificationStatus === 'Rejected' ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30' :
                                                        'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30'
                                                    }`}>
                                                    {user.identityVerificationStatus || 'None'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {user.identityProofUrl ? (
                                                    <button
                                                        onClick={() => { setSelectedUser(user); setProofModalOpen(true); setZoomLevel(1); setNotifSidebarOpen(false); }}
                                                        className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition font-bold text-sm border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-indigo-500/20 hover:-translate-y-0.5 whitespace-nowrap"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        Review Proof
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No document</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* UPDATES SIDEBAR (Enhanced) */}
                {notifSidebarOpen && (
                    <>
                        {/* Backdrop for Mobile */}
                        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setNotifSidebarOpen(false)}></div>

                        <div className="w-full md:w-96 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-t-3xl md:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col h-[80vh] md:h-[700px] animate-slide-in-right fixed bottom-0 md:top-32 md:right-6 md:bottom-auto z-30 ring-1 ring-white/20">
                            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <BellAlertIcon className="w-5 h-5 text-red-500" />
                                    Activity Feed
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold shadow-lg shadow-red-500/40">{updates.length}</span>
                                    <button onClick={() => setNotifSidebarOpen(false)} className="md:hidden p-1 bg-gray-200 dark:bg-slate-700 rounded-full">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
                                {updates.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">No recent updates found.</div>
                                ) : (
                                    updates.map((log) => (
                                        <div key={log._id} onClick={() => setSelectedUpdate(log)} className="p-4 border-b border-gray-100 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-700/50 transition cursor-pointer group relative">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 p-1.5 rounded-full ${log.action.includes("PROOF") ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
                                                    <IdentificationIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                                            {log.action.includes("PROOF") ? "Proof Update" : "Profile Details Update"}
                                                        </p>
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(e, log._id)}
                                                            className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition z-10"
                                                            title="Mark as Read"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <img src={log.actor?.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${log.actor?.displayName || 'User'}`} className="w-4 h-4 rounded-full" alt="" />
                                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{log.actor?.displayName || 'Unknown User'}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{log.details}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                                        <ArrowPathIcon className="w-3 h-3" />
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Inline Preview (Mini) */}
                                            {log.metadata?.changes && Object.keys(log.metadata.changes).length > 0 && !log.action.includes("PROOF") && (
                                                <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                                    {Object.entries(log.metadata.changes).slice(0, 2).map(([key, val]) => (
                                                        <div key={key} className="text-xs mb-1 last:mb-0">
                                                            <span className="font-bold uppercase text-gray-500 text-[10px]">{key}: </span>
                                                            <span className="text-red-500 line-through mr-1">{val.old}</span>
                                                            <span className="text-green-500">{val.new}</span>
                                                        </div>
                                                    ))}
                                                    {Object.keys(log.metadata.changes).length > 2 && <p className="text-[10px] text-gray-400 italic">+ more changes</p>}
                                                </div>
                                            )}

                                            {log.action.includes("PROOF") && (
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    <div className="border border-red-200 dark:border-red-900/50 rounded-lg p-1 bg-red-50 dark:bg-red-900/20 text-center">
                                                        <p className="text-[10px] font-bold text-red-500 mb-1">PREVIOUS</p>
                                                        <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                                            <img src={log.metadata?.oldProof} className="w-full h-full object-cover opacity-70 grayscale" alt="Old" />
                                                        </div>
                                                    </div>
                                                    <div className="border border-green-200 dark:border-green-900/50 rounded-lg p-1 bg-green-50 dark:bg-green-900/20 text-center">
                                                        <p className="text-[10px] font-bold text-green-500 mb-1">NEW VERSION</p>
                                                        <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                                            <img src={log.metadata?.newProof} className="w-full h-full object-cover" alt="New" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div >

            {/* **NEW**: Update Detail Modal (Full Screen Diff View) */}
            {
                selectedUpdate && (
                    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedUpdate(null)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700 flex flex-col animate-scale-up ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={selectedUpdate.actor?.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${selectedUpdate.actor?.displayName || 'User'}`} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-md" alt="" />
                                        <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                                            <UserCircleIcon className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {selectedUpdate.actor?.displayName || "Unknown User"}
                                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">User</span>
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUpdate.actor?.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUpdate(null)} className="p-2 bg-gray-200 dark:bg-slate-700 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600 transition"><XMarkIcon className="w-6 h-6" /></button>
                            </div>

                            {/* Body - Comparison */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 pointer-events-none"></div>
                                <div className="relative z-10">
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-indigo-500 pl-3">Update Details</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm font-medium">{selectedUpdate.details}</p>

                                    {/* Field Changes Table */}
                                    {selectedUpdate.metadata?.changes && !selectedUpdate.action.includes("PROOF") && (
                                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
                                            <table className="w-full bg-white dark:bg-slate-800 text-left">
                                                <thead className="bg-gray-100 dark:bg-slate-900/50">
                                                    <tr>
                                                        <th className="p-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Field</th>
                                                        <th className="p-4 font-bold text-red-500 uppercase text-xs w-1/3">Old Value</th>
                                                        <th className="p-4 font-bold text-green-500 uppercase text-xs w-1/3">New Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                                    {Object.entries(selectedUpdate.metadata.changes).map(([field, vals]) => (
                                                        <tr key={field} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                                                            <td className="p-4 font-bold text-gray-700 dark:text-gray-300 capitalize">{field}</td>
                                                            <td className="p-4 text-red-600 dark:text-red-400 font-mono bg-red-50/50 dark:bg-red-900/10 break-all">{vals.old}</td>
                                                            <td className="p-4 text-green-600 dark:text-green-400 font-mono bg-green-50/50 dark:bg-green-900/10 break-all">{vals.new}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Proof Comparison with Zoom */}
                                    {selectedUpdate.action.includes("PROOF") && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div className="space-y-2">
                                                <p className="font-bold text-red-500 text-center uppercase tracking-widest text-sm bg-red-100 dark:bg-red-900/30 py-1 rounded-lg">Previous Version</p>
                                                <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden h-64 md:h-80 shadow-inner border border-red-200 dark:border-red-900/30 relative group">
                                                    <img src={selectedUpdate.metadata?.oldProof} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 hover:scale-105" alt="Old Proof" />
                                                    <div className="absolute inset-0 bg-red-500/10 mix-blend-multiply pointer-events-none"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-bold text-green-500 text-center uppercase tracking-widest text-sm bg-green-100 dark:bg-green-900/30 py-1 rounded-lg">New Version</p>
                                                {/* Zoomable Container Trigger */}
                                                <div
                                                    className="bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden h-64 md:h-80 shadow-2xl border-2 border-green-500/50 relative group cursor-zoom-in"
                                                    onClick={() => { setSelectedUser({ identityProofUrl: selectedUpdate.metadata?.newProof, displayName: selectedUpdate.actor?.displayName, role: 'Applicant' }); setProofModalOpen(true); setZoomLevel(1); }}
                                                >
                                                    <img src={selectedUpdate.metadata?.newProof} className="w-full h-full object-cover transition duration-500 hover:scale-105" alt="New Proof" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1 group-hover:scale-105 transition">
                                                        <MagnifyingGlassPlusIcon className="w-3 h-3" /> Click to Zoom
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                                <button onClick={() => setSelectedUpdate(null)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition">Close</button>
                                <button onClick={(e) => handleMarkAsRead(e, selectedUpdate._id)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5" /> Mark as Read
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Verification Modal (Proof Review) / Zoom Inspector */}
            {
                proofModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 md:p-4 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full md:max-w-7xl h-full md:h-[85vh] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up border border-white/10 ring-1 ring-white/10 relative">

                            {/* Mobile Close Button */}
                            <button
                                onClick={() => setProofModalOpen(false)}
                                className="md:hidden absolute top-4 right-4 z-[60] bg-black/50 text-white p-2 rounded-full"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            {/* LEFT: User Details / Instructions */}
                            <div className="w-full md:w-1/4 bg-gray-50 dark:bg-slate-800/80 border-r border-gray-200 dark:border-slate-700 flex flex-col backdrop-blur-sm p-6 justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <MagnifyingGlassPlusIcon className="w-6 h-6 text-indigo-500" />
                                        Inspector
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Document Owner</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{selectedUser.displayName || "Unknown"}</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
                                            <p className="font-bold mb-1">Instructions:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Use controls to Zoom In/Out.</li>
                                                <li>Drag image to pan when zoomed.</li>
                                                <li>Verify text clarity and details.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons explicitly for Verification Context if it IS a verification task */}
                                {selectedUser._id && selectedUser.role !== 'Applicant' && (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedUser._id, 'Verified')}
                                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition flex items-center justify-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" /> Verify
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedUser._id, 'Rejected', 'Detail Mismatch')}
                                            className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold transition flex items-center justify-center gap-2"
                                        >
                                            <XCircleIcon className="w-5 h-5" /> Reject
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setProofModalOpen(false)}
                                    className="w-full py-3 bg-gray-200 dark:bg-slate-700 rounded-xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition mt-4"
                                >
                                    Close Inspector
                                </button>
                            </div>

                            {/* RIGHT: Image Viewer with Zoom */}
                            <div className="w-full md:w-3/4 bg-gray-900 relative flex flex-col overflow-hidden h-full">
                                {/* Zoom Controls */}
                                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-xl">
                                    <button
                                        onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
                                        className="p-2 text-white hover:bg-white/20 rounded-full transition"
                                    >
                                        <MagnifyingGlassMinusIcon className="h-5 w-5" />
                                    </button>
                                    <span className="px-3 py-2 text-xs font-mono text-white min-w-[3rem] text-center font-bold">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))}
                                        className="p-2 text-white hover:bg-white/20 rounded-full transition"
                                    >
                                        <MagnifyingGlassPlusIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setProofModalOpen(false)}
                                    className="absolute top-6 right-6 z-20 p-2 bg-black/30 hover:bg-red-500 text-white rounded-full transition backdrop-blur-sm hidden md:block"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>

                                {/* Image Container */}
                                <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed z-10 custom-scrollbar">
                                    <img
                                        src={selectedUser.identityProofUrl}
                                        className="rounded-lg shadow-2xl transition-transform duration-300 ease-out origin-center border-[4px] md:border-[8px] border-white/10"
                                        style={{
                                            transform: `scale(${zoomLevel})`,
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            cursor: zoomLevel > 1 ? 'grab' : 'default'
                                        }}
                                        alt="Proof Document"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* **NEW**: User Details Modal (Login/Profile Info) - Read Only */}
            {
                viewUserDetails && (
                    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewUserDetails(null)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700 transform transition-all animate-scale-up" onClick={e => e.stopPropagation()}>
                            <div className="relative">
                                {/* Cover / Header Pattern */}
                                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                    <button onClick={() => setViewUserDetails(null)} className="absolute top-4 right-4 p-1.5 bg-black/20 text-white rounded-full hover:bg-black/40 transition">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Avatar */}
                                <div className="absolute -bottom-10 left-8">
                                    <img
                                        src={viewUserDetails.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${viewUserDetails.displayName}`}
                                        className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 shadow-lg bg-white"
                                        alt="Profile"
                                    />
                                </div>
                            </div>

                            <div className="pt-12 pb-8 px-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{viewUserDetails.displayName}</h2>
                                        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center gap-1">
                                            <BriefcaseIcon className="w-4 h-4" /> {viewUserDetails.role || "User"}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewUserDetails.identityVerificationStatus === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {viewUserDetails.identityVerificationStatus || 'Unverified'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                            <EnvelopeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Email Address</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">{viewUserDetails.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                            <PhoneIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Phone Number</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewUserDetails.phone || "Not linked"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                            <CalendarDaysIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Account Created</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {new Date(viewUserDetails.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
            `}</style>
        </div >
    );
}
