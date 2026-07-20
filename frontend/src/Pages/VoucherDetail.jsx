import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useVouchers } from "../Contexts/VoucherContext";
import { useAuth } from "../Contexts/AuthContext";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  XCircleIcon,
  ShieldCheckIcon,
  TicketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import client from "../api/client";

const VoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getVoucherById } = useVouchers();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getVoucherById(id);
        if (isMounted) {
          setVoucher(data);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load voucher.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [getVoucherById, id]);

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 2.5 : 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans">
        <SparklesIcon className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Unlocking details...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 flex items-center justify-center transition-colors font-sans">
        <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl">
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {error || "Voucher not found"}
          </h2>
          <p className="text-slate-500 mb-6">This voucher generally expires or gets removed.</p>
          <Link to="/vouchers" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
            Back to Vouchers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 font-sans relative overflow-hidden transition-colors duration-500 py-12 px-4">
      {/* --- SKY ANIMATION --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="cloud c1"></div>
        <div className="cloud c2"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/40 via-purple-50/20 to-transparent dark:from-indigo-900/40 dark:via-slate-900/20 dark:to-slate-950"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Navigation */}
        <Link to="/vouchers" className="inline-flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white mb-8 group font-bold tracking-wide uppercase text-xs">
          <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Return to Browse
        </Link>

        {/* Main Ticket Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 dark:border-slate-800 flex flex-col lg:flex-row shadow-indigo-500/10 dark:shadow-black/50 perspective-1000">

          {/* Left: Image Section */}
          <div className="lg:w-1/2 bg-slate-100 dark:bg-slate-800/50 relative group cursor-zoom-in" onClick={() => { setIsZoomed(true); setZoomLevel(1); }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Admin Verified Badge Overlay */}
            <div className="absolute top-6 left-6 z-20">
              <span className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900 shadow-lg flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4" /> Admin Verified
              </span>
            </div>

            <div className="w-full h-full min-h-[400px] flex items-center justify-center p-8 lg:p-12 relative z-10">
              {voucher.imageUrl ? (
                <img
                  src={voucher.imageUrl}
                  alt={voucher.title}
                  className="max-w-full max-h-[400px] object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <TicketIcon className="w-48 h-48 text-slate-200 dark:text-slate-700" />
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/5">
                <span className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white px-5 py-2.5 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                  <MagnifyingGlassPlusIcon className="h-5 w-5" /> Tap to Zoom
                </span>
              </div>
            </div>
          </div>

          {/* Right: Details Section */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col relative bg-white/50 dark:bg-slate-900/50">

            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {voucher.category}
                </span>
                {voucher.quantity > 0 ? (
                  <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Available
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Sold Out
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                {voucher.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {voucher.description}
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-colors"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                      ₹{voucher.listedPrice?.toLocaleString()}
                    </span>
                    {voucher.originalPrice > voucher.listedPrice && (
                      <span className="text-lg text-slate-400 line-through decoration-slate-400/50 font-bold">
                        ₹{voucher.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {voucher.originalPrice > voucher.listedPrice && (
                  <div className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-lg font-black transform rotate-2 group-hover:rotate-0 transition-transform">
                    {Math.round(((voucher.originalPrice - voucher.listedPrice) / voucher.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-lg shrink-0">
                  <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expires</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(voucher.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-slate-800 rounded-lg shrink-0">
                  <UserIcon className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seller</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{voucher.owner?.displayName || "Verified Seller"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
              {voucher.currentUserTransactionStatus ? (
                <button disabled className="w-full py-4 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center gap-2 cursor-not-allowed border-2 border-orange-200 dark:border-orange-800/30">
                  <ExclamationCircleIcon className="h-5 w-5" /> Pending Approval
                </button>
              ) : voucher.quantity > 0 ? (
                <button
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    if (!user.displayName || !user.phone || !user.address || !user.identityProofUrl) {
                      alert("Please complete your profile first.");
                      navigate("/profile");
                      return;
                    }
                    navigate(`/payment/${voucher._id}`);
                  }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <TicketIcon className="h-6 w-6" /> Buy Now
                </button>
              ) : (
                <button disabled className="w-full py-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold cursor-not-allowed uppercase tracking-wider">
                  Sold Out
                </button>
              )}
              <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                <ShieldCheckIcon className="h-3 w-3" /> Secure Transaction Guaranteed
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* FULLSCREEN ZOOM MODAL */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col animate-fade-in">
          {/* Header/Controls */}
          <div className="flex items-center justify-between px-6 py-4 fixed top-0 w-full z-20">
            <h3 className="text-white font-bold text-lg truncate max-w-md drop-shadow-md hidden md:block">{voucher.title}</h3>
            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={toggleZoom}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition backdrop-blur-sm border border-white/10"
                title="Toggle Zoom"
              >
                {zoomLevel > 1 ? <MagnifyingGlassMinusIcon className="h-6 w-6" /> : <MagnifyingGlassPlusIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-3 bg-white/10 hover:bg-red-500/80 rounded-full text-white transition backdrop-blur-sm border border-white/10"
                title="Close"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          {/* Scrollable Image Area */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <img
              src={voucher.imageUrl}
              alt="Full View"
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease-in-out' }}
              className={`max-w-none ${zoomLevel === 1 ? 'max-h-[85vh] object-contain' : ''} shadow-2xl rounded-lg`}
              onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherDetail;
