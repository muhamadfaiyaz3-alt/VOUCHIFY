import React, { useMemo } from 'react';
import { useCart } from '../Contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    TrashIcon,
    ShoppingCartIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    SparklesIcon,
    BanknotesIcon,
    TagIcon,
    ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';

export default function CartPage() {
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    const total = useMemo(() => cart.reduce((sum, item) => sum + item.listedPrice, 0), [cart]);

    // Handle single item checkout for now since backend supports one-by-one
    const handleBuyNow = (voucherId) => {
        navigate(`/payment/${voucherId}`);
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-indigo-50 dark:bg-slate-950 font-sans flex items-center justify-center">
                {/* --- SKY ANIMATION --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="cloud c1"></div>
                    <div className="cloud c2"></div>
                    <div className="cloud c3"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent dark:from-indigo-900/30 dark:via-purple-900/10 dark:to-slate-950"></div>
                </div>

                <div className="relative z-10 text-center max-w-md mx-auto p-8 animate-fade-in-up">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-12 border border-indigo-100 dark:border-slate-800 shadow-2xl">
                        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <ShoppingCartIcon className="h-10 w-10 text-indigo-500" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full animate-bounce"></div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Your Cart is Empty</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                            Looks like you haven't discovered our amazing deals yet.
                        </p>
                        <Link
                            to="/vouchers"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
                        >
                            <SparklesIcon className="h-5 w-5 mr-2" /> Start Exploring
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 font-sans relative overflow-hidden transition-colors duration-500 py-12 px-4 sm:px-6 lg:px-8">

            {/* --- SKY ANIMATION --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="cloud c1"></div>
                <div className="cloud c2"></div>
                <div className="cloud c3"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent dark:from-indigo-900/30 dark:via-purple-900/10 dark:to-slate-950"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <Link to="/vouchers" className="inline-flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors mb-6 group">
                        <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Continue Shopping
                    </Link>

                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm mb-2">
                            Shopping Cart
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2">
                            <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Secure Transaction</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* --- CART ITEMS LIST --- */}
                    <div className="lg:col-span-2 space-y-6">
                        {cart.map((item, index) => (
                            <div
                                key={item._id}
                                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 border border-white/50 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-colors"></div>

                                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                                    {/* Image */}
                                    <div className="w-full sm:w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative group-hover:ring-4 ring-indigo-50 dark:ring-indigo-900/20 transition-all">
                                        <img
                                            src={item.imageUrl || (item.mediaUrls && item.mediaUrls[0]) || "https://via.placeholder.com/150"}
                                            alt={item.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-center sm:text-left w-full">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0">
                                                {item.category}
                                            </span>
                                        </div>

                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 font-medium">
                                            {item.description}
                                        </p>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</p>
                                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                                    ₹{item.listedPrice.toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200"
                                                    title="Remove from Cart"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>

                                                <button
                                                    onClick={() => handleBuyNow(item._id)}
                                                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold uppercase text-xs tracking-wider hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    Buy Now <ArrowRightIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear your cart?')) clearCart();
                                }}
                                className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <ArchiveBoxXMarkIcon className="h-4 w-4" /> Clear Entire Cart
                            </button>
                        </div>
                    </div>

                    {/* --- SUMMARY CARD --- */}
                    <div className="lg:col-span-1 sticky top-8">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span className="font-bold">₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-medium">
                                    <span>Platform Savings</span>
                                    <span className="font-bold">- ₹0.00</span>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black text-slate-900 dark:text-white">Total</span>
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                        ₹{total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-8 flex items-start gap-3">
                                <TagIcon className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-indigo-800 dark:text-indigo-200 font-semibold leading-relaxed">
                                    <span className="font-bold">Note:</span> Vouchers are sold individually. Please use the "Buy Now" button on each item to proceed with secure payment.
                                </p>
                            </div>

                            <button
                                disabled
                                className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-2xl font-bold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <BanknotesIcon className="h-5 w-5" /> Bulk Checkout (Soon)
                            </button>

                            <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-wider font-bold">
                                100% Secure Payments
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
