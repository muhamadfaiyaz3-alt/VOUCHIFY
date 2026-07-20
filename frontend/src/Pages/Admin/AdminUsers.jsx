import React, { useEffect, useState } from "react";
import client from "../../api/client";
import {
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    XCircleIcon,
    CheckCircleIcon,
    XMarkIcon,
    ShieldCheckIcon,
    EyeIcon,
    NoSymbolIcon,
    UserGroupIcon,
    SparklesIcon
} from "@heroicons/react/24/outline";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [proofModalOpen, setProofModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Animated background state
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetchUsers();
    }, []);

    // Mouse parallax effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Filter effect
    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredUsers(users.filter(u =>
                u.displayName.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                (u.role && u.role.toLowerCase().includes(term))
            ));
        }
    }, [searchTerm, users]);

    // Auto-open modal from specific user link (e.g. from Notification)
    useEffect(() => {
        if (users.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const highlightId = params.get('highlight');
            if (highlightId) {
                const targetUser = users.find(u => u._id === highlightId);
                if (targetUser && targetUser.identityProofUrl) {
                    setSelectedUser(targetUser);
                    setProofModalOpen(true);
                    // Clear param cleanly
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        }
    }, [users]);

    const fetchUsers = async () => {
        try {
            const { data } = await client.get("/admin/users");
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId, status, remarks = "") => {
        // Optimistic UI Update
        const updater = (prev) => prev.map(u => u._id === userId ? { ...u, identityVerificationStatus: status } : u);
        setUsers(updater);
        setFilteredUsers(updater);

        if (selectedUser?._id === userId) {
            setSelectedUser(prev => ({ ...prev, identityVerificationStatus: status }));
            setProofModalOpen(false);
        }

        try {
            await client.patch(`/admin/users/${userId}/identity`, { status, remarks });
        } catch (error) {
            console.error("Failed to update status", error);
            fetchUsers(); // Revert on fail
        }
    };

    const handleToggleBlock = async (user) => {
        if (window.confirm(user.isSuspended ? "Unblock this user?" : "Block this user? This will prevent them from logging in.")) {
            try {
                await client.patch(`/admin/users/${user._id}/block`, {
                    suspended: !user.isSuspended,
                    reason: !user.isSuspended ? "Admin Manual Action" : ""
                });

                // Optimistic Update locally
                const updater = (prev) => prev.map(u => u._id === user._id ? { ...u, isSuspended: !user.isSuspended } : u);
                setUsers(updater);
                setFilteredUsers(updater);

            } catch (err) {
                alert("Action failed: " + (err.response?.data?.message || err.message));
                fetchUsers();
            }
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Verified': 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
            'Pending': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
            'Rejected': 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
            'None': 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${styles[status] || styles['None']} shadow-sm`}>
                {status || 'None'}
            </span>
        );
    };

    if (loading) return (
        <div className="min-h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-500 p-12">
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
                    className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[80px] md:blur-[100px] animate-pulse transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[60px] md:blur-[80px] transition-all duration-1000 ease-linear"
                    style={{ transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` }}
                />
            </div>

            {/* Header Section */}
            <div className="mb-8 relative z-10 animate-fade-in-down">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 transform transition hover:scale-[1.005] duration-300">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2 drop-shadow-sm filter">
                            User Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-base md:text-lg">
                            Manage access, verify identities, and monitor user base activity.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg group-hover:shadow-indigo-500/50 transition duration-300">
                                    <UserGroupIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
                                    <p className="text-2xl font-black text-gray-800 dark:text-white">{users.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg group-hover:shadow-red-500/50 transition duration-300">
                                    <NoSymbolIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suspended</p>
                                    <p className="text-2xl font-black text-gray-800 dark:text-white">{users.filter(u => u.isSuspended).length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Marquee Header for Announcements/Status */}
                <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl p-0.5 mb-8 shadow-lg overflow-hidden group hover:shadow-indigo-500/50 transition duration-500 hidden md:block">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 flex items-center overflow-hidden relative h-10">
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-indigo-600 to-transparent z-20"></div>
                        <SparklesIcon className="w-5 h-5 text-yellow-300 ml-4 animate-pulse absolute z-30" />
                        <div className="whitespace-nowrap animate-marquee flex gap-12 text-white font-bold text-sm tracking-wide items-center">
                            <span className="flex items-center gap-2">🚀 System Status: Live & Synchronized</span>
                            <span className="flex items-center gap-2">💎 Premium Admin Dashboard Active</span>
                            <span className="flex items-center gap-2">🔔 Check Pending Verifications</span>
                            <span className="flex items-center gap-2">✨ Wide Gamut Colors Enabled</span>
                            <span className="flex items-center gap-2">🚀 System Status: Live & Synchronized</span>
                            <span className="flex items-center gap-2">💎 Premium Admin Dashboard Active</span>
                            <span className="flex items-center gap-2">🔔 Check Pending Verifications</span>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-indigo-600 to-transparent z-20"></div>
                    </div>
                </div>

                {/* Search & Toolbar */}
                <div className="flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-2 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 mb-6 max-w-xl transition-all duration-300 focus-within:ring-2 ring-indigo-500/50 focus-within:shadow-indigo-500/20">
                    <MagnifyingGlassPlusIcon className="w-6 h-6 text-gray-400 ml-3 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search users by name, email or role..."
                        className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium h-10 px-4 min-w-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Glassmorphism Table */}
            <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden relative animate-fade-in-up">
                {/* Decorative sheen */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white/50 dark:bg-slate-900/50 border-b border-gray-200/50 dark:border-slate-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
                                <th className="px-8 py-5">User Profile</th>
                                <th className="px-8 py-5">Contact Info</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5">Identity Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/30 dark:divide-slate-700/30">
                            {filteredUsers.map((user, idx) => (
                                <tr
                                    key={user._id}
                                    className={`group transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-700/40 relative
                                        ${user.isSuspended ? 'bg-red-50/30 dark:bg-red-900/10' : ''}
                                    `}
                                    style={{ transformStyle: "preserve-3d" }}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4 transition-transform group-hover:translate-x-1 duration-300">
                                            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-gray-200 shadow-md border-2 border-white dark:border-slate-600 relative group-hover:rotate-3 transition duration-500 shrink-0">
                                                <img
                                                    src={user.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${user.displayName}`}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                                {user.isSuspended && (
                                                    <div className="absolute inset-0 bg-red-600/60 backdrop-blur-[1px] flex items-center justify-center text-white">
                                                        <NoSymbolIcon className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                                                    {user.displayName}
                                                    {user.isSuspended && (
                                                        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full shadow-red-500/50 shadow-sm uppercase tracking-wide">
                                                            Suspended
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 opacity-80">
                                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm">
                                        <div className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{user.phone || "No phone linked"}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <StatusBadge status={user.identityVerificationStatus} />
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {user.identityProofUrl && (
                                                <button
                                                    onClick={() => { setSelectedUser(user); setProofModalOpen(true); setZoomLevel(1); }}
                                                    className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition duration-200 hover:scale-110 active:scale-95"
                                                    title="View ID Proof"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleToggleBlock(user)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 border shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95 ${user.isSuspended
                                                        ? 'bg-green-500 text-white border-green-600 hover:bg-green-600 shadow-green-500/30'
                                                        : 'bg-white dark:bg-slate-700 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    }`}
                                            >
                                                <NoSymbolIcon className="h-4 w-4" />
                                                {user.isSuspended ? "Unblock" : "Block"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3D Transform Modal for Proof View */}
            {proofModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div
                        className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all animate-scale-up border border-white/10"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
                            <div>
                                <h3 className="font-bold text-xl text-white flex items-center gap-2">
                                    <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                                    Identity Proof
                                </h3>
                                <p className="text-sm text-gray-400">Verifying: <span className="text-white font-semibold">{selectedUser.displayName}</span></p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-700/50 rounded-lg p-1 backdrop-blur-sm border border-gray-600">
                                    <button onClick={() => setZoomLevel(1)} className={`px-3 py-1 rounded text-xs font-bold transition ${zoomLevel === 1 ? 'bg-white text-black shadow-lg' : 'text-gray-300 hover:text-white'}`}>1x</button>
                                    <button onClick={() => setZoomLevel(2)} className={`px-3 py-1 rounded text-xs font-bold transition ${zoomLevel === 2 ? 'bg-white text-black shadow-lg' : 'text-gray-300 hover:text-white'}`}>2x</button>
                                    <button onClick={() => setZoomLevel(3)} className={`px-3 py-1 rounded text-xs font-bold transition ${zoomLevel === 3 ? 'bg-white text-black shadow-lg' : 'text-gray-300 hover:text-white'}`}>3x</button>
                                </div>
                                <button
                                    onClick={() => setProofModalOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition"
                                >
                                    <XCircleIcon className="h-8 w-8" />
                                </button>
                            </div>
                        </div>

                        {/* Image Area */}
                        <div className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-900 bg-fixed flex items-center justify-center p-8 relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                            <img
                                src={selectedUser.identityProofUrl}
                                style={{ transform: `scale(${zoomLevel}) rotateX(${zoomLevel > 1 ? 0 : '0deg'})`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                className={`rounded-lg shadow-2xl origin-center max-w-full max-h-full object-contain ${zoomLevel === 1 ? 'hover:scale-[1.02] cursor-zoom-in' : 'cursor-grab active:cursor-grabbing'}`}
                                alt="ID Proof"
                                onClick={() => zoomLevel === 1 && setZoomLevel(2)}
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-white dark:bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Current Status: <span className="ml-2"><StatusBadge status={selectedUser.identityVerificationStatus} /></span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleUpdateStatus(selectedUser._id, 'Rejected')}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition transform hover:-translate-y-1"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedUser._id, 'Verified')}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 hover:from-green-600 hover:to-emerald-700 transition transform hover:-translate-y-1"
                                >
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Verify Identity
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.8);
                }
            `}</style>
        </div>
    );
}
