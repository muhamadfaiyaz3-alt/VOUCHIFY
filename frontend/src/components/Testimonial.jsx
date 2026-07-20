// src/components/Testimonial.jsx
import React from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import {
    ArrowUpIcon,
    ArrowDownIcon,
    EnvelopeIcon,
    TicketIcon
} from '@heroicons/react/20/solid';

const StarRating = ({ rating }) => {
    const totalStars = 5;
    const numericRating = typeof rating === 'number' ? Math.max(0, Math.min(rating, totalStars)) : 0;
    return (
        <div className="flex items-center space-x-0.5">
            {[...Array(totalStars)].map((_, i) => (
                i < numericRating
                    ? <StarSolid key={i} className="h-4 w-4 text-amber-400 drop-shadow-sm" />
                    : <StarOutline key={i} className="h-4 w-4 text-slate-400/50" />
            ))}
        </div>
    );
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) { return dateString; }
};

const maskEmail = (email) => {
    if (!email || typeof email !== 'string' || !email.includes('@')) return 'Email hidden';
    const [localPart, domain] = email.split('@');
    return localPart.length <= 3 ? `${localPart.substring(0, 1)}***@${domain}` : `${localPart.substring(0, 3)}***@${domain}`;
};

const Testimonial = ({
    quote, name, email, avatarSeed, avatarUrl, rating, transactionType, voucherBrand, date, backgroundImageUrl
}) => {
    const getTransactionStyles = (type) => {
        return type === 'Sold'
            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            : 'bg-blue-500/20 text-blue-200 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
    };

    const getTransactionIcon = (type) => {
        return type === 'Sold'
            ? <ArrowUpIcon className="h-3 w-3 mr-1.5" />
            : <ArrowDownIcon className="h-3 w-3 mr-1.5" />;
    };

    return (
        <div className="group relative h-full min-h-[340px] rounded-3xl transition-all duration-500 hover:-translate-y-2">
            {/* Animated Glow Border Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-70 blur-md transition duration-500 group-hover:duration-200 animate-gradient-xy"></div>

            {/* Main Card Container */}
            <div className="relative h-full rounded-3xl overflow-hidden bg-slate-900 ring-1 ring-white/10 group-hover:ring-transparent transition-all">

                {/* Background Image & Parallax Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                    style={{ backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none' }}
                />

                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40 opacity-90 group-hover:opacity-95 transition-all duration-500"></div>

                {/* Glassmorphism Content Layer */}
                <div className="relative h-full p-6 flex flex-col z-10">

                    {/* Header: Rating & Date */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-slate-950/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/5 shadow-inner">
                            <StarRating rating={rating} />
                        </div>
                        {date && (
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-950/40 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5 uppercase">
                                {formatDate(date)}
                            </span>
                        )}
                    </div>

                    {/* Quote Section with Decorative Icon */}
                    <div className="flex-grow mb-4 relative">
                        <div className="absolute -top-2 -left-2 text-6xl text-indigo-500/10 font-serif leading-none select-none">"</div>
                        <p className="relative text-slate-200 font-medium leading-relaxed italic text-sm md:text-base drop-shadow-md group-hover:text-white transition-colors duration-300">
                            {quote || 'No message shared.'}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {transactionType && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm tracking-wide ${getTransactionStyles(transactionType)}`}>
                                {getTransactionIcon(transactionType)}
                                {transactionType.toUpperCase()}
                            </span>
                        )}
                        {voucherBrand && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 backdrop-blur-sm shadow-[0_0_10px_rgba(99,102,241,0.15)]">
                                <TicketIcon className="h-3 w-3 mr-1.5" />
                                {voucherBrand}
                            </span>
                        )}
                    </div>

                    {/* Footer / User Info with Hover Glow */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                        <div className="relative group/avatar">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-full blur opacity-40 group-hover/avatar:opacity-100 transition-opacity duration-300"></div>
                            <img
                                src={avatarUrl || `https://i.pravatar.cc/150?u=${avatarSeed || name}`}
                                alt={name}
                                className="relative h-11 w-11 rounded-full object-cover border-2 border-slate-800 group-hover:border-white/20 transition-all duration-300"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random` }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300">
                                {name || 'Anonymous'}
                            </h4>
                            {email && (
                                <div className="flex items-center text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                    <EnvelopeIcon className="h-3 w-3 mr-1" />
                                    {maskEmail(email)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonial;