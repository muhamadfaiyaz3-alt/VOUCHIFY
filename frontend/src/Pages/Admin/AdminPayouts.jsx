import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    BanknotesIcon,
    ArrowUpTrayIcon,
    ClipboardDocumentIcon,
    CreditCardIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CalculatorIcon,
    InformationCircleIcon,
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingSellerId, setProcessingSellerId] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedSellerGroup, setSelectedSellerGroup] = useState(null);
    const [activeMethod, setActiveMethod] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [paymentRef, setPaymentRef] = useState('');

    const [revenueWithdrawn, setRevenueWithdrawn] = useState(false);

    // Chat State
    const [activeChatPayout, setActiveChatPayout] = useState(null);
    const [chatMessage, setChatMessage] = useState("");
    const [msgSending, setMsgSending] = useState(false);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const { data } = await client.get('/payouts');
            setPayouts(data);
        } catch (error) {
            console.error("Failed to fetch payouts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendQuery = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        setMsgSending(true);
        try {
            await client.post(`/payouts/${activeChatPayout._id}/query`, { message: chatMessage });
            setChatMessage("");

            // Refresh data to show new message
            const { data } = await client.get('/payouts');
            setPayouts(data);

            // Update the active modal data
            const updated = data.find(p => p._id === activeChatPayout._id);
            if (updated) setActiveChatPayout(updated);

        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message: " + (error.response?.data?.message || error.message));
        } finally {
            setMsgSending(false);
        }
    };

    const groupPayoutsBySeller = (payoutList) => {
        const groups = {};
        payoutList.forEach(p => {
            if (p.status !== 'pending') return;
            const sellerId = p.seller?._id || 'unknown';
            if (!groups[sellerId]) {
                groups[sellerId] = {
                    seller: p.seller,
                    payouts: [],
                    totalAmount: 0 // Net Payable
                };
            }
            groups[sellerId].payouts.push(p);
            groups[sellerId].totalAmount += p.amount;
        });
        return Object.values(groups);
    };

    const openPayModal = (group) => {
        setSelectedSellerGroup(group);
        const defaultMethod = group.seller?.payoutSettings?.method || 'upi';
        setActiveMethod(defaultMethod);
        setPaymentRef('');
        setProofFile(null);
        setProofPreview(null);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProofPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Optional: toast notification
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!paymentRef || !proofPreview) {
            alert("Please provide both Payment Reference and Proof Screenshot");
            return;
        }
        if (!selectedSellerGroup?.seller) return;

        setProcessingSellerId(selectedSellerGroup.seller._id);
        try {
            await client.post(`/payouts/bulk-process`, {
                action: 'mark_paid',
                sellerId: selectedSellerGroup.seller._id,
                paymentReference: paymentRef,
                adminProofUrl: proofPreview
            });
            setShowModal(false);
            fetchPayouts();
        } catch (error) {
            console.error("Failed to pay", error);
            alert("Failed to process payment");
        } finally {
            setProcessingSellerId(null);
        }
    };

    const handleWithdrawRevenue = () => {
        if (confirm("Confirm transfer of all accumulated Platform Earnings to the registered Company Bank Account?")) {
            setRevenueWithdrawn(true);
            alert("Transfer Initiated: The accumulated balance has been sent to the Company Account.");
        }
    };

    // Calculate Stats
    const totalPlatformFee = payouts.reduce((sum, p) => sum + (p.transaction?.platformFee || 0), 0);
    // Assuming 15% Platform Fee and 5% Company Share -> Ratio is 3:1
    const platformPortion = totalPlatformFee * 0.75;
    const companyShare = totalPlatformFee * 0.25;


    // Components
    const PaymentMethodBadge = ({ method }) => {
        const styles = {
            upi: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
            bank: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            phone: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
        };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[method] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'}`}>{method}</span>;
    };

    const SellerGroupCard = ({ group }) => {
        const [expanded, setExpanded] = useState(false);

        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition duration-300 hover:-translate-y-1">
                <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Seller Info */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                            {group.seller?.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{group.seller?.displayName}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <DevicePhoneMobileIcon className="h-4 w-4" /> {group.seller?.phone}
                                <span className="text-gray-300 dark:text-slate-600">|</span>
                                <PaymentMethodBadge method={group.seller?.payoutSettings?.method} />
                            </div>
                        </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Net Payable</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-1 justify-end">
                                <span className="text-gray-400 text-xl">₹</span>{group.totalAmount.toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => openPayModal(group)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-0.5 transition-all text-sm"
                        >
                            Settle Balance <ArrowUpTrayIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Expanded Details Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full bg-gray-50 dark:bg-slate-700/30 border-t border-gray-100 dark:border-slate-700 py-3 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition uppercase tracking-widest gap-2"
                >
                    {expanded ? 'Hide Breakdown' : `View ${group.payouts.length} Pending Payouts`}
                    {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                </button>

                {/* Detailed Breakdown */}
                {expanded && (
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-6 border-t border-gray-100 dark:border-slate-700 animate-slide-up">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                                    <tr>
                                        <th className="pb-4 pl-2">Voucher</th>
                                        <th className="pb-4 text-right">Org. Price</th>
                                        <th className="pb-4 text-right">Discount</th>
                                        <th className="pb-4 text-right">Paid (User)</th>
                                        <th className="pb-4 text-right text-red-500">Plat. Fee</th>
                                        <th className="pb-4 text-right">Net Earned</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                                    {group.payouts.map(p => {
                                        const voucher = p.transaction?.voucher || {};
                                        const orgPrice = voucher.originalPrice || 0;
                                        const userPaid = p.transaction?.amountPaid || 0;
                                        const discount = orgPrice - userPaid;
                                        const totalFee = userPaid - p.amount; // Difference is the fee

                                        return (
                                            <tr key={p._id} className="group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                <td className="py-4 pl-2 font-medium text-gray-800 dark:text-gray-200">
                                                    {voucher.title || 'Voucher Sale'}
                                                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5">ID: {p._id.slice(-6)}</span>
                                                </td>
                                                <td className="py-4 text-right text-gray-500 dark:text-gray-400">₹{orgPrice}</td>
                                                <td className="py-4 text-right text-red-400">-₹{discount}</td>
                                                <td className="py-4 text-right font-bold text-gray-800 dark:text-gray-200">₹{userPaid}</td>
                                                <td className="py-4 text-right text-red-500 text-xs">-₹{totalFee.toFixed(1)}</td>
                                                <td className="py-4 text-right flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setActiveChatPayout(p)}
                                                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition relative"
                                                        title="Chat with User"
                                                    >
                                                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                                        {(p.queries?.length > 0 && p.queries[p.queries.length - 1].sender === 'user') && <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>}
                                                    </button>
                                                    <span className="font-bold text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10 rounded-r-lg px-2 py-1">₹{p.amount}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

                {/* Header Stats with 3D Float Effect */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 perspective-1000">
                    <div className="relative group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden transform-style-3d hover:rotate-y-6 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ClockIcon className="h-32 w-32 text-orange-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Withdrawals</p>
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mt-1">
                                ₹{groupPayoutsBySeller(payouts).reduce((a, b) => a + b.totalAmount, 0).toLocaleString()}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full w-fit text-xs font-bold">
                                <ClockIcon className="h-4 w-4" /> Needs Action
                            </div>
                        </div>
                    </div>

                    <div className="relative group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden transform-style-3d hover:rotate-y-6 transition-all duration-500 delay-100">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BanknotesIcon className="h-32 w-32 text-indigo-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Revenue</p>
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mt-1">
                                ₹{platformPortion.toLocaleString()}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full w-fit text-xs font-bold">
                                <BanknotesIcon className="h-4 w-4" /> 15% Commission
                            </div>
                        </div>
                    </div>

                    <div className="relative group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden transform-style-3d hover:rotate-y-6 transition-all duration-500 delay-200">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BuildingLibraryIcon className="h-32 w-32 text-emerald-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Share</p>
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mt-1">
                                ₹{companyShare.toLocaleString()}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full w-fit text-xs font-bold">
                                <BuildingLibraryIcon className="h-4 w-4" /> 5% Reserve
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="relative pl-4 border-l-4 border-indigo-500">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Financial Settlements</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg font-medium">Manage payouts, analyze fees, and control revenue flow.</p>
                    </div>
                    <Link to="/admin" className="text-sm font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                        <ArrowLeftIcon className="h-5 w-5" /> Back to Dashboard
                    </Link>
                </div>

                <Tab.Group>
                    <Tab.List className="flex space-x-2 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-lg border border-gray-100 dark:border-slate-700 mb-8 max-w-3xl overflow-x-auto">
                        {['Seller Settlements', 'Platform Revenue', 'Company Share', 'Payment History'].map((category) => (
                            <Tab
                                key={category}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-xl py-3 text-sm font-bold leading-5 transition-all outline-none whitespace-nowrap px-4',
                                        selected
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700'
                                    )
                                }
                            >
                                {category}
                            </Tab>
                        ))}
                    </Tab.List>

                    <Tab.Panels>

                        {/* 1. SELLER SETTLEMENTS */}
                        <Tab.Panel className="outline-none space-y-6 animate-slide-up">
                            {loading ? (
                                <div className="p-20 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-6"></div>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold text-lg animate-pulse">Calculating settlements...</p>
                                </div>
                            ) : groupPayoutsBySeller(payouts).length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center shadow-lg border border-dashed border-gray-300 dark:border-slate-600 group hover:border-green-400 transition-colors">
                                    <div className="h-24 w-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <CheckCircleIcon className="h-12 w-12 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">All Settled!</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">No pending seller payments at this moment.</p>
                                </div>
                            ) : (
                                groupPayoutsBySeller(payouts).map(group => (
                                    <SellerGroupCard key={group.seller._id} group={group} />
                                ))
                            )}
                        </Tab.Panel>

                        {/* 2. PLATFORM REVENUE */}
                        <Tab.Panel className="outline-none space-y-6 animate-slide-up">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none"></div>
                                <div className="p-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-6 shadow-inner">
                                    <BanknotesIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Platform Operational Revenue</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-lg mb-10 text-lg">
                                    Listing fees and service charges accumulated from all voucher sales.
                                    This excludes the Company Share.
                                </p>

                                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                                        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider">Accumulated Balance</span>
                                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{revenueWithdrawn ? '0' : platformPortion.toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={handleWithdrawRevenue}
                                        disabled={revenueWithdrawn || platformPortion <= 0}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                                    >
                                        {revenueWithdrawn ? 'Transferred Successfully' : 'Withdraw to Bank Account'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Revenue Stream (15%)</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
                                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="px-8 py-4">Transaction</th>
                                                <th className="px-8 py-4">Date</th>
                                                <th className="px-8 py-4 text-right">Fee Collected</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                            {payouts.map((p, i) => (
                                                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="font-bold text-gray-800 dark:text-gray-200">{p.transaction?.voucher?.title || 'Voucher'}</div>
                                                        <div className="text-xs text-indigo-400 font-mono">ID: {p.transaction?._id.slice(-6)}</div>
                                                    </td>
                                                    <td className="px-8 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-8 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">+₹{((p.transaction?.platformFee || 0) * 0.75).toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Tab.Panel>

                        {/* 3. COMPANY SHARE */}
                        <Tab.Panel className="outline-none space-y-6 animate-slide-up">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute top-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 pointer-events-none"></div>

                                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
                                    <BuildingLibraryIcon className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 relative z-10">Company Share Reserve</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-lg mb-10 text-lg relative z-10">
                                    The 5% dedicated share for corporate allocation, growth fund, or shareholder dividends.
                                </p>

                                <div className="w-full max-w-md bg-emerald-50 dark:bg-slate-900 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-900/30 mb-8 relative z-10 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-emerald-200 dark:border-emerald-900/50">
                                        <span className="text-emerald-800 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">Available for Allocation</span>
                                        <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">₹{revenueWithdrawn ? '0' : companyShare.toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={handleWithdrawRevenue}
                                        disabled={revenueWithdrawn || companyShare <= 0}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                                    >
                                        {revenueWithdrawn ? 'Allocated Successfully' : 'Allocate / Transfer Funds'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Share History (5%)</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
                                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="px-8 py-4">Transaction</th>
                                                <th className="px-8 py-4">Date</th>
                                                <th className="px-8 py-4 text-right">Share Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                            {payouts.map((p, i) => (
                                                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="font-bold text-gray-800 dark:text-gray-200">{p.transaction?.voucher?.title || 'Voucher'}</div>
                                                        <div className="text-xs text-emerald-500 font-mono">ID: {p.transaction?._id.slice(-6)}</div>
                                                    </td>
                                                    <td className="px-8 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-8 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">+₹{((p.transaction?.platformFee || 0) * 0.25).toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Tab.Panel>

                        {/* 4. HISTORY PANEL */}
                        <Tab.Panel className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden outline-none animate-slide-up">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
                                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="px-8 py-6">Seller</th>
                                            <th className="px-8 py-6">Paid Amount</th>
                                            <th className="px-8 py-6">Settlement Details</th>
                                            <th className="px-8 py-6 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                        {payouts.filter(p => p.status !== 'pending').map((p, i) => (
                                            <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition duration-200">
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-gray-900 dark:text-white text-lg">{p.seller?.displayName}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{new Date(p.processedAt || p.createdAt).toLocaleString()}</div>
                                                </td>
                                                <td className="px-8 py-5 font-black text-gray-900 dark:text-gray-100 text-lg">
                                                    ₹{p.amount.toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <PaymentMethodBadge method={p.seller?.payoutSettings?.method} />
                                                        {p.paymentReference && (
                                                            <div className="text-xs text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md border border-green-200 dark:border-green-800">
                                                                #{p.paymentReference}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right w-fit flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => setActiveChatPayout(p)}
                                                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 hover:text-indigo-600 dark:hover:text-white transition relative"
                                                        title="Message History"
                                                    >
                                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                        {(p.queries?.length > 0 && p.queries[p.queries.length - 1].sender === 'user') && <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>}
                                                    </button>
                                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 gap-2 shadow-sm">
                                                        <CheckCircleIcon className="h-4 w-4" /> COMPLETED
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {payouts.filter(p => p.status !== 'pending').length === 0 && !loading && (
                                            <tr><td colSpan="4" className="text-center py-20 text-gray-400 font-medium text-lg">No payout history available.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Tab.Panel>

                    </Tab.Panels>
                </Tab.Group>

                {/* --- PAYMENT SETTLEMENT MODAL --- */}
                {showModal && selectedSellerGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fade-in" onClick={() => setShowModal(false)} />

                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-5xl flex flex-col relative z-10 animate-scale-in max-h-[90vh] overflow-hidden border border-white/10">
                            {/* Header */}
                            <div className="p-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30">
                                            <CurrencyRupeeIcon className="h-8 w-8 text-white" />
                                        </div>
                                        Settle Payment
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 ml-14">
                                        Transferring funds to <span className="font-bold text-gray-900 dark:text-white">{selectedSellerGroup.seller?.displayName}</span>
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="bg-gray-200 dark:bg-slate-800 p-2 rounded-full text-gray-500 hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90">
                                    <XCircleIcon className="h-8 w-8" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row">

                                {/* LEFT: Breakdown */}
                                <div className="flex-1 p-8 lg:border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <CalculatorIcon className="h-4 w-4" /> Financial Breakdown
                                    </h3>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedSellerGroup.payouts.map((p, idx) => {
                                            const v = p.transaction?.voucher || {};
                                            const fee = (p.transaction?.amountPaid || 0) - p.amount;
                                            return (
                                                <div key={idx} className="bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 text-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                                    <div className="flex justify-between font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg">
                                                        <span>{v.title}</span>
                                                        <span className="text-green-600 dark:text-green-400">Earned: ₹{p.amount}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>Original Price:</span> <span className="text-right font-mono">₹{v.originalPrice || 0}</span>
                                                        <span>Buyer Paid:</span> <span className="text-right font-mono">₹{p.transaction?.amountPaid || 0}</span>
                                                        <span>Platform Fee:</span> <span className="text-right text-red-400 font-mono">-₹{fee.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            <span>Subtotal Earnings</span>
                                            <span>₹{selectedSellerGroup.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                            <span>Total Transfer</span>
                                            <span>₹{selectedSellerGroup.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: Payment Action */}
                                <div className="lg:w-[450px] p-8 bg-gray-50 dark:bg-slate-900/50">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <BuildingLibraryIcon className="h-4 w-4" /> Transfer Details
                                    </h3>

                                    {/* Tabs for Payment Details (Read Only Display) */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 mb-8 shadow-sm">
                                        <div className="flex gap-4 mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">
                                            {['upi', 'bank'].map(m => (
                                                <button key={m} onClick={() => setActiveMethod(m)}
                                                    className={`text-xs font-bold uppercase pb-2 transition-all ${activeMethod === m ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                                    {m} Details
                                                </button>
                                            ))}
                                        </div>
                                        {activeMethod === 'upi' ? (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">UPI ID</p>
                                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                                                    <p className="font-mono text-lg font-bold text-gray-900 dark:text-white truncate pr-2">{selectedSellerGroup.seller?.payoutSettings?.upiId || 'Not Set'}</p>
                                                    <button onClick={() => copyToClipboard(selectedSellerGroup.seller?.payoutSettings?.upiId)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition"><ClipboardDocumentIcon className="h-5 w-5" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                                                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Acct No:</span></div>
                                                    <p className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-widest">{selectedSellerGroup.seller?.payoutSettings?.bankAccountIdx || 'N/A'}</p>
                                                </div>
                                                <div className="flex justify-between text-sm px-2"><span className="text-gray-500">IFSC:</span> <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedSellerGroup.seller?.payoutSettings?.bankIfsc || 'N/A'}</span></div>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Transaction Reference ID</label>
                                            <input
                                                type="text"
                                                required
                                                value={paymentRef}
                                                onChange={(e) => setPaymentRef(e.target.value)}
                                                placeholder="e.g. UPI Ref: 3049283049"
                                                className="w-full mt-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>

                                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-6 text-center hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400 transition-all cursor-pointer relative group">
                                            <input type="file" accept="image/*" required={!proofPreview} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                                            {proofPreview ? (
                                                <div className="relative">
                                                    <img src={proofPreview} alt="Proof" className="h-32 mx-auto object-contain rounded-lg shadow-md" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold rounded-lg transition-opacity">Change Image</div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-sm group-hover:text-indigo-500 transition-colors">
                                                    <ArrowUpTrayIcon className="h-10 w-10 mx-auto mb-2 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                                    <span className="font-bold">Upload Payment Screenshot</span>
                                                    <p className="text-xs mt-1 text-gray-400">Drag & drop or click to browse</p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processingSellerId}
                                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                                        >
                                            {processingSellerId ? (
                                                <>Processing <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div></>
                                            ) : (
                                                <>Confirm & Notify Seller <PaperAirplaneIcon className="h-5 w-5" /></>
                                            )}
                                        </button>
                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CHAT MODAL --- */}
                {activeChatPayout && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setActiveChatPayout(null)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Payout Support</h3>
                                    <p className="text-xs text-gray-500">Sales ID: {activeChatPayout.transaction?._id?.slice(-6)}</p>
                                </div>
                                <button onClick={() => setActiveChatPayout(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition"><XCircleIcon className="h-6 w-6 text-gray-500 hover:text-gray-900 dark:hover:text-white" /></button>
                            </div>
                            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
                                {activeChatPayout.queries?.length === 0 && <p className="text-center text-gray-400 text-sm italic mt-10">No messages yet. Start a conversation.</p>}
                                {activeChatPayout.queries?.map((q, i) => (
                                    <div key={i} className={`flex ${q.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${q.sender === 'admin' ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                            <p>{q.message}</p>
                                            <p className={`text-[10px] mt-1 ${q.sender === 'admin' ? 'text-indigo-200' : 'text-gray-400'}`}>{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendQuery} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex gap-2">
                                <input
                                    autoFocus
                                    value={chatMessage}
                                    onChange={e => setChatMessage(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button type="submit" disabled={msgSending} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"><PaperAirplaneIcon className="h-5 w-5" /></button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPayouts;
