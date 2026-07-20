// src/components/TestimonialsSection.jsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Testimonial from './Testimonial';
import client from '../api/client';
import { useAuth } from '../Contexts/AuthContext';
import {
    PencilSquareIcon, StarIcon as StarOutline, UserIcon, ChatBubbleLeftEllipsisIcon,
    ChartBarIcon, HandThumbUpIcon, HandThumbDownIcon, EnvelopeIcon,
    TicketIcon, XMarkIcon, ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { PaperAirplaneIcon, CheckCircleIcon } from '@heroicons/react/20/solid';

const DEFAULT_CARD_BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1531297484001-80022131c5a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60';

const ITEMS_PER_PAGE = 6;
const POSITIVE_THRESHOLD = 4;
const NEGATIVE_THRESHOLD = 2;

const TestimonialsSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState(0);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Form State
    const [formData, setFormData] = useState({ quote: '', rating: 0, voucherBrand: '', transactionType: '' });
    const [formRatingHover, setFormRatingHover] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await client.get('/reviews?voucherId=general');
            // Map backend data to component props
            const mappedReviews = data.map(review => {
                // Generate background image based on content
                let searchTerm = 'abstract,pattern';
                const brandLower = review.voucherBrand?.toLowerCase();
                const type = review.transactionType;

                if (brandLower) {
                    if (brandLower.includes('amazon') || brandLower.includes('flipkart') || brandLower.includes('myntra')) searchTerm = 'shopping,product';
                    else if (brandLower.includes('zomato') || brandLower.includes('swiggy')) searchTerm = 'food,delivery';
                    else if (brandLower.includes('makemytrip') || brandLower.includes('uber')) searchTerm = 'travel,transport';
                    else if (brandLower.includes('bookmyshow')) searchTerm = 'entertainment,movie';
                    else searchTerm = review.voucherBrand;
                } else if (type === 'Bought') {
                    searchTerm = 'saving,discount';
                } else if (type === 'Sold') {
                    searchTerm = 'money,cash';
                }

                return {
                    id: review._id,
                    quote: review.comment || review.message,
                    name: review.user?.displayName || 'Anonymous',
                    email: null, // Privacy
                    role: 'User',
                    avatarSeed: review.user?.displayName || 'anon',
                    avatarUrl: review.user?.avatarUrl,
                    rating: review.rating,
                    transactionType: review.transactionType,
                    voucherBrand: review.voucherBrand,
                    date: review.createdAt,
                    backgroundImageUrl: `https://source.unsplash.com/500x500/?${encodeURIComponent(searchTerm)}&sig=${review._id}`
                };
            });
            setTestimonials(mappedReviews);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFormVisible && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isFormVisible]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (submitSuccess) setSubmitSuccess(false);
    }, [submitSuccess]);

    const handleRatingChange = useCallback((rate) => {
        setFormData(prev => ({ ...prev, rating: rate }));
        if (submitSuccess) setSubmitSuccess(false);
    }, [submitSuccess]);

    const handleHoverRating = useCallback((rate) => {
        setFormRatingHover(rate);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to submit a review.");
            navigate('/login');
            return;
        }
        if (formData.rating === 0) { alert("Please select a star rating."); return; }

        setIsSubmitting(true);
        setSubmitSuccess(false);

        try {
            await client.post('/reviews', {
                rating: formData.rating,
                message: formData.quote,
                voucherBrand: formData.voucherBrand,
                transactionType: formData.transactionType,
                voucherId: 'general'
            });

            setSubmitSuccess(true);
            setFormData({ quote: '', rating: 0, voucherBrand: '', transactionType: '' });
            setFormRatingHover(0);
            setIsFormVisible(false);
            fetchReviews(); // Refresh list
            setTimeout(() => setSubmitSuccess(false), 4000);
        } catch (error) {
            console.error("Submission failed:", error);
            alert(error.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const reviewSummary = useMemo(() => {
        if (!Array.isArray(testimonials)) return { positive: 0, negative: 0, total: 0 };
        let p = 0, n = 0;
        const t = testimonials.length;
        testimonials.forEach(item => {
            if (typeof item.rating === 'number') {
                if (item.rating >= POSITIVE_THRESHOLD) p++;
                else if (item.rating <= NEGATIVE_THRESHOLD && item.rating > 0) n++;
            }
        });
        return { positive: p, negative: n, total: t };
    }, [testimonials]);

    const filteredTestimonials = useMemo(() => {
        if (!Array.isArray(testimonials)) return [];
        if (filterRating === 0) return testimonials;
        return testimonials.filter(t => typeof t.rating === 'number' && t.rating >= filterRating);
    }, [testimonials, filterRating]);

    const visibleTestimonials = useMemo(() => {
        if (!Array.isArray(filteredTestimonials)) return [];
        return filteredTestimonials
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, visibleCount);
    }, [filteredTestimonials, visibleCount]);

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
    }, []);

    const toggleFormVisibility = useCallback(() => {
        if (!user) {
            // If not logged in, redirect to login
            navigate('/login');
            return;
        }
        setIsFormVisible(prevState => !prevState);
        if (submitSuccess) setSubmitSuccess(false);
    }, [submitSuccess, user, navigate]);

    const FilterButton = ({ ratingValue, label }) => (
        <button onClick={() => { setFilterRating(ratingValue); setVisibleCount(ITEMS_PER_PAGE); }} type="button" aria-pressed={filterRating === ratingValue} className={`px-4 py-1.5 text-sm font-medium rounded-full border transition duration-150 ease-in-out flex items-center space-x-1 ${filterRating === ratingValue ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}`}>
            {ratingValue > 0 && <StarSolid className={`h-4 w-4 ${filterRating === ratingValue ? 'text-yellow-300' : 'text-gray-400'}`} aria-hidden="true" />}
            <span>{label}</span>
        </button>
    );

    const StarRatingInput = ({ rating, hoverRating, onRate, onHover }) => (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => onRate(star)} onMouseEnter={() => onHover(star)} onMouseLeave={() => onHover(0)} className="p-1 text-gray-400 hover:text-yellow-500 focus:outline-none focus:text-yellow-500 transition-colors duration-150" aria-label={`Rate ${star} out of 5 stars`}>
                    <StarSolid className={`h-6 w-6 ${(hoverRating >= star || rating >= star) ? 'text-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
        </div>
    );

    return (
        <section className="relative py-16 md:py-20 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2FsbHBhcGVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=1470&q=80')` }}>
            <div className="absolute inset-0 bg-slate-800/70 z-0"></div>
            <div className="relative z-10 container mx-auto px-4">
                <div className="text-center mb-10 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md mb-3">User Feedback & Reviews</h2>
                    <p className="text-lg text-gray-100 drop-shadow max-w-3xl mx-auto">Hear from our community and share your own experience using Smart Voucher Exchange.</p>
                </div>

                <div className="max-w-3xl mx-auto bg-white dark:bg-dark-card p-6 rounded-xl shadow-xl border border-gray-200/60 dark:border-gray-700 transition-colors duration-500 mb-12 md:mb-16">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center flex justify-center items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-brand-accent" /> Review Snapshot
                    </h3>
                    {reviewSummary.total > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <HandThumbUpIcon className="h-5 w-5 text-green-500 shrink-0" />
                                <span className="text-sm font-medium text-gray-700 w-20 shrink-0">Positive</span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${reviewSummary.total > 0 ? (reviewSummary.positive / reviewSummary.total) * 100 : 0}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 w-10 text-right shrink-0">{reviewSummary.positive}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <HandThumbDownIcon className="h-5 w-5 text-orange-500 shrink-0" />
                                <span className="text-sm font-medium text-gray-700 w-20 shrink-0">Negative</span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${reviewSummary.total > 0 ? (reviewSummary.negative / reviewSummary.total) * 100 : 0}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 w-10 text-right shrink-0">{reviewSummary.negative}</span>
                            </div>
                            <p className="text-xs text-gray-500 text-center pt-1">Based on {reviewSummary.total} reviews.</p>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No reviews submitted yet.</p>
                    )}
                </div>

                <div className="max-w-2xl mx-auto mb-12 md:mb-16">
                    {!isFormVisible && (
                        <div className="text-center">
                            <button onClick={toggleFormVisibility} type="button" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <PencilSquareIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                {user ? 'Leave Your Feedback' : 'Login to Leave Feedback'}
                            </button>
                        </div>
                    )}
                    {isFormVisible && (
                        <div ref={formRef} className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-xl shadow-xl border border-gray-200/60 dark:border-gray-700 transition-all duration-300 ease-out">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                    <PencilSquareIcon className="h-6 w-6 mr-2 text-indigo-600 dark:text-brand-accent" /> Submit Your Feedback
                                </h3>
                                <button onClick={toggleFormVisibility} type="button" className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Close feedback form">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                                    <div className="relative">
                                        <label htmlFor="feedback-voucherBrand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voucher Brand</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TicketIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /></div>
                                            <input type="text" name="voucherBrand" id="feedback-voucherBrand" value={formData.voucherBrand} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-800 dark:text-white" placeholder="e.g., Amazon, Zomato" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="feedback-transactionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ArrowsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /></div>
                                            <select name="transactionType" id="feedback-transactionType" value={formData.transactionType} onChange={handleInputChange} className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none">
                                                <option value="" className="dark:bg-slate-800">-- Select --</option>
                                                <option value="Bought" className="dark:bg-slate-800">Bought Voucher</option>
                                                <option value="Sold" className="dark:bg-slate-800">Sold Voucher</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <label htmlFor="feedback-quote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Feedback / Message <span className="text-red-500">*</span></label>
                                    <div className="relative rounded-md shadow-sm">
                                        <ChatBubbleLeftEllipsisIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400 z-10" aria-hidden="true" />
                                        <textarea name="quote" id="feedback-quote" rows="4" required value={formData.quote} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-800 dark:text-white" placeholder="Tell us about your experience..."></textarea>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Rating <span className="text-red-500">*</span></label>
                                    <StarRatingInput rating={formData.rating} hoverRating={formRatingHover} onRate={handleRatingChange} onHover={handleHoverRating} />
                                </div>
                                <div className="pt-4 space-y-3">
                                    <div className="flex justify-center">
                                        <button type="submit" disabled={isSubmitting} className={`inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`} >
                                            {isSubmitting ? 'Submitting...' : <><PaperAirplaneIcon className="h-5 w-5 mr-2 -rotate-45" />Submit Feedback</>}
                                        </button>
                                    </div>
                                    {submitSuccess && (
                                        <div className="flex justify-center items-center text-sm text-green-600">
                                            <CheckCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                                            <span>Feedback submitted successfully!</span>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="flex justify-center items-center flex-wrap gap-3 mb-6 md:mb-8">
                    <span className="text-sm font-medium text-gray-100 mr-2 shrink-0">Filter reviews:</span>
                    <div className="flex flex-wrap justify-center gap-2">
                        <FilterButton ratingValue={0} label="All" />
                        <FilterButton ratingValue={4} label="4+ Stars" />
                        <FilterButton ratingValue={5} label="5 Stars" />
                    </div>
                </div>
                <h3 className="text-2xl font-semibold text-white drop-shadow-md mb-6 md:mb-8 text-center">Recent Reviews</h3>
                {visibleTestimonials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {visibleTestimonials.map((testimonial) => (
                            <Testimonial key={testimonial.id} {...testimonial} backgroundImageUrl={testimonial.backgroundImageUrl} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-300 py-10 px-4">
                        <p>No testimonials found...</p>
                        {filterRating > 0 && (
                            <button onClick={() => setFilterRating(0)} className="mt-4 text-indigo-400 hover:text-indigo-300 hover:underline text-sm">Show all reviews</button>
                        )}
                    </div>
                )}

                <div className="mt-12 md:mt-16 text-center">
                    {visibleCount < filteredTestimonials.length && (
                        <button onClick={handleLoadMore} type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Load More Reviews ({filteredTestimonials.length - visibleCount} remaining)
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;