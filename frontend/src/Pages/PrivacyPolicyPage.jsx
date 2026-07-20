import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import client from '../api/client';

const PrivacyPolicyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await client.get('/public/privacy');
        setData(data);
        if (data.sections.length > 0) setActiveSection(data.sections[0].id);
      } catch (error) {
        console.error("Failed to fetch Privacy Policy:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-slate-950 transition-colors duration-500 font-sans relative overflow-hidden">

      {/* --- BACKGROUND SKY ANIMATION --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="cloud c1"></div>
        <div className="cloud c2"></div>
        <div className="cloud c3"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/40 via-teal-50/20 to-transparent dark:from-emerald-900/20 dark:via-slate-900/10 dark:to-slate-950"></div>
      </div>

      <div className="relative z-10">
        {/* Header / Hero */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/20 dark:border-white/5 pt-10 pb-16 px-4 relative overflow-hidden shadow-sm">
          <div className="max-w-6xl mx-auto relative z-10">
            <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-8 group">
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in-down">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                <ShieldCheckIcon className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 drop-shadow-sm">
                  Privacy Policy
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Last Updated: <span className="text-emerald-600 dark:text-emerald-400">{data?.lastUpdated || "Loading..."}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">

          {/* Sidebar Navigation (Sticky) */}
          <aside className="lg:w-1/4 hidden lg:block relative">
            <div className="sticky top-10 space-y-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-3">On this page</h3>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>)}
                </div>
              ) : (
                data?.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeSection === section.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 translate-x-2'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                  >
                    {section.title}
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {loading ? (
              <div className="space-y-8 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-10"
              >
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg shrink-0">
                    <LockClosedIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-blue-900 dark:text-blue-200">Your Data Check</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                      Transparency is key. We want you to understand exactly where your data goes. Spoiler: We don't sell it.
                    </p>
                  </div>
                </div>

                {data?.sections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24 group">
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                          <EyeIcon className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        {section.title}
                      </h2>
                      <div
                        className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;