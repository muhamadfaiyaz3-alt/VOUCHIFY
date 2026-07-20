import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import client from '../api/client'; // Assuming there's a configured axios client

import {
   BuildingOffice2Icon,
   LightBulbIcon,
   RocketLaunchIcon,
   ShieldCheckIcon,
   BoltIcon,
   CurrencyDollarIcon,
   UserGroupIcon,
   ArrowUpTrayIcon,
   MagnifyingGlassIcon,
   CreditCardIcon,
   ArrowsRightLeftIcon,
   CheckCircleIcon,
   SparklesIcon,
   ArrowLongRightIcon,
   StarIcon,
   HeartIcon,
   TicketIcon,
} from '@heroicons/react/24/outline';

const About = () => {
   const [activeTab, setActiveTab] = useState('problem');
   const [stats, setStats] = useState({ vouchers: 0, users: 0, savings: 0, transactions: 0 });
   const [loading, setLoading] = useState(true);

   // Fetch live stats from backend
   useEffect(() => {
      const fetchStats = async () => {
         try {
            const { data } = await client.get('/public/stats');
            const targetStats = {
               vouchers: data.activeVouchers || 0,
               users: data.totalUsers || 0,
               savings: data.totalSavings || 0,
               transactions: data.totalTransactions || 0
            };

            // Animate numbers
            const duration = 2000;
            let startTimestamp = null;
            const step = (timestamp) => {
               if (!startTimestamp) startTimestamp = timestamp;
               const progress = Math.min((timestamp - startTimestamp) / duration, 1);

               setStats({
                  vouchers: Math.floor(progress * targetStats.vouchers),
                  users: Math.floor(progress * targetStats.users),
                  savings: Math.floor(progress * targetStats.savings),
                  transactions: Math.floor(progress * targetStats.transactions)
               });

               if (progress < 1) {
                  window.requestAnimationFrame(step);
               }
            };
            window.requestAnimationFrame(step);
         } catch (error) {
            console.error("Failed to fetch public stats:", error);
            // Fallback to 0 or keeping initial state if error
         } finally {
            setLoading(false);
         }
      };

      fetchStats();
   }, []);

   const scrollToHowItWorks = () => {
      const element = document.getElementById('how-it-works');
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
      }
   };

   const statsDisplay = [
      { value: stats.users.toLocaleString(), label: '+ Trusted Users', icon: UserGroupIcon },
      { value: stats.vouchers.toLocaleString(), label: '+ Vouchers Listed', icon: TicketIcon },
      { value: stats.transactions.toLocaleString(), label: '+ Successful Swaps', icon: ArrowsRightLeftIcon },
      { value: `$${stats.savings.toLocaleString()} `, label: '+ Total Savings', icon: CurrencyDollarIcon },
   ];

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-500">

         {/* Background Ambience */}
         <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse delay-1000" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         </div>

         {/* Hero Section */}
         <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-800 opacity-95 dark:opacity-90 z-0 mask-gradient" />

            <div className="relative z-10 container mx-auto px-4 text-center">
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
               >
                  <div className="inline-flex items-center justify-center p-4 mb-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl animate-float">
                     <BuildingOffice2Icon className="h-10 w-10 text-blue-200" />
                  </div>

                  <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white mb-6 drop-shadow-xl filter">
                     About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-white animate-text-shimmer bg-300%">Vouchify</span>
                  </h1>

                  <p className="mt-6 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md">
                     Transforming unused vouchers into real savings.
                     <span className="block mt-2 text-white font-bold opacity-90">Join the revolution today. 🚀</span>
                  </p>

                  <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
                     <Link
                        to="/vouchers"
                        className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2 group"
                     >
                        Explore Vouchers <ArrowLongRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </Link>
                     <button
                        onClick={scrollToHowItWorks}
                        className="px-8 py-4 bg-white/10 border border-white/30 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl cursor-pointer"
                     >
                        How It Works
                     </button>
                  </div>
               </motion.div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 w-full leading-none z-10 text-slate-50 dark:text-slate-900">
               <svg className="block w-full h-16 md:h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="currentColor"></path>
               </svg>
            </div>
         </section>

         {/* Stats Section */}
         <section className="py-16 bg-slate-50 dark:bg-slate-900 relative z-10 -mt-20">
            <div className="container mx-auto px-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {statsDisplay.map((stat, idx) => (
                     <div key={idx} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 dark:border-slate-700 flex flex-col items-center text-center hover:transform hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                           <stat.icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</span>
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</span>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Problem / Solution Toggle */}
         <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-6xl">
               <div className="flex flex-col lg:flex-row gap-16 items-center">
                  <div className="w-full lg:w-1/2">
                     <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 inline-flex mb-8 shadow-inner">
                        {['problem', 'solution'].map((tab) => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${activeTab === tab
                                 ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400 scale-105'
                                 : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                 } `}
                           >
                              {tab === 'problem' ? 'The Problem' : 'Our Solution'}
                           </button>
                        ))}
                     </div>

                     <AnimatePresence mode="wait">
                        <motion.div
                           key={activeTab}
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           transition={{ duration: 0.3 }}
                           className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-lg relative overflow-hidden group"
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                           {activeTab === 'problem' ? (
                              <>
                                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Unused Vouchers are <span className="text-red-500">Wasted Money.</span></h2>
                                 <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                                    Billions of dollars in gift cards and vouchers go unused every year. They expire, get lost, or simply forgotten. This is a massive loss for consumers who paid for value they never received.
                                 </p>
                                 <div className="flex items-center gap-4 text-red-600 dark:text-red-400 font-bold p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
                                    <LightBulbIcon className="h-6 w-6" />
                                    <span>The current system is inefficient.</span>
                                 </div>
                              </>
                           ) : (
                              <>
                                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">A Marketplace for <span className="text-green-500">Hidden Value.</span></h2>
                                 <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                                    Vouchify creates a secure, seamless bridge between those with unwanted vouchers and those looking for a deal. We turn potential waste into liquid cash and savings.
                                 </p>
                                 <div className="flex items-center gap-4 text-green-600 dark:text-green-400 font-bold p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
                                    <RocketLaunchIcon className="h-6 w-6" />
                                    <span>Simple. Secure. Smart.</span>
                                 </div>
                              </>
                           )}
                        </motion.div>
                     </AnimatePresence>
                  </div>

                  <div className="w-full lg:w-1/2 flex justify-center perspective-1000">
                     <motion.div
                        animate={{ rotateY: activeTab === 'problem' ? 0 : 180 }}
                        transition={{ duration: 0.6 }}
                        className="relative w-full max-w-md aspect-square"
                     >
                        <div className={`absolute inset-0 bg-gradient-to-tr ${activeTab === 'problem' ? 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30' : 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30'} rounded-full flex items-center justify-center shadow-3xl border-4 border-white/50 dark:border-slate-800 backdrop-blur-xl`}>
                           {activeTab === 'problem' ? (
                              <LightBulbIcon className="w-1/2 h-1/2 text-orange-500 drop-shadow-2xl" />
                           ) : (
                              <RocketLaunchIcon className="w-1/2 h-1/2 text-emerald-500 drop-shadow-2xl transform rotate-y-180" style={{ transform: 'rotateY(180deg)' }} />
                           )}
                        </div>
                     </motion.div>
                  </div>
               </div>
            </div>
         </section>

         {/* Why Choose Vouchify - Glitch Effect Cards */}
         <section className="py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 dark:bg-blue-900/10 skew-x-12 transform origin-top-right z-0"></div>
            <div className="container mx-auto px-4 relative z-10">
               <div className="text-center mb-20">
                  <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full font-bold text-sm tracking-wide uppercase shadow-sm">Features</span>
                  <h2 className="text-4xl md:text-5xl font-black mt-6 text-slate-900 dark:text-white drop-shadow-sm">Why Choose Vouchify?</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <GlitchCard
                     icon={ShieldCheckIcon}
                     title="Secure"
                     desc="Bank-grade encryption and verified user profiles ensure your peace of mind."
                     baseColor="blue"
                  />
                  <GlitchCard
                     icon={BoltIcon}
                     title="Fast"
                     desc="List in seconds, sell in minutes. Our platform is built for speed."
                     baseColor="amber"
                  />
                  <GlitchCard
                     icon={CurrencyDollarIcon}
                     title="Profitable"
                     desc="Maximize value with competitive pricing and low fees."
                     baseColor="emerald"
                  />
                  <GlitchCard
                     icon={UserGroupIcon}
                     title="Community"
                     desc="Join thousands of trusted buyers and sellers in our growing network."
                     baseColor="purple"
                  />
               </div>
            </div>
         </section>

         {/* How It Works */}
         <section id="how-it-works" className="py-24 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">How It Works</h2>
                  <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Six simple steps to turning your unused vouchers into cash or savings.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                     { icon: ArrowUpTrayIcon, title: "List", desc: "Upload details.", color: "blue" },
                     { icon: MagnifyingGlassIcon, title: "Discover", desc: "Find deals.", color: "purple" },
                     { icon: CreditCardIcon, title: "Pay", desc: "Secure checkout.", color: "emerald" },
                     { icon: ArrowsRightLeftIcon, title: "Exchange", desc: "Instant transfer.", color: "amber" },
                     { icon: CheckCircleIcon, title: "Confirm", desc: "Verify validity.", color: "teal" },
                     { icon: SparklesIcon, title: "Enjoy", desc: "Save money!", color: "pink" },
                  ].map((item, i) => (
                     <div key={i} className="relative group overflow-hidden rounded-3xl p-8 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 transition-all duration-300">
                        {/* Hover Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/5 to-${item.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                        {/* Border Glow */}
                        <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-400/30 transition-colors duration-300"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                           <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 bg-${item.color}-100 dark:bg-${item.color}-900/30`}>
                              <item.icon className="h-10 w-10 text-slate-700 dark:text-white" />
                           </div>
                           <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                           <p className="text-slate-500 dark:text-slate-300 font-medium">{item.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* CTA */}
         <section className="py-24 bg-gradient-to-r from-blue-700 to-purple-800 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
               <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight drop-shadow-lg">Ready to Unlock Value?</h2>
               <p className="text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">Join thousands of smart savers today. No hidden fees. Completely secure.</p>
               <Link to="/register" className="inline-block px-12 py-5 bg-white text-blue-800 font-black text-lg rounded-full shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300 transform">
                  Create Free Account
               </Link>
            </div>
         </section>

      </div>
   );
};

