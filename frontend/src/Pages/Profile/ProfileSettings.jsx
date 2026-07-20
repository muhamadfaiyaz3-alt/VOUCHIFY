import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import client from "../../api/client";
import { useAuth } from "../../Contexts/AuthContext";
import {
    CreditCardIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function ProfileSettings() {
    const { user, refreshUser } = useAuth();

    // Security State
    const [securityState, setSecurityState] = useState({ currentPassword: '', newPassword: '' });
    const [securityMessage, setSecurityMessage] = useState(null);
    const [securityLoading, setSecurityLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSecurityLoading(true);
        setSecurityMessage(null);
        try {
            await client.post('/auth/change-password', securityState);
            setSecurityMessage({ type: 'success', text: 'Password changed successfully!' });
            setSecurityState({ currentPassword: '', newPassword: '' });
        } catch (error) {
            setSecurityMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
        } finally {
            setSecurityLoading(false);
        }
    };

    const [enabled, setEnabled] = useState(false);

    // Payout Settings State
    const [payoutMethod, setPayoutMethod] = useState(user?.payoutSettings?.method || 'upi');
    const [upiId, setUpiId] = useState(user?.payoutSettings?.upiId || '');
    const [phone, setPhone] = useState(user?.payoutSettings?.phone || user?.phone || '');
    const [bankDetails, setBankDetails] = useState({
        bankName: user?.payoutSettings?.bankName || '',
        bankIfsc: user?.payoutSettings?.bankIfsc || '',
        bankHolderName: user?.payoutSettings?.bankHolderName || '',
        bankAccountIdx: user?.payoutSettings?.bankAccountIdx || ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSavePayoutSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await client.patch('/me', {
                payoutSettings: {
                    method: payoutMethod,
                    upiId: payoutMethod === 'upi' ? upiId : undefined,
                    phone: payoutMethod === 'phone' ? phone : undefined,
                    ... (payoutMethod === 'bank' ? bankDetails : {})
                }
            });
            await refreshUser();
            setMessage({ type: 'success', text: 'Payment details saved successfully!' });
        } catch (error) {
            console.error("Failed to save settings", error);
            setMessage({ type: 'error', text: 'Failed to save payment details.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-slate-800 relative space-y-10 overflow-hidden transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center gap-3 relative z-10 border-b border-gray-100 dark:border-slate-800 pb-6">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
                    <Cog6ToothIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h3>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Preferences & Payouts</p>
                </div>
            </div>





            {/* Payment Details Section */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    Payment Method
                </h2>

                <form onSubmit={handleSavePayoutSettings}>
                    {/* Method Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[
                            { id: 'upi', label: 'UPI ID', icon: CreditCardIcon },
                            { id: 'bank', label: 'Bank Transfer', icon: BuildingLibraryIcon },
                            { id: 'phone', label: 'Phone Number', icon: DevicePhoneMobileIcon },
                        ].map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setPayoutMethod(method.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${payoutMethod === method.id
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                                    : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white hover:border-indigo-500 dark:hover:border-indigo-500'
                                    }`}
                            >
                                <method.icon className="h-6 w-6 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Fields */}
                    <div className="space-y-6 mb-8 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                        {payoutMethod === 'upi' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">UPI ID</label>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={e => setUpiId(e.target.value)}
                                    placeholder="e.g. name@okaxis"
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-none rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                                    required
                                />
                            </div>
                        )}

                        {payoutMethod === 'phone' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">Linked Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+91 9876543210"
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-none rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                                    required
                                />
                            </div>
                        )}

                        {payoutMethod === 'bank' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">Account Holder</label>
                                        <input
                                            type="text"
                                            value={bankDetails.bankHolderName}
                                            onChange={e => setBankDetails({ ...bankDetails, bankHolderName: e.target.value })}
                                            placeholder="Name"
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-none rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">Account Number</label>
                                        <input
                                            type="text"
                                            value={bankDetails.bankAccountIdx}
                                            onChange={e => setBankDetails({ ...bankDetails, bankAccountIdx: e.target.value })}
                                            placeholder="XXXX-XXXX-XXXX"
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-none rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={bankDetails.bankIfsc}
                                            onChange={e => setBankDetails({ ...bankDetails, bankIfsc: e.target.value })}
                                            placeholder="IFSC"
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-none rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-slate-600 transition-all uppercase outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">Bank Name</label>
                                        <input
                                            type="text"
                                            value={bankDetails.bankName}
                                            onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                            placeholder="Bank"
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-none rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 mb-6 ${message.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                            {message.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg shadow-gray-900/10 dark:shadow-white/10"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </form>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">General Preferences</h2>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Email Notifications</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Receive updates about your account activity.</p>
                        </div>
                        <Switch
                            checked={enabled}
                            onChange={setEnabled}
                            className={`${enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 border border-transparent`}
                        >
                            <span
                                className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>

                    <div className="border border-red-500/20 bg-red-50 dark:bg-red-500/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">Danger Zone</h3>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-red-700/70 dark:text-red-400/70">Permanently remove your account and data.</p>
                            <button className="text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 bg-red-100 dark:bg-red-500/10 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all">
                                Deactivate Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
