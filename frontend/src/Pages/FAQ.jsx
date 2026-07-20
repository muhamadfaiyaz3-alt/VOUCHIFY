import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import client from '../api/client';

const FAQ = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data } = await client.get('/public/faq');
        setFaqData(data);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const categories = ['All', ...faqData.map(c => c.category)];

  const filteredFAQs = faqData
    .filter(cat => activeCategory === 'All' || cat.category === activeCategory)
    .flatMap(cat => cat.questions.map(q => ({ ...q, category: cat.category }))) // Flatten to list
    .filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleIndex = (id) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Buying': return <ShoppingBagIcon className="w-5 h-5" />;
      case 'Selling': return <BanknotesIcon className="w-5 h-5" />;
      case 'Security': return <ShieldCheckIcon className="w-5 h-5" />;
      default: return <Squares2X2Icon className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 relative overflow-hidden font-sans">

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-blue-300/20 dark:bg-blue-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-96 h-96 bg-purple-300/20 dark:bg-purple-900/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20 relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 shadow-sm"
          >
            <SparklesIcon className="h-6 w-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">help?</span>
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search questions (e.g., 'refund', 'fees', 'safety')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-lg text-slate-800 dark:text-white transition-all placeholder:text-slate-400"
            />
          </motion.div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {!loading && categories.map((cat, idx) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 + 0.3 }}
              className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${activeCategory === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              {getCategoryIcon(cat)}
              {cat}
            </motion.button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500">Loading answers...</p>
            </div>
          ) : filteredFAQs.length > 0 ? (
            <AnimatePresence>
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border ${openIndex === faq.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700'} shadow-sm hover:shadow-md transition-all overflow-hidden`}
                >
                  <button
                    onClick={() => toggleIndex(faq.id || index)}
                    className="w-full text-left px-8 py-6 flex items-start md:items-center justify-between focus:outline-none gap-4"
                  >
                    <div>
                      <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 rounded-md mb-2 uppercase tracking-wide">
                        {faq.category}
                      </span>
                      <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${openIndex === faq.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`p-2 rounded-full ${openIndex === faq.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-50 dark:bg-slate-700'}`}>
                      <ChevronDownIcon
                        className={`w-6 h-6 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${openIndex === faq.id ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {openIndex === (faq.id || index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-8 pb-8 pt-2">
                          <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50 mb-6"></div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            {faq.answer}
                          </p>
                          {/* Helpful Actions (Mock) */}
                          <div className="flex items-center gap-4 mt-6 pt-4">
                            <span className="text-sm font-medium text-slate-400">Was this helpful?</span>
                            <button className="p-1 hover:text-green-500 text-slate-400 transition-colors"><span className="text-xl">👍</span></button>
                            <button className="p-1 hover:text-red-500 text-slate-400 transition-colors"><span className="text-xl">👎</span></button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="text-xl font-medium">No results found for "{searchQuery}"</p>
              <p onClick={() => setSearchQuery('')} className="text-blue-500 hover:underline cursor-pointer mt-2">Clear search</p>
            </div>
          )}
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/50"
        >
          <QuestionMarkCircleIcon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Still have questions?</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30"
          >
            Get in Touch
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default FAQ;