// --- Special Glitch Card Component ---
const GlitchCard = ({ icon: Icon, title, desc, baseColor }) => {
   return (
      <div className="group relative h-full bg-white dark:bg-slate-800 rounded-3xl p-1 z-0 transition-transform duration-300 hover:-translate-y-2">
         {/* Animated Border Gradient */}
         <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-${baseColor}-400 via-purple-500 to-${baseColor}-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 -z-10`}></div>

         <div className="relative h-full bg-white dark:bg-slate-800 rounded-[22px] p-7 overflow-hidden">
            {/* Split Color Glitch Effect Layers */}
            <div className="absolute inset-0 bg-cyan-400/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out origin-left skew-x-12"></div>
            <div className="absolute inset-0 bg-red-400/10 translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300 delay-75 ease-out origin-right -skew-x-12"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
               <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-${baseColor}-50 dark:bg-${baseColor}-900/20 group-hover:bg-transparent transition-colors duration-300`}>
                  <Icon className={`h-10 w-10 text-${baseColor}-600 dark:text-${baseColor}-400 group-hover:scale-110 transition-transform duration-300`} />
               </div>

               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:tracking-wide transition-all duration-300">{title}</h3>
               <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{desc}</p>
            </div>
         </div>
      </div>
   );
};

export default About;
