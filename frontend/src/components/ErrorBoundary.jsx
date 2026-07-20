import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.state = { hasError: true, error, errorInfo };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen grid place-items-center overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-500 relative">
                    {/* Background Ambience */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-rose-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="max-w-xl w-full mx-4 relative z-10">
                        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl p-8 md:p-12 text-center transform hover:scale-[1.01] transition-transform duration-500">

                            {/* 3D Animated Icon */}
                            <div className="relative inline-block mb-8 group">
                                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-2xl shadow-lg shadow-red-500/30 transform group-hover:rotate-12 transition-transform duration-500">
                                    <ExclamationTriangleIcon className="h-12 w-12 text-white" />
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-400 mb-4 tracking-tight">
                                System Error
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Something went unexpectedly wrong. Our team has been notified, and we're working to fix it.
                            </p>

                            {this.state.error && (
                                <div className="mb-8 text-left">
                                    <details className="group bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl overflow-hidden transition-all duration-300 open:shadow-md">
                                        <summary className="cursor-pointer p-4 text-sm font-semibold text-red-700 dark:text-red-400 flex items-center justify-between outline-none">
                                            <span>View Technical Diagnostic</span>
                                            <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                                        </summary>
                                        <div className="p-4 pt-0 text-xs font-mono text-red-600 dark:text-red-300 overflow-auto max-h-60 custom-scrollbar">
                                            <p className="font-bold mb-2">{this.state.error.toString()}</p>
                                            <pre className="whitespace-pre-wrap opacity-75">{this.state.errorInfo?.componentStack}</pre>
                                        </div>
                                    </details>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <span>↻</span> Reload Page
                                </button>
                                <Link
                                    to="/"
                                    className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    Return Home
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Need immediate help? <a href="mailto:support@vouchify.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact Support</a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
