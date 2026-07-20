import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVouchers } from '../Contexts/VoucherContext';
import { useAuth } from '../Contexts/AuthContext';
import { usePaymentConfig } from '../Contexts/PaymentConfigContext';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CurrencyRupeeIcon,
  PhotoIcon,
  MapPinIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TagIcon,
  BanknotesIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { Switch } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Simple Tooltip Component
const Tooltip = ({ text, children }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 left-1/2 -translate-x-1/2">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const ListVoucher = () => {
  const { user } = useAuth();
  const { addVoucher } = useVouchers();
  const { config, loading: configLoading, error: configError } = usePaymentConfig();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Other',
    originalPrice: '',
    expiry: '',
    code: '',
    imageUrl: '',
    userVerificationImage: '',
    isListedForSale: true,
  });

  const [payoutAccepted, setPayoutAccepted] = useState(false);

  const [previews, setPreviews] = useState({
    imageUrl: '',
    userVerificationImage: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [calculatedValues, setCalculatedValues] = useState({
    sellingPrice: 0,
    buyerDiscountAmount: 0,
    sellerPayoutAmount: 0,
    platformFeeAmount: 0,
    companyShareAmount: 0,
  });

  useEffect(() => {
    // Recalculate whenever formData.originalPrice, listing status, or config changes
    if (!config) return;

    const originalPriceNum = parseFloat(formData.originalPrice);

    if (formData.isListedForSale && !isNaN(originalPriceNum) && originalPriceNum > 0) {
      // 1. Calculate Buyer Discount (Dynamic from config)
      const buyerDiscount = originalPriceNum * config.buyerDiscountPercent;

      // 2. Calculate Selling Price (What buyer pays)
      const sellingPrice = originalPriceNum - buyerDiscount;

      // 3. Calculate Fees based on SELLING PRICE (Dynamic from config)
      const platformFee = sellingPrice * config.platformFeePercent;
      const companyShare = sellingPrice * config.companySharePercent;

      // 4. Calculate Seller Payout
      const sellerPayout = sellingPrice - platformFee - companyShare;

      setCalculatedValues({
        sellingPrice: parseFloat(sellingPrice.toFixed(2)),
        buyerDiscountAmount: parseFloat(buyerDiscount.toFixed(2)),
        sellerPayoutAmount: parseFloat(sellerPayout.toFixed(2)),
        platformFeeAmount: parseFloat(platformFee.toFixed(2)),
        companyShareAmount: parseFloat(companyShare.toFixed(2)),
      });
    } else {
      setCalculatedValues({
        sellingPrice: 0, buyerDiscountAmount: 0, sellerPayoutAmount: 0,
        platformFeeAmount: 0, companyShareAmount: 0,
      });
    }
  }, [formData.originalPrice, formData.isListedForSale, config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    if (submitError) setSubmitError(null);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, [fieldName]: "File size must be less than 5MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
        setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
        setFormErrors(prev => ({ ...prev, [fieldName]: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({ ...prev, isListedForSale: checked }));
    if (!checked) setPayoutAccepted(true); // Auto-accept if not selling (saving only)
    else setPayoutAccepted(false); // Reset acceptance if toggling back to sell
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];
    const originalPriceNum = Number(formData.originalPrice);

    if (!formData.name.trim()) errors.name = 'Voucher name is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.code.trim()) errors.code = 'Voucher code is required.';

    if (!formData.originalPrice) {
      errors.originalPrice = 'Original value is required.';
    } else if (isNaN(originalPriceNum) || originalPriceNum <= 0) {
      errors.originalPrice = 'Enter a valid positive value.';
    }

    if (!formData.expiry) {
      errors.expiry = 'Expiry date is required.';
    } else if (formData.expiry < today) {
      errors.expiry = 'Expiry date cannot be in the past.';
    }

    if (!formData.imageUrl) {
      errors.imageUrl = "Voucher image is required.";
    }

    if (!formData.userVerificationImage) {
      errors.userVerificationImage = "Live photo with geo-tag is MANDATORY for approval.";
    }

    if (formData.isListedForSale && !payoutAccepted) {
      errors.payoutAccepted = "You must accept the pricing terms.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage('');

    if (configLoading || !config) {
      setSubmitError("Pricing configuration not loaded yet. Please wait.");
      return;
    }

    // Profile Completion Check
    if (!user.displayName || !user.phone || !user.address || !user.identityProofUrl) {
      alert("Incomplete Profile! You must provide your Full Name, Phone, Address, and Identity Proof to list a voucher.");
      navigate("/profile");
      return;
    }

    if (!validateForm()) {
      const firstErrorKey = Object.keys(formErrors)[0];
      const element = document.getElementById(firstErrorKey) || document.getElementById('main-form');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setIsSubmitting(true);

    try {
      const originalPriceNum = parseFloat(formData.originalPrice);

      const voucherData = {
        title: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: [formData.category],
        originalPrice: originalPriceNum,
        listedPrice: formData.isListedForSale ? calculatedValues.sellingPrice : originalPriceNum,
        discountPercent: config.buyerDiscountPercent,
        sellerPayout: calculatedValues.sellerPayoutAmount,
        platformFeePercent: config.platformFeePercent,
        companySharePercent: config.companySharePercent,
        quantity: 1,
        limitPerUser: 1,
        expiryDate: formData.expiry,
        scratchCode: formData.code.trim(),
        imageUrl: formData.imageUrl,
        userVerificationImage: formData.userVerificationImage,
        instructions: "Redeem on merchant site",
        terms: formData.description.trim(),
        status: formData.isListedForSale ? "published" : "draft",
      };

      await addVoucher(voucherData);

      setSuccessMessage(`Voucher submitted! It is now PENDING Admin Approval. You will be notified once verified.`);

      setTimeout(() => {
        navigate("/profile");
      }, 3000);

    } catch (err) {
      console.error('Submission Error:', err);
      const msg = err.response?.data?.message || err.message || "Failed to save voucher";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (field) => `mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-200 ${formErrors[field] ? 'border-red-500 ring-1 ring-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white'
    }`;

  if (configLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 flex justify-center">
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Left Panel Skeleton */}
              <div className="bg-indigo-900/10 p-8 lg:col-span-1 space-y-8 animate-pulse">
                <div className="h-6 w-32 bg-gray-300 rounded icon-placeholder mb-4"></div>
                <div className="space-y-3">
                  <div className="h-24 bg-gray-300 rounded-xl"></div>
                  <div className="h-24 bg-gray-300 rounded-xl"></div>
                  <div className="h-24 bg-gray-300 rounded-xl"></div>
                </div>
              </div>

              {/* Form Skeleton */}
              <div className="p-6 lg:p-10 lg:col-span-2 space-y-8">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="space-y-6">
                  <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>
                    <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>
                  </div>
                  <div className="h-32 w-full bg-gray-100 rounded-xl animate-pulse"></div>
                  <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Configuration Error</h3>
          <p className="text-gray-500 mb-6">{configError}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Retry</button>
        </div>
      </div>
    );
  }

  // Determine if we should show the live breakdown
  const showBreakdown = formData.isListedForSale && !isNaN(parseFloat(formData.originalPrice)) && parseFloat(formData.originalPrice) > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between md:justify-center relative mb-8">
          <Link to="/" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition md:absolute md:left-0">
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-center">
            List Your Voucher
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-3">

            {/* Left Side - Info Panel & Sticky Breakdown */}
            <div className="bg-gradient-to-b from-indigo-700 to-indigo-900 p-8 text-white lg:col-span-1 lg:min-h-[800px] relative">
              <div className="lg:sticky lg:top-8 space-y-8">

                {!showBreakdown ? (
                  /* Static Info State */
                  <>
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in">
                      <div className="p-3 bg-white/10 rounded-full mb-4">
                        <ShieldCheckIcon className="h-8 w-8 text-indigo-300" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Secure Listing</h3>
                      <p className="text-indigo-100 text-sm leading-relaxed">
                        Your voucher details are <span className="font-semibold text-white">encrypted</span>.
                      </p>
                    </div>

                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                      <div className="p-3 bg-white/10 rounded-full mb-4">
                        <BanknotesIcon className="h-8 w-8 text-green-300" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">How much will I get?</h3>
                      <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                        Enter your Original Voucher Price to see your exact earnings calculated dynamically.
                      </p>
                      <div className="w-full bg-indigo-800/50 rounded-lg p-4 text-xs space-y-2">
                        <div className="flex justify-between"><span>Platform Fee</span> <span>{(config.platformFeePercent * 100).toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span>Buyer Discount</span> <span>{(config.buyerDiscountPercent * 100).toFixed(1)}%</span></div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Dynamic Breakdown State */
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl transform transition-all duration-500 animate-slide-up">
                    <h4 className="font-bold text-white mb-6 text-lg tracking-wide border-b border-white/20 pb-2">
                      Estimated Payout
                    </h4>

                    <dl className="space-y-4 text-sm">
                      <div className="flex justify-between text-indigo-100">
                        <dt>Original Value</dt>
                        <dd className="font-mono">₹{parseFloat(formData.originalPrice).toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between text-pink-300">
                        <dt>Discount ({(config.buyerDiscountPercent * 100).toFixed(0)}%)</dt>
                        <dd className="font-mono">- ₹{calculatedValues.buyerDiscountAmount.toFixed(2)}</dd>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex justify-between font-semibold text-white">
                        <dt>Listing Price</dt>
                        <dd className="font-mono">₹{calculatedValues.sellingPrice.toFixed(2)}</dd>
                      </div>

                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-xs text-indigo-200">
                          <dt>Platform Fee</dt>
                          <dd>- ₹{calculatedValues.platformFeeAmount.toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between text-xs text-indigo-200">
                          <dt>Company Share</dt>
                          <dd>- ₹{calculatedValues.companyShareAmount.toFixed(2)}</dd>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t-2 border-dashed border-white/30 flex justify-between items-center">
                        <dt className="text-lg font-bold text-white">Net Payout</dt>
                        <dd className="text-3xl font-extrabold text-green-300 drop-shadow-sm">
                          ₹{calculatedValues.sellerPayoutAmount.toFixed(2)}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-[10px] text-indigo-200 mt-4 text-center">
                      * Payout processed within 24hrs of sale
                    </p>
                  </div>
                )}
                {/* Always show verification warning at bottom of sticky area */}
                {!showBreakdown && (
                  <div className="flex items-center p-4 bg-orange-500/20 rounded-xl border border-orange-400/30">
                    <MapPinIcon className="h-6 w-6 text-orange-300 mr-3" />
                    <p className="text-xs text-orange-50 font-medium">Geo-tagged photo required for listing.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-6 lg:p-10 lg:col-span-2 relative" id="main-form">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* 0. Error Messages */}
                {submitError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex">
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">{submitError}</p>
                    </div>
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
                    </div>
                  </div>
                )}

                {/* 1. Basic Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center border-b border-gray-200 dark:border-slate-700 pb-2">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-500" /> Basic Details
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Voucher Title <span className="text-red-500">*</span></label>
                      <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={getInputClass('name')} placeholder="e.g. Amazon Gift Card ₹500" />
                      {formErrors.name && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.name}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="mt-1 block w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-sm"
                        >
                          <option>Electronics</option><option>Fashion</option><option>Travel</option><option>Food</option><option>Groceries</option><option>Entertainment</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Expiry Date <span className="text-red-500">*</span></label>
                        <input type="date" name="expiry" id="expiry" value={formData.expiry} onChange={handleChange} className={getInputClass('expiry')} min={new Date().toISOString().split('T')[0]} />
                        {formErrors.expiry && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.expiry}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Payouts */}
                <div id="payout-card">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center border-b border-gray-200 dark:border-slate-700 pb-2">
                    <CurrencyRupeeIcon className="h-5 w-5 mr-2 text-indigo-500" /> Pricing & Payout
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Original Voucher Value (₹) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                        </div>
                        <input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice} onChange={handleChange} className={`${getInputClass('originalPrice')} pl-7`} placeholder="0.00" />
                      </div>
                      {formErrors.originalPrice && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.originalPrice}</p>}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">See breakdown on the left panel.</p>
                    </div>

                    {/* Listing Toggle */}
                    <Switch.Group as="div" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                      <span className="flex-grow flex flex-col">
                        <Switch.Label as="span" className="text-sm font-medium text-gray-900 dark:text-white" passive>List for Sale</Switch.Label>
                        <Switch.Description as="span" className="text-xs text-gray-500 dark:text-gray-400">Enable to sell on marketplace</Switch.Description>
                      </span>
                      <Switch
                        checked={formData.isListedForSale}
                        onChange={handleSwitchChange}
                        className={`${formData.isListedForSale ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      >
                        <span className={`${formData.isListedForSale ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                      </Switch>
                    </Switch.Group>

                    {/* Terms Acceptance Toggle - Moved near pricing inputs for context, but refers to breakdown */}
                    {showBreakdown && (
                      <div className="mt-2 flex items-start p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center h-5">
                          <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            checked={payoutAccepted}
                            onChange={(e) => setPayoutAccepted(e.target.checked)}
                            className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="terms" className="font-medium text-indigo-900 cursor-pointer select-none">I accept the payout terms</label>
                          <p className="text-indigo-700 text-xs mt-1">
                            I agree to the <span className="font-bold">₹{calculatedValues.sellerPayoutAmount.toFixed(2)}</span> payout shown in the breakdown.
                          </p>
                          {formErrors.payoutAccepted && <p className="text-red-600 font-bold mt-1 text-xs">{formErrors.payoutAccepted}</p>}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* 3. Confidential Data */}
                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center border-b border-gray-200 dark:border-slate-700 pb-2">
                    <TagIcon className="h-5 w-5 mr-2 text-indigo-500" /> Confidential Data
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Voucher Code / PIN <span className="text-red-500">*</span></label>
                      <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} className={getInputClass('code')} placeholder="XYZ-1234-5678" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                        <ShieldCheckIcon className="h-3 w-3 mr-1 text-indigo-500" /> Encrypted & Hidden until sold.
                      </p>
                      {formErrors.code && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.code}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions <span className="text-red-500">*</span></label>
                      <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleChange} className={getInputClass('description')} placeholder="Any restrictions? e.g. Valid only on website..." />
                      {formErrors.description && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.description}</p>}
                    </div>
                  </div>
                </div>

                {/* 4. Verification Images */}
                <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/40">
                  <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-5 flex items-center border-b border-orange-200 dark:border-orange-800 pb-2">
                    <MapPinIcon className="h-5 w-5 mr-2 text-orange-500" /> Verification (Mandatory)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Voucher Image */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">1. Reference Image (Voucher Screenshot) <span className="text-red-500">*</span></label>
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl h-48 hover:bg-white dark:hover:bg-slate-800 transition bg-gray-50 dark:bg-slate-800/40 flex flex-col justify-center items-center text-center cursor-pointer group">
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imageUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {previews.imageUrl ? (
                          <img src={previews.imageUrl} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                        ) : (
                          <>
                            <div className="p-3 bg-gray-200 dark:bg-slate-700 rounded-full mb-2 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition">
                              <PhotoIcon className="h-8 w-8 text-gray-400 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300" />
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Click to upload</span>
                          </>
                        )}
                      </div>
                      {formErrors.imageUrl && <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-bold">{formErrors.imageUrl}</p>}
                    </div>

                    {/* Live User Photo */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">2. Live Selfie with Geo-Tag <span className="text-red-500">*</span></label>
                      <div className="relative border-2 border-dashed border-orange-300 dark:border-orange-800/60 rounded-xl h-48 hover:bg-white dark:hover:bg-slate-800 transition bg-orange-50/50 dark:bg-orange-950/20 flex flex-col justify-center items-center text-center cursor-pointer group">
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'userVerificationImage')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {previews.userVerificationImage ? (
                          <img src={previews.userVerificationImage} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                        ) : (
                          <>
                            <div className="p-3 bg-orange-100 dark:bg-orange-950/40 rounded-full mb-2 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition">
                              <MapPinIcon className="h-8 w-8 text-orange-400 dark:text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                            </div>
                            <span className="text-sm text-orange-600 dark:text-orange-400 font-bold group-hover:text-orange-800 dark:group-hover:text-orange-300">Upload Live Photo</span>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 max-w-[150px]">Must show you holding ID/Screen with location enabled</p>
                          </>
                        )}
                      </div>
                      {formErrors.userVerificationImage && <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-bold">{formErrors.userVerificationImage}</p>}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !!successMessage}
                    className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Verifying & Listing...
                      </>
                    ) : (
                      "Verify & List Voucher"
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    By listing, you agree to our <a href="#" className="underline hover:text-indigo-600">Terms of Service</a>. Fraudulent listings result in immediate ban.
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListVoucher;