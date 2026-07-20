import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    EyeIcon,
    EyeSlashIcon,
    ClipboardIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import client from '../api/client';
// import { auth } from '../config/firebase'; // Uncomment if firebase is configured
// import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotRecovery = () => {
    const navigate = useNavigate();

    // State management
    const [activeTab, setActiveTab] = useState('password'); // 'password' | 'username'
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'success'
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        resetToken: '',
        retrievedUsername: ''
    });

    // Timer Logic for Resend OTP
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handlers
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg(''); // Clear error on type
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStep('email');
        setErrorMsg('');
        setSuccessMsg('');
        setFormData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formData.retrievedUsername);
        setSuccessMsg('Username copied to clipboard!');
        setTimeout(() => setSuccessMsg(''), 2000);
    };

    // --- API Interactions ---

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            // Check validation
            if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
                throw new Error("Please enter a valid email address.");
            }

            // 1. Priority: Custom Backend OTP
            const res = await client.post('/auth/forgot-password', { email: formData.email });

            // 2. Firebase Fallback (Optional / Parallel) or Hybrid
            // if (useFirebase) await sendPasswordResetEmail(auth, formData.email);

            if (res.data.success || res.status === 200) {
                setStep('otp');
                setTimer(60); // 60s cooldown
                setSuccessMsg(res.data.message || "OTP Sent successfully!");
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || "Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (formData.otp.length !== 6) throw new Error("OTP must be 6 digits.");

            if (activeTab === 'password') {
                // Verify for Password Reset
                const res = await client.post('/auth/verify-otp', {
                    email: formData.email,
                    otp: formData.otp
                });

                if (res.data.resetToken) {
                    setFormData(prev => ({ ...prev, resetToken: res.data.resetToken }));
                    setStep('reset');
                    setSuccessMsg("OTP Verified! Set your new password.");
                }
            } else {
                // Verify for Username Recovery
                const res = await client.post('/auth/recover-username', {
                    email: formData.email,
                    otp: formData.otp
                });

                if (res.data.username) {
                    setFormData(prev => ({ ...prev, retrievedUsername: res.data.username }));
                    setStep('success');
                }
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || "Invalid OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (formData.newPassword.length < 6) throw new Error("Password must be at least 6 chars.");
            if (formData.newPassword !== formData.confirmPassword) throw new Error("Passwords do not match.");

            const res = await client.post('/auth/reset-password', {
                email: formData.email,
                newPassword: formData.newPassword,
                resetToken: formData.resetToken
            });

            if (res.data.success) {
                setStep('success');
                setSuccessMsg("Password reset successful!");
                // Auto redirect
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    // Render Components
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px] animate-pulse animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">

                {/* Header / Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => handleTabChange('password')}
                        className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'password' ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Forgot Password
                    </button>
                    <button
                        onClick={() => handleTabChange('username')}
                        className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'username' ? 'bg-fuchsia-600/20 text-fuchsia-400 border-b-2 border-fuchsia-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Forgot Username
                    </button>
                </div>

                <div className="p-8">
                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg ${step === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-white'}`}>
                            {step === 'email' && <EnvelopeIcon className="w-8 h-8" />}
                            {step === 'otp' && <LockClosedIcon className="w-8 h-8" />}
                            {step === 'reset' && <ArrowPathIcon className="w-8 h-8" />}
                            {step === 'success' && <CheckCircleIcon className="w-8 h-8" />}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {step === 'email' && (activeTab === 'password' ? "Reset Password" : "Recover Username")}
                            {step === 'otp' && "Verify Identity"}
                            {step === 'reset' && "Set New Password"}
                            {step === 'success' && (activeTab === 'password' ? "All Done!" : "Username Found")}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {step === 'email' && "Enter your registered email to receive a verification code."}
                            {step === 'otp' && `Enter the 6-digit code sent to ${formData.email}`}
                            {step === 'reset' && "Create a strong password for your account."}
                            {step === 'success' && (activeTab === 'password' ? "Your password has been reset successfully." : "Here is your recovered username.")}
                        </p>
                    </div>

                    {/* Feedback Messages */}
                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium animate-shake">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center font-medium animate-fade-in">
                            {successMsg}
                        </div>
                    )}

                    {/* STEP 1: EMAIL */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all group-hover:border-slate-600"
                                        required
                                    />
                                    <EnvelopeIcon className="w-5 h-5 text-slate-500 absolute left-4 top-3.5 group-hover:text-indigo-400 transition-colors" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Send Code <ArrowRightIcon className="w-4 h-4 stroke-2" /></>
                                )}
                            </button>
                        </form>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Verification Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 6) setFormData({ ...formData, otp: val });
                                        }}
                                        placeholder="000000"
                                        className="w-full bg-slate-800/50 border border-slate-700 text-white text-center text-2xl tracking-[0.5em] font-mono rounded-xl py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="text-slate-500 hover:text-white transition-colors"
                                >
                                    Change Email
                                </button>
                                <button
                                    type="button"
                                    disabled={timer > 0 || isLoading}
                                    onClick={handleSendOtp}
                                    className={`font-semibold ${timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'}`}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || formData.otp.length !== 6}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Verify & Proceed"}
                            </button>
                        </form>
                    )}

                    {/* STEP 3: RESET FORM (Password only) */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3.5 pl-11 pr-10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="Min 6 characters"
                                        required
                                    />
                                    <LockClosedIcon className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3.5 pl-11 pr-10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="Re-enter password"
                                        required
                                    />
                                    <LockClosedIcon className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                                    >
                                        {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 'success' && (
                        <div className="text-center space-y-6">
                            {activeTab === 'password' ? (
                                <div className="animate-bounce mb-4">
                                    <p className="text-indigo-400 font-medium">Redirecting to login...</p>
                                </div>
                            ) : (
                                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">Your Username</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <p className="text-2xl font-mono text-white tracking-wide">{formData.retrievedUsername}</p>
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition"
                                            title="Copy"
                                        >
                                            <ClipboardIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold"
                            >
                                <ChevronLeftIcon className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotRecovery;
