// src/Pages/Contact.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  UserIcon,
  AtSymbolIcon,
  TagIcon,
  ChatBubbleLeftEllipsisIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  LifebuoyIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const FORM_ENDPOINT = "https://formspree.io/f/mykyynqg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Message sent! We\'ll get back to you shortly.' });
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        const data = await response.json();
        const errorMessage = data.errors ? data.errors.map(err => err.message).join(', ') : 'Unknown error.';
        setSubmitStatus({ type: 'error', message: `Error: ${errorMessage}. Please try again.` });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-hidden relative">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[100px] opacity-60 animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 shadow-sm">
            <EnvelopeIcon className="h-8 w-8" />
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Touch</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Please fill out this form or shoot us an email.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20 dark:border-slate-700 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 relative z-10">Send a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Name & Email Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Name</label>
                  <div className="relative group/input">
                    <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                  <div className="relative group/input">
                    <AtSymbolIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Subject</label>
                <div className="relative group/input">
                  <TagIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <select
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white appearance-none cursor-pointer"
                  >
                    <option>General Inquiry</option>
                    <option>Support & Help</option>
                    <option>Partnership</option>
                    <option>Feedback</option>
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Message</label>
                <div className="relative group/input">
                  <ChatBubbleLeftEllipsisIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <textarea
                    name="message"
                    id="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white placeholder-slate-400 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Status Messages */}
              {submitStatus.type && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-3 ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}
                >
                  {submitStatus.type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationCircleIcon className="h-6 w-6" />}
                  <span className="font-medium">{submitStatus.message}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><PaperAirplaneIcon className="h-5 w-5" /> Send Message</>
                )}
              </button>
            </form>
          </motion.div>

          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Info Cards */}
            <div className="grid gap-6">
              {[
                { icon: LifebuoyIcon, title: "Help Center", desc: "Browse our FAQ for quick answers.", color: "blue", link: "/faq" },
                { icon: EnvelopeIcon, title: "Email Us", desc: "muhamadfaiyaz3@gmail.com", color: "purple", action: "mailto:muhamadfaiyaz3@gmail.com" },
                { icon: ClockIcon, title: "Working Hours", desc: "Mon-Sat: 9AM - 6PM IST", color: "emerald", action: null }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-slate-700 shadow-lg flex items-center gap-6 group cursor-pointer"
                >
                  <div className={`h-14 w-14 rounded-full bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-7 w-7 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{item.title}</h3>
                    {item.action ? (
                      <a href={item.action} className="text-slate-600 dark:text-slate-300 hover:text-blue-500">{item.desc}</a>
                    ) : item.link ? (
                      <Link to={item.link} className="text-slate-600 dark:text-slate-300 hover:text-blue-500">{item.desc}</Link>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-300">{item.desc}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Decoration Box */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>

              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-yellow-300" />
                Did you know?
              </h3>
              <p className="text-indigo-100 leading-relaxed mb-6">
                Vouchify has helped users retrieve over <strong>$1.2 Million</strong> in lost value this year alone. Your feedback helps us grow!
              </p>

              <Link to="/about" className="inline-block px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-bold text-sm transition-colors border border-white/30">
                Check our Stats
              </Link>
            </div>

            <div className="flex justify-start">
              <Link to="/" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium">
                <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Home
              </Link>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;