// src/sections/FeaturesSection.jsx
import React from 'react';
import FeatureCard from '../components/FeatureCard';
import {
    ArrowUpTrayIcon,
    MagnifyingGlassIcon,
    GiftIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const FeaturesSection = () => {
    return (
        <section id="features" className="py-24 relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
            {/* Ambient Background Elements - Enhanced for Light Mode */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-200/40 via-transparent to-transparent dark:from-indigo-900/20"></div>

                {/* Right Blob: Purple/Pink */}
                <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-fuchsia-200/40 dark:bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-normal filter opacity-80 animate-blob"></div>

                {/* Left Blob: Blue/Cyan */}
                <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-cyan-200/40 dark:bg-sky-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-normal filter opacity-80 animate-blob animation-delay-2000"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-800 backdrop-blur-sm animate-fade-in-up">
                        <SparklesIcon className="w-4 h-4" />
                        <span>Simple & Secure Process</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white mb-8 tracking-tight animate-fade-in-up animation-delay-100">
                        Unlock the Power of <br /> Unused Vouchers
                    </h2>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-light animate-fade-in-up animation-delay-200">
                        Join thousands of users who are turning their spare vouchers into cash or finding incredible deals securely on Vouchify.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
                    {/* Card 1: List Voucher */}
                    <div className="animate-fade-in-up animation-delay-300 h-full">
                        <FeatureCard
                            icon={<ArrowUpTrayIcon />}
                            bgColor="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/40"
                            title="Sell Vouchers"
                            description="Easily list your unused vouchers with details like expiry and price. Reach trusted buyers instantly."
                            buttonLabel="Start Selling"
                            buttonLink="/list-voucher"
                            buttonIcon={<ArrowUpTrayIcon />}
                        />
                    </div>

                    {/* Card 2: Find Discounts */}
                    <div className="animate-fade-in-up animation-delay-400 h-full">
                        <FeatureCard
                            icon={<MagnifyingGlassIcon />}
                            bgColor="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-purple-500/40"
                            title="Find Vouchers"
                            description="Browse a wide range of discounted vouchers across verified categories. Grab exclusive deals instantly."
                            buttonLabel="Explore Deals"
                            buttonLink="/vouchers"
                            buttonIcon={<MagnifyingGlassIcon />}
                        />
                    </div>

                    {/* Card 3: Earn & Rewards */}
                    <div className="animate-fade-in-up animation-delay-500 h-full">
                        <FeatureCard
                            icon={<GiftIcon />}
                            bgColor="bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/40"
                            title="Earn Rewards"
                            description="Monetize assets, save big & unlock exclusive loyalty bonuses like offers, cashback, and scratch cards!"
                            buttonLabel="See Rewards"
                            buttonLink="/rewards-info"
                            buttonIcon={<GiftIcon />}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;