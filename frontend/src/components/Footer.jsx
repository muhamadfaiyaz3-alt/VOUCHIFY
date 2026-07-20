






import React from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon,
    InformationCircleIcon,
    EnvelopeIcon,
    TicketIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    QuestionMarkCircleIcon,
    UserPlusIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const footerNavLinks = [
    { label: 'Buy Vouchers', to: '/vouchers', icon: TicketIcon },
    { label: 'Sell Vouchers', to: '/list-voucher', icon: TicketIcon },
    { label: 'Rewards Info', to: '/rewards-info', icon: SparklesIcon },
    { label: 'Referrals', to: '/referrals', icon: UserPlusIcon }, // Added missing route
    { label: 'About Us', to: '/about', icon: InformationCircleIcon },
    { label: 'Contact Us', to: '/contact', icon: EnvelopeIcon },
];

const socialLinks = [
    { name: 'Facebook', icon: FaFacebookF, href: 'https://facebook.com/yourpage', ariaLabel: 'Visit our Facebook page' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/yourprofile', ariaLabel: 'Follow us on Twitter' },
    { name: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/yourprofile', ariaLabel: 'Check out our Instagram' },
    { name: 'LinkedIn', icon: FaLinkedinIn, href: 'https://linkedin.com/company/yourcompany', ariaLabel: 'Connect with us on LinkedIn' },
];

const Footer = () => {
    return (
        <footer className="relative bg-slate-950 text-slate-400 overflow-hidden font-sans border-t border-white/5">
            {/* 10. Background Modification on Sky Animations & 4. P3 Colors */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] md:blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px] md:blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-3xl"></div>
            </div>

            {/* 9. Marquee Tags (Slower Speed & New Headlines) */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-b border-white/5 overflow-hidden flex items-center z-10">
                <div className="animate-marquee whitespace-nowrap flex space-x-12 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300/80" style={{ animationDuration: '60s' }}>
                    <span>🚀 New Vouchers Added Hourly!</span> • <span>Stay Tuned For Exclusive Deals</span> • <span>⚡ Instant Delivery</span> • <span>🛡️ 100% Secure Transactions</span> • <span>💰 Sell Unused Vouchers for Cash</span> •
                    <span>🚀 New Vouchers Added Hourly!</span> • <span>Stay Tuned For Exclusive Deals</span> • <span>⚡ Instant Delivery</span> • <span>🛡️ 100% Secure Transactions</span> • <span>💰 Sell Unused Vouchers for Cash</span> •
                    <span>🚀 New Vouchers Added Hourly!</span> • <span>Stay Tuned For Exclusive Deals</span> • <span>⚡ Instant Delivery</span> • <span>🛡️ 100% Secure Transactions</span> • <span>💰 Sell Unused Vouchers for Cash</span>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-12 mt-6">
                <div className="xl:grid xl:grid-cols-4 xl:gap-12">

                    {/* Brand Section & Newsletter */}
                    <div className="space-y-6 xl:col-span-1 mb-12 xl:mb-0">
                        <Link to="/" className="group block w-fit">
                            {/* 6. Gradients & 14. Text Color */}
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-2 group-hover:to-fuchsia-400 transition-all duration-500">
                                Vouchify
                            </h3>
                            <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full group-hover:w-full transition-all duration-500 ease-out"></div>
                        </Link>
                        <p className="text-sm leading-7 text-slate-400 font-light max-w-xs">
                            The premium marketplace for buying and selling digital vouchers. Safe, fast, and globally connected.
                        </p>

                        {/* Newsletter Functionality */}
                        <div className="pt-2">
                            <form className="relative" onSubmit={(e) => e.preventDefault()}>
                                <label className="text-xs font-bold text-white uppercase tracking-wider mb-2 block">Stay Updated</label>
                                <div className="flex">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-l-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors"
                                    >
                                        Go
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Systems Badge */}
                        <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Systems Operational
                            </div>
                        </div>
                    </div>

                    {/* Navigation Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 xl:col-span-3">

                        {/* 2. CSS Grid Layout - Column 1 */}
                        <div>
                            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-6 relative inline-block">
                                Discovery
                                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-indigo-500 rounded-full"></span>
                            </h4>
                            <ul className="space-y-4">
                                {footerNavLinks.slice(0, 3).map((item) => (
                                    <li key={item.label}>
                                        <Link to={item.to} className="group flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300">
                                            <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mr-3 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 group-hover:scale-110 transition-all duration-300">
                                                <item.icon className="h-4 w-4 group-hover:text-indigo-400 transition-colors" />
                                            </span>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-6 relative inline-block">
                                Company
                                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-fuchsia-500 rounded-full"></span>
                            </h4>
                            <ul className="space-y-4">
                                {footerNavLinks.slice(3, 6).map((item) => (
                                    <li key={item.label}>
                                        <Link to={item.to} className="group flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300">
                                            <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mr-3 group-hover:bg-fuchsia-500/20 group-hover:border-fuchsia-500/40 group-hover:scale-110 transition-all duration-300">
                                                <item.icon className="h-4 w-4 group-hover:text-fuchsia-400 transition-colors" />
                                            </span>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3 - Resources */}
                        <div className="col-span-2 md:col-span-1 mt-8 md:mt-0">
                            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-6 relative inline-block">
                                Legal
                                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-sky-500 rounded-full"></span>
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { label: 'Privacy Policy', to: '/privacy-policy', icon: ShieldCheckIcon },
                                    { label: 'Terms of Service', to: '/terms-of-service', icon: DocumentTextIcon },
                                    { label: 'Help Center & FAQ', to: '/faq', icon: QuestionMarkCircleIcon }
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link to={item.to} className="group flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300">
                                            <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mr-3 group-hover:bg-sky-500/20 group-hover:border-sky-500/40 group-hover:scale-110 transition-all duration-300">
                                                <item.icon className="h-4 w-4 group-hover:text-sky-400 transition-colors" />
                                            </span>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* 13. Hover Effects on Socials */}
                    <div className="flex space-x-4 md:order-2">
                        {socialLinks.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20 overflow-hidden"
                                aria-label={item.ariaLabel}
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <item.icon className="h-5 w-5 relative z-10" />
                            </a>
                        ))}
                    </div>

                    <div className="text-center md:text-left md:order-1">
                        <p className="text-xs text-slate-500 font-medium">
                            &copy; {new Date().getFullYear()} Vouchify Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
