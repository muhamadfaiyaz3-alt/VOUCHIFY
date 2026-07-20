import React, { useState, useRef, useEffect } from "react";
import {
    CameraIcon,
    PencilSquareIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    BriefcaseIcon,
    IdentificationIcon,
    CalendarDaysIcon,
    UserIcon,
    XMarkIcon,
    SparklesIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import client from "../../api/client";

export default function ProfileHeader({ user, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(null);
    const [otp, setOtp] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        displayName: user.displayName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        description: user.description || "",
        address: user.address || "",
        gender: user.gender || "Prefer not to say",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        occupation: user.occupation || "Student",
        avatarUrl: user.avatarUrl || "",
        identityProofUrl: user.identityProofUrl || "",
    });

    useEffect(() => {
        setFormData({
            displayName: user.displayName || "",
            email: user.email || "",
            phone: user.phone || "",
            bio: user.bio || "",
            description: user.description || "",
            address: user.address || "",
            gender: user.gender || "Prefer not to say",
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            occupation: user.occupation || "Student",
            avatarUrl: user.avatarUrl || "",
            identityProofUrl: user.identityProofUrl || "",
        });
    }, [user]);

    // Optimized File Handler with Compression
    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            // Limit initial file check (e.g. 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert("File is too large. Please upload an image under 10MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize logic: Max dimensional limit (e.g. 1024px)
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG at 0.7 quality
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, [field]: compressedDataUrl }));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = { ...formData };
            if (!payload.dob) delete payload.dob;
            await client.put("/me", payload);
            await onUpdate();
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = (type) => {
        setVerificationStep(type);
        setOtp("");
        alert(`OTP sent to your ${type === 'email' ? 'Email' : 'Mobile Number'}`);
    };

    const submitOtp = async () => {
        if (otp === "1234") {
            try {
                await client.post('/me/verify-contact', { type: verificationStep });
                alert(`${verificationStep === 'email' ? 'Email' : 'Phone'} Verified Successfully!`);
                await onUpdate();
                setVerificationStep(null);
            } catch (err) {
                console.error(err);
                alert("Verification failed.");
            }
        } else {
            alert("Invalid OTP");
        }
    };

    // Calculate Completion
    const completionPercentage = [
        user.displayName, user.email, user.phone, user.address,
        user.dob, user.identityProofUrl, user.avatarUrl
    ].filter(Boolean).length / 7 * 100;

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden mb-10 border border-gray-200 dark:border-slate-800 relative z-10 animate-fade-in transition-colors duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 h-32 flex items-center justify-between px-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <h2 className="text-white text-3xl font-black flex items-center gap-3 relative z-10">
                        <PencilSquareIcon className="h-8 w-8" />
                        Edit Profile
                    </h2>
                    <button onClick={() => setIsEditing(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition transform hover:rotate-90 relative z-10">
                        <XMarkIcon className="h-8 w-8" />
                    </button>
                </div>

                <div className="p-8 md:p-10 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Avatar & ID Section - 4 Cols */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center group">
                                <div className="relative w-48 h-48 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-800 relative">
                                        <img
                                            src={formData.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${formData.displayName}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                        />
                                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                                            <CameraIcon className="h-10 w-10 text-white mb-2" />
                                            <span className="text-white text-xs font-bold uppercase tracking-wider">Change Photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatarUrl')} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* ID Proof Upload */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 hover:border-indigo-500/50 transition-colors group">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                                    <ShieldCheckIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                                    Identity Proof <span className="text-pink-500">*</span>
                                </h3>
                                <div className="w-full h-48 bg-white dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all group-hover:border-indigo-500 group-hover:bg-gray-50 dark:group-hover:bg-slate-900/80">
                                    {formData.identityProofUrl ? (
                                        <>
                                            <img src={formData.identityProofUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" alt="ID Proof" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-gray-900 dark:text-white text-xs font-bold shadow-xl border border-gray-200 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white border-transparent transition">Change Document</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <IdentificationIcon className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition" />
                                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Upload Government ID</p>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, 'identityProofUrl')} />
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-3 flex items-start gap-1.5 leading-relaxed">
                                    <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <span>Required for selling vouchers and withdrawing funds.</span>
                                </p>
                            </div>
                        </div>

                        {/* Form Fields - 8 Cols */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Full Name</label>
                                    <input
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 dark:placeholder-slate-600 transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Occupation</label>
                                    <select
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Employee">Employee</option>
                                        <option value="Business">Business Owner</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Gender</label>
                                    <div className="flex gap-2 h-[48px]">
                                        {['Male', 'Female', 'Other'].map(g => (
                                            <label key={g} className="flex-1 cursor-pointer">
                                                <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="sr-only peer" />
                                                <div className="h-full flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-500 font-medium transition hover:bg-gray-100 dark:hover:bg-slate-800">
                                                    {g}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Bio</label>
                                <input
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 dark:placeholder-slate-600 transition-all"
                                    placeholder="One liner about you..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">About Me</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 dark:placeholder-slate-600 transition-all resize-none"
                                    placeholder="Tell the community about yourself..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Full Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 dark:placeholder-slate-600 transition-all resize-none"
                                    placeholder="Street, City, State, Pincode"
                                />
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Email</label>
                                    <div className="flex gap-2">
                                        <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                        {user.email && (
                                            <button onClick={() => handleVerify('email')} disabled={user.isEmailVerified} className={`px-4 rounded-xl font-bold text-xs uppercase tracking-wider border ${user.isEmailVerified ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition'}`}>
                                                {user.isEmailVerified ? <CheckBadgeIcon className="h-5 w-5" /> : "Verify"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-slate-400 ml-1">Mobile</label>
                                    <div className="flex gap-2">
                                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                        {user.phone && (
                                            <button onClick={() => handleVerify('phone')} disabled={user.isPhoneVerified} className={`px-4 rounded-xl font-bold text-xs uppercase tracking-wider border ${user.isPhoneVerified ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition'}`}>
                                                {user.isPhoneVerified ? <CheckBadgeIcon className="h-5 w-5" /> : "Verify"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <button onClick={() => setIsEditing(false)} className="px-8 py-4 rounded-2xl font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition">Discard</button>
                        <button onClick={handleSave} disabled={loading} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:scale-100 flex items-center gap-2">
                            {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircleIcon className="h-5 w-5" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* OTP Modal */}
                {verificationStep && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-700 text-center">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Verify {verificationStep === 'email' ? 'Email' : 'Mobile'}</h3>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Enter the 4-digit code sent to<br /><span className="text-gray-900 dark:text-white font-mono">{verificationStep === 'email' ? formData.email : formData.phone}</span></p>
                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full text-center text-3xl tracking-[1rem] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-none rounded-2xl p-4 mb-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600"
                                placeholder="0000"
                                maxLength={4}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setVerificationStep(null)} className="py-3 text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                                <button onClick={submitOtp} className="py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20">Verify</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- VIEW MODE ---
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden mb-8 border border-gray-200 dark:border-slate-800/60 relative group w-full animate-fade-in transition-all hover:border-gray-300 dark:hover:border-slate-700/80 duration-300">
            {/* Ambient Background Glow (Dark only) */}
            <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 blur-[100px] -z-10 hidden dark:block"></div>

            {/* Cover Area */}
            <div className="h-56 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-900 dark:via-indigo-900 dark:to-slate-900"></div>

                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[60px] animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] animate-pulse delay-1000"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                </div>

                {/* Edit Button */}
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-6 right-6 bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white hover:text-indigo-900 transition-all duration-300 flex items-center gap-2 shadow-lg z-20 group/btn"
                >
                    <PencilSquareIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                    Edit Profile
                </button>
            </div>

            {/* Main Content */}
            <div className="px-6 md:px-12 pb-12 relative">
                <div className="flex flex-col lg:flex-row items-start lg:items-end -mt-24 gap-8">

                    {/* Unique Avatar Presentation */}
                    <div className="relative shrink-0 z-10 group">
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500"></div>
                        <div className="w-36 h-36 lg:w-48 lg:h-48 rounded-full border-[6px] border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 relative z-10">
                            <img
                                src={user.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${user.displayName}`}
                                alt="Profile"
                                className="w-full h-full object-cover transform transition duration-700 group-hover:scale-110"
                            />
                        </div>
                        {user.isPhoneVerified && user.isEmailVerified && (
                            <div className="absolute bottom-4 right-4 z-20 bg-emerald-500 text-white p-1.5 rounded-full border-[4px] border-white dark:border-slate-900 shadow-lg" title="Fully Verified">
                                <CheckBadgeIcon className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 pt-2 lg:pt-0 lg:pb-3 w-full min-w-0">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight truncate leading-tight drop-shadow-md lg:drop-shadow-none xl:drop-shadow-md">
                                    {user.displayName || <span className="text-gray-400 dark:text-slate-500 italic">Anonymous</span>}
                                </h1>
                                <div className="flex gap-2">
                                    {user.role === "admin" && (
                                        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                            Admin
                                        </span>
                                    )}
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-1">
                                        <BriefcaseIcon className="h-3 w-3" />
                                        {user.occupation || "Member"}
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-slate-300 font-medium text-lg leading-relaxed max-w-2xl">
                                {user.bio || "No bio added yet."}
                            </p>

                            {/* Contact Badges */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${user.isEmailVerified ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400'}`}>
                                    <EnvelopeIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${user.isPhoneVerified ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400'}`}>
                                    <PhoneIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{user.phone || "No Phone"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Completion - Glassmorphic Card */}
                    <div className="w-full lg:w-80 bg-gray-50/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 dark:border-slate-700 shadow-xl relative overflow-hidden group hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <SparklesIcon className="h-20 w-20 text-indigo-500 dark:text-white transform rotate-12" />
                        </div>

                        <div className="flex justify-between items-end mb-4 relative z-10">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Profile Strength</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{Math.round(completionPercentage)}%</p>
                            </div>
                            <div className="h-10 w-10">
                                {/* Circular Progress placeholder or icon */}
                                <ShieldCheckIcon className={`h-full w-full ${completionPercentage === 100 ? 'text-emerald-500' : 'text-indigo-500'}`} />
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2 mb-6 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>

                        {/* Status Message */}
                        {user.identityVerificationStatus === 'Verified' ? (
                            <div className="flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                                <div className="p-1 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40"><CheckBadgeIcon className="h-3 w-3 text-white" /></div>
                                Identity Verified
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <span className="truncate">Identity Verification Pending</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* About Section & Details Grid */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-gray-100 dark:border-slate-800 pt-10">

                    {/* Left: About */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                            <UserIcon className="h-4 w-4" /> About Me
                        </h3>
                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-lg">
                            {user.description || <span className="opacity-50 italic">This user hasn't written a description yet.</span>}
                        </p>
                    </div>

                    {/* Right: Meta Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1 tracking-wider">Member Since</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CalendarDaysIcon className="h-4 w-4 text-indigo-500" />
                                {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1 tracking-wider">Date of Birth</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <SparklesIcon className="h-4 w-4 text-pink-500" />
                                {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                        {user.address && (
                            <div className="col-span-2 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1 tracking-wider">Location</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-start gap-2 line-clamp-2">
                                    <MapPinIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    {user.address}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
