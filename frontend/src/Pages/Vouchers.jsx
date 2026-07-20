import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useVouchers } from "../Contexts/VoucherContext";
import { useCart } from "../Contexts/CartContext";
import { useNotifications } from "../Contexts/NotificationContext";
import { useAuth } from "../Contexts/AuthContext";
import {
  TicketIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
  ListBulletIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FireIcon,
  MapIcon,
  FilmIcon,
  ShoppingCartIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarDaysIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Vouchers = () => {
  const { vouchers, deleteVoucher, loading, error } = useVouchers();
  const { addToCart, cart } = useCart();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const categories = useMemo(() => [
    'All',
    'Food & Dining',
    'Travel & Hotel',
    'Entertainment',
    'Groceries',
    'Health & Beauty',
    'Services',
    'Other',
  ], []);

  const filteredVouchers = useMemo(() => {
    const categoryFiltered = selectedCategory === 'All'
      ? vouchers
      : vouchers.filter(v => v.category === selectedCategory);

    if (!searchTerm) return categoryFiltered;

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return categoryFiltered.filter(voucher => (
      voucher.title.toLowerCase().includes(lowercasedSearchTerm) ||
      voucher.description.toLowerCase().includes(lowercasedSearchTerm) ||
      voucher.owner?.displayName?.toLowerCase().includes(lowercasedSearchTerm) ||
      voucher.category.toLowerCase().includes(lowercasedSearchTerm)
    ));
  }, [selectedCategory, vouchers, searchTerm]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the voucher "${name}"?`)) {
      try {
        await deleteVoucher(id);
        addNotification(`Voucher "${name}" deleted.`, 'success');
      } catch (err) {
        console.error("Delete failed", err);
        addNotification("Failed to delete voucher", 'error');
      }
    }
  };

  const handleAddToCart = (voucher) => {
    addToCart(voucher);
    addNotification(`"${voucher.title}" added to cart!`, 'success');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food & Dining': return <FireIcon className="h-4 w-4 mr-1.5" />;
      case 'Travel & Hotel': return <MapIcon className="h-4 w-4 mr-1.5" />;
      case 'Entertainment': return <FilmIcon className="h-4 w-4 mr-1.5" />;
      case 'Groceries': return <ShoppingCartIcon className="h-4 w-4 mr-1.5" />;
      case 'Health & Beauty': return <HeartIcon className="h-4 w-4 mr-1.5" />;
      case 'Services': return <WrenchScrewdriverIcon className="h-4 w-4 mr-1.5" />;
      case 'Other': return <TagIcon className="h-4 w-4 mr-1.5" />;
      default: return <ListBulletIcon className="h-4 w-4 mr-1.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 font-sans relative overflow-hidden transition-colors duration-500">

      {/* --- SKY ANIMATION --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="cloud c1"></div>
        <div className="cloud c2"></div>
        <div className="cloud c3"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent dark:from-indigo-900/30 dark:via-purple-900/10 dark:to-slate-950"></div>
      </div>

      <div className="relative z-10">

        {/* --- HERO & MARQUEE --- */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-indigo-100 dark:border-slate-800 shadow-lg">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-2 drop-shadow-sm animate-fade-in-down">
              Discover Deals
            </h1>
            <p className="text-slate-600 dark:text-slate-300 font-medium animate-fade-in delay-100">
              Find and buy exclusive vouchers from our trusted community.
            </p>
          </div>

          {/* Marquee Strip */}
          <div className="bg-indigo-600 dark:bg-indigo-900 py-2 relative overflow-hidden">
            <div className="animate-marquee inline-flex items-center gap-8 whitespace-nowrap">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-widest">
                  <SparklesIcon className="h-3 w-3 text-yellow-300" />
                  <span>New Vouchers Added Daily!</span>
                  <span className="mx-2">•</span>
                  <span>Verify before you buy</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">

          {/* --- SEARCH & ACTIONS --- */}
          <div className="flex flex-col lg:flex-row items-center gap-6 mb-12 sticky top-4 z-40">
            {/* Search Bar */}
            <div className="flex-1 w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center p-2 border border-slate-100 dark:border-slate-700">
                <MagnifyingGlassIcon className="h-6 w-6 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search by title, category, or seller..."
                  className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-3 group"
            >
              <ShoppingCartIcon className="h-5 w-5 group-hover:animate-bounce" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs font-black">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>

          {/* --- FILTERS --- */}
          <div className="mb-12">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider mb-4"
            >
              <FunnelIcon className="h-4 w-4" /> Filter by Category
              {showCategories ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>

            {showCategories && (
              <div className="flex flex-wrap gap-3 animate-fade-in">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 border ${selectedCategory === category
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30 scale-105'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      }`}
                  >
                    {getCategoryIcon(category)} {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- CONTENT AREA --- */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <ArrowPathIcon className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Loading amazing deals...</p>
            </div>
          )}

          {error && !loading && (
            <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center animate-fade-in">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 dark:text-red-300 font-bold">{error}</p>
            </div>
          )}

          {!loading && !error && filteredVouchers.length === 0 && (
            <div className="text-center py-20 max-w-2xl mx-auto animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50"></div>

                <ArchiveBoxXMarkIcon className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Results Found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  We couldn't find any vouchers matching "{searchTerm}" in the {selectedCategory} category.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    Clear Filters
                  </button>
                  <Link to="/list-voucher" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition">
                    List a Voucher
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* --- VOUCHER GRID --- */}
          {!loading && !error && filteredVouchers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 perspective-1000">
              {filteredVouchers.map((voucher, idx) => (
                <div
                  key={voucher._id}
                  className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 transform-style-3d hover:-translate-y-2 flex flex-col h-full"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                      {voucher.category}
                    </span>
                  </div>

                  {/* Image Area */}
                  <div className="h-48 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <div className="w-full h-full flex items-center justify-center p-8 group-hover:scale-110 transition-transform duration-700 ease-out">
                      {voucher.imageUrl || (voucher.mediaUrls && voucher.mediaUrls.length > 0) ? (
                        <img
                          src={voucher.imageUrl || voucher.mediaUrls[0]}
                          alt={voucher.title}
                          className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <TicketIcon className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1 relative z-20">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {voucher.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        {voucher.owner?.displayName || "Verified Seller"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {voucher.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Expires</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <CalendarDaysIcon className="h-3 w-3" />
                          {new Date(voucher.expiryDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(voucher)}
                          className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all duration-300 shadow-sm"
                          title="Add to Cart"
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                        <Link
                          to={`/vouchers/${voucher._id}`}
                          className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-black uppercase tracking-wider hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white transition-all duration-300 flex items-center gap-2 shadow-lg"
                        >
                          View <ArrowRightIcon className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Admin Delete Action */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(voucher._id, voucher.title)}
                      className="absolute top-4 right-4 z-30 p-2 bg-red-100/80 dark:bg-red-900/80 text-red-600 dark:text-red-400 rounded-full backdrop-blur-sm hover:bg-red-600 hover:text-white transition-all"
                      title="Delete Voucher"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-20">
            <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-colors gap-2 group">
              <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Vouchers;
