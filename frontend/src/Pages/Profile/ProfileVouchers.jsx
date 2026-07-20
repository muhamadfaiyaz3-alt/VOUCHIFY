import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import client from "../../api/client";
import { Link } from "react-router-dom";
import {
    BanknotesIcon,
    CheckBadgeIcon,
    ClockIcon,
    MagnifyingGlassPlusIcon,
    XCircleIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    TicketIcon
} from "@heroicons/react/24/outline";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function ProfileVouchers() {
    const [bought, setBought] = useState([]);
    const [sold, setSold] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [boughtRes, soldRes, listingsRes] = await Promise.all([
                    client.get('/transactions?type=bought'),
                    client.get('/transactions?type=sold'),
                    client.get('/me/vouchers')
                ]);

                setBought(boughtRes.data);
                setSold(soldRes.data);
                setMyListings(listingsRes.data);
            } catch (e) {
                console.error("Fetch vouchers failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const TransactionCard = ({ tx, type }) => (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-4 border border-gray-100 dark:border-slate-700 hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-center group shadow-sm dark:shadow-none">
            <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`p-4 rounded-2xl ${type === 'bought' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'} border border-gray-100 dark:border-white/5`}>
                    {type === 'bought' ? <TicketIcon className="h-6 w-6" /> : <BanknotesIcon className="h-6 w-6" />}
                </div>
                <div>
                    <h4 className="font-black text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{tx.voucher?.title || "Deleted Voucher"}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-2">
                        {new Date(tx.createdAt).toLocaleDateString()}
                        <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-slate-600"></span>
                        <span className={`uppercase font-bold tracking-wider ${tx.status === 'completed' ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>{tx.status}</span>
                    </p>
                </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <span className="font-black text-2xl text-gray-900 dark:text-white">₹{tx.amountPaid.toFixed(2)}</span>

                {type === 'bought' && (tx.status === 'completed' || tx.status === 'paid') && (
                    <Link to={`/payment/${tx.voucher?._id}`} className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-500 hover:scale-105 transition-all shadow-lg shadow-indigo-600/20">
                        View Code
                    </Link>
                )}
            </div>
        </div>
    );

    const ListingCard = ({ voucher }) => {
        const isSold = voucher.transaction && ['paid', 'completed', 'pending_admin_confirmation'].includes(voucher.transaction.status);
        const isExpired = !isSold && new Date(voucher.expiryDate) < new Date();
        const buyerName = voucher.buyer?.displayName || "a buyer";

        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-4 border border-gray-100 dark:border-slate-700 hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-sm dark:shadow-none">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">{voucher.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">Original: <span className="line-through text-gray-400 dark:text-slate-600">₹{voucher.originalPrice}</span> • Listed: <span className="text-gray-900 dark:text-white font-bold">₹{voucher.listedPrice}</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isSold ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                            isExpired ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' :
                                'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                        }`}>
                        {isSold ? 'SOLD' : isExpired ? 'EXPIRED' : voucher.status}
                    </span>
                </div>

                {/* Status Messages */}
                <div className="relative z-10">
                    {isSold ? (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                            <CheckBadgeIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                            <p className="text-sm text-emerald-700 dark:text-emerald-200">Sold to <strong className="text-gray-900 dark:text-white">{buyerName}</strong>. Check Payouts tab.</p>
                        </div>
                    ) : isExpired ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                            <ClockIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                            <p className="text-sm text-red-700 dark:text-red-200">This listing has expired.</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                                <ClockIcon className="h-4 w-4" /> Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                            </span>
                            {!voucher.isApproved && <span className="text-amber-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending Review</span>}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ProfilePayoutsContent = () => {
        const [payouts, setPayouts] = useState([]);
        const [pLoading, setPLoading] = useState(true);
        const [selectedProof, setSelectedProof] = useState(null);
        const [activeChatPayout, setActiveChatPayout] = useState(null);
        const [chatMessage, setChatMessage] = useState("");
        const [msgSending, setMsgSending] = useState(false);

        const fetchPayouts = () => {
            client.get('/payouts').then(res => setPayouts(res.data)).catch(console.error).finally(() => setPLoading(false));
        }

        useEffect(() => {
            fetchPayouts();
        }, []);

        const handleSendQuery = async (e) => {
            e.preventDefault();
            if (!chatMessage.trim()) return;
            setMsgSending(true);
            try {
                await client.post(`/payouts/${activeChatPayout._id}/query`, { message: chatMessage });
                setChatMessage("");
                fetchPayouts(); // refresh
                const updated = { ...activeChatPayout };
                updated.queries = [...(updated.queries || []), { sender: 'user', message: chatMessage, createdAt: new Date() }];
                setActiveChatPayout(updated);
            } catch (err) {
                console.error("Failed to send message", err);
                alert("Failed to send message");
            } finally {
                setMsgSending(false);
            }
        };

        if (pLoading) return <div className="text-center py-8 text-gray-500 dark:text-slate-500">Loading payouts...</div>;
        if (payouts.length === 0) return <div className="text-center py-12 text-gray-500 dark:text-slate-500 italic border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl">No payout history found.</div>;

        return (
            <div className="space-y-4">
                {payouts.map((payout) => (
                    <div key={payout._id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500 transition-all flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`p-3 rounded-xl border ${payout.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : payout.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
                                <BanknotesIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">₹{payout.amount}</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-bold tracking-wider mt-0.5">{payout.status}</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:items-end w-full md:w-auto">
                            <p className="text-xs text-gray-500 dark:text-slate-500 font-mono mb-2">
                                {new Date(payout.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveChatPayout(payout)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-2 relative"
                                >
                                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                    Help
                                    {payout.queries && payout.queries.length > 0 && (
                                        <span className="bg-red-500 text-white w-2 h-2 rounded-full absolute top-1 right-1"></span>
                                    )}
                                </button>
                                {payout.status === 'paid' && payout.adminProofUrl && (
                                    <button
                                        onClick={() => setSelectedProof(payout.adminProofUrl)}
                                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition flex items-center gap-2"
                                    >
                                        <MagnifyingGlassPlusIcon className="h-4 w-4" />
                                        Proof
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Proof Modal */}
                {selectedProof && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProof(null)}>
                        <div className="relative max-w-4xl w-full max-h-[90vh]">
                            <img src={selectedProof} alt="Proof" className="w-full h-full object-contain rounded-lg shadow-2xl border border-white/10" />
                            <button className="absolute -top-12 right-0 text-white hover:text-red-400 transition" onClick={() => setSelectedProof(null)}>
                                <XCircleIcon className="h-10 w-10" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat Modal */}
                {activeChatPayout && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setActiveChatPayout(null)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">Support Chat</h3>
                                <button onClick={() => setActiveChatPayout(null)}><XCircleIcon className="h-6 w-6 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white" /></button>
                            </div>
                            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-950/50">
                                {activeChatPayout.queries?.map((q, i) => (
                                    <div key={i} className={`flex ${q.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${q.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-bl-none border border-gray-200 dark:border-slate-700'}`}>
                                            <p>{q.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendQuery} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                                <input
                                    value={chatMessage}
                                    onChange={e => setChatMessage(e.target.value)}
                                    placeholder="Type message..."
                                    className="flex-1 bg-gray-100 dark:bg-slate-800 border-none rounded-full px-4 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
                                    style={{ colorScheme: 'light dark' }}
                                />
                                <button type="submit" disabled={msgSending} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500"><PaperAirplaneIcon className="h-5 w-5" /></button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-slate-800 min-h-[500px] flex flex-col transition-colors duration-300">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 shrink-0">
                <TicketIcon className="h-8 w-8 text-indigo-500" />
                Voucher Management
            </h2>

            <Tab.Group>
                <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 dark:bg-slate-800 p-1 mb-8 shrink-0">
                    {["My Listings", "Purchased", "Sold History", "Payouts"].map((category) => (
                        <Tab
                            key={category}
                            className={({ selected }) =>
                                classNames(
                                    "w-full rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider leading-5 transition-all duration-300 focus:outline-none",
                                    selected
                                        ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm dark:shadow-lg"
                                        : "text-gray-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-gray-700 dark:hover:text-white"
                                )
                            }
                        >
                            {category}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="flex-1 overflow-y-auto custom-scrollbar max-h-[800px] pr-2">
                    <Tab.Panel className="animate-fade-in space-y-4">
                        {loading ? <div className="text-gray-500 dark:text-slate-500 text-center">Loading...</div> : myListings.length > 0 ? myListings.map(v => <ListingCard key={v._id} voucher={v} />) : <div className="text-gray-500 dark:text-slate-500 text-center py-10 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl">No listings yet. Start selling!</div>}
                    </Tab.Panel>
                    <Tab.Panel className="animate-fade-in space-y-4">
                        {loading ? <div className="text-gray-500 dark:text-slate-500 text-center">Loading...</div> : bought.length > 0 ? bought.map(tx => <TransactionCard key={tx._id} tx={tx} type="bought" />) : <div className="text-gray-500 dark:text-slate-500 text-center py-10 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl">No purchases yet. Go buy some vouchers!</div>}
                    </Tab.Panel>
                    <Tab.Panel className="animate-fade-in space-y-4">
                        {loading ? <div className="text-gray-500 dark:text-slate-500 text-center">Loading...</div> : sold.length > 0 ? sold.map(tx => <TransactionCard key={tx._id} tx={tx} type="sold" />) : <div className="text-gray-500 dark:text-slate-500 text-center py-10 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl">No completed sales history.</div>}
                    </Tab.Panel>
                    <Tab.Panel className="animate-fade-in space-y-4">
                        <ProfilePayoutsContent />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}
