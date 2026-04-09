import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowLeft, Loader, AlertCircle, CheckCircle, ChefHat, Clock, Star, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Note: Ensure your .env has VITE_SOCKET_URL if needed
const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);

const OrderStatusPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/orders/token/${id}`);
                setOrder(res.data);
                if (res.data.status === 'Completed' || res.data.status === 'Cancelled') {
                    localStorage.removeItem('activeOrderToken');
                    if (res.data.status === 'Cancelled') {
                        setTimeout(() => navigate('/'), 5000);
                    }
                }
                setError('');
            } catch (err) {
                console.error("Error fetching order:", err);
                setError('Order not found or server error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        const handleUpdate = () => {
            fetchOrder();
        };

        socket.on('orderStatusUpdate', handleUpdate);
        return () => {
            socket.off('orderStatusUpdate', handleUpdate);
        };
    }, [id, navigate]);

    // Trigger confetti on Ready
    useEffect(() => {
        if (order?.status === 'Ready') {
            const end = Date.now() + 3 * 1000;
            const colors = ['#10b981', '#34d399', '#fcd34d', '#f43f5e'];

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [order?.status]);

    const handleFeedbackSubmit = async () => {
        if (rating === 0) return;
        setSubmittingFeedback(true);
        try {
            await axios.post(`/api/orders/${order._id}/feedback`, { rating, comment });
            setFeedbackSubmitted(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            console.error("Error submitting feedback:", err);
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center gap-6">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-primary-100 border-t-primary-600 rounded-full" />
            </motion.div>
            <p className="font-black text-secondary-900 uppercase tracking-[0.3em] text-xs">Finding Your Order...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-red-50 p-8 rounded-[2rem] mb-8 text-red-500 shadow-xl shadow-red-200/50">
                <AlertCircle size={64} />
            </motion.div>
            <h1 className="text-3xl font-black text-secondary-900 mb-4 tracking-tighter">{error}</h1>
            <p className="text-secondary-500 font-medium mb-10">Check your token or try ordering again.</p>
            <Link to="/" className="bg-secondary-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-wider hover:bg-black transition-all shadow-glow">
                Back to Menu
            </Link>
        </div>
    );

    const isReady = order.status === 'Ready';
    const isCompleted = order.status === 'Completed';
    const isCancelled = order.status === 'Cancelled';
    const isPreparing = order.status === 'Preparing';
    const isPlaced = order.status === 'Placed';

    const statusConfig = {
        'Placed': { color: 'primary', label: 'In Queue', icon: Clock },
        'Preparing': { color: 'yellow', label: 'Cooking', icon: ChefHat },
        'Ready': { color: 'emerald', label: 'Pick Up!', icon: CheckCircle },
        'Completed': { color: 'secondary', label: 'Enjoy!', icon: CheckCircle },
        'Cancelled': { color: 'red', label: 'Issue', icon: AlertCircle }
    };

    const config = statusConfig[order.status] || statusConfig['Placed'];

    // For simplicity, defining explicit tailwind classes based on state
    const bgMap = { primary: 'bg-primary-500', yellow: 'bg-amber-500', emerald: 'bg-emerald-500', secondary: 'bg-secondary-500', red: 'bg-red-500' };
    const textMap = { primary: 'text-primary-600', yellow: 'text-amber-600', emerald: 'text-emerald-600', secondary: 'text-secondary-600', red: 'text-red-600' };
    const shadowMap = { primary: 'shadow-primary-500/40', yellow: 'shadow-amber-500/40', emerald: 'shadow-emerald-500/40', secondary: 'shadow-secondary-500/40', red: 'shadow-red-500/40' };
    
    // Calculate progress width
    const progressWidth = isPlaced ? '10%' : isPreparing ? '50%' : isReady || isCompleted ? '100%' : '100%';

    return (
        <div className="min-h-screen bg-app transition-colors duration-500 flex flex-col items-center p-6 pt-24 font-sans overflow-x-hidden relative selection:bg-primary-500 selection:text-white">
            <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 glassmorphism border-b border-secondary-100/30">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-secondary-900 group-hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-black text-secondary-900 tracking-tighter text-xl">Canteen<span className="text-primary-600">Pro</span></span>
                </Link>
                <div className="bg-white/80 px-4 py-2 rounded-2xl shadow-sm border border-secondary-100 text-xs font-black uppercase text-secondary-400">
                    Live Status
                </div>
            </header>

            <main className="max-w-md w-full relative z-10 space-y-8">
                {/* Status Hero */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center pt-4">
                    <h1 className="text-7xl font-black text-secondary-900 tracking-tighter mb-4">#{order.tokenNumber}</h1>
                    <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-secondary-100">
                        <div className={`w-2.5 h-2.5 rounded-full ${bgMap[config.color]} animate-pulse`} />
                        <span className={`font-black uppercase tracking-wider text-sm ${textMap[config.color]}`}>{config.label}</span>
                    </div>
                </motion.div>

                {/* Animated Status Card */}
                <motion.div 
                    layout
                    className={`bg-white p-8 rounded-[3rem] shadow-2xl ${shadowMap[config.color]} relative overflow-hidden ring-1 ring-secondary-100`}
                >
                    <div className="relative z-10 text-center mb-8">
                        <motion.div 
                            key={order.status}
                            initial={{ scale: 0, rotate: -45 }} 
                            animate={{ scale: 1, rotate: 0 }} 
                            transition={{ type: "spring" }}
                            className={`mx-auto w-24 h-24 rounded-3xl ${bgMap[config.color]} bg-opacity-10 flex items-center justify-center mb-6`}
                        >
                            <config.icon size={48} className={textMap[config.color]} />
                        </motion.div>
                        <h2 className={`text-4xl font-black ${textMap[config.color]} tracking-tighter mb-3`}>
                            {isPlaced ? "Order Received" : config.label}
                        </h2>
                        <p className="text-secondary-500 font-medium">
                            {isReady ? "Your meal is hot and waiting!" : "We're working closely on it."}
                        </p>
                    </div>

                    <div className="bg-secondary-50/50 rounded-3xl p-5 mb-8 border border-secondary-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-secondary-400">Items</span>
                            <span className="font-black text-secondary-900">{order.items.reduce((acc, item) => acc + item.quantity, 0)} Total</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-secondary-400">Total Price</span>
                            <span className="font-black text-secondary-900 text-xl tracking-tight">₹{order.totalAmount}</span>
                        </div>
                    </div>

                    {/* Glowing Stepper Progress */}
                    <div className="relative pt-4 px-2">
                        <div className="absolute top-8 left-6 right-6 h-1.5 bg-secondary-100 rounded-full" />
                        <motion.div 
                            className="absolute top-8 left-6 h-1.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: progressWidth }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />

                        <div className="flex justify-between relative z-10">
                            {[
                                { status: 'Placed', label: 'Placed', icon: Clock },
                                { status: 'Preparing', label: 'Cooking', icon: ChefHat },
                                { status: 'Ready', label: 'Ready', icon: CheckCircle }
                            ].map((step) => {
                                const isPassed = (step.status === 'Placed') || 
                                    (step.status === 'Preparing' && (order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Completed')) ||
                                    (step.status === 'Ready' && (order.status === 'Ready' || order.status === 'Completed'));
                                const isCurrent = order.status === step.status;

                                return (
                                    <div key={step.status} className="flex flex-col items-center gap-3">
                                        <motion.div 
                                            animate={isCurrent ? { scale: 1.2 } : { scale: 1 }}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm
                                                ${isPassed ? 'bg-primary-600 text-white shadow-primary-500/50' : 'bg-white border-2 border-secondary-100 text-secondary-300'}`}
                                        >
                                            <step.icon size={18} strokeWidth={isPassed ? 3 : 2} />
                                        </motion.div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isPassed ? 'text-primary-600' : 'text-secondary-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Queue Display Module */}
                <AnimatePresence>
                    {(isPlaced || isPreparing) && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-secondary-900 p-6 rounded-[3rem] shadow-xl shadow-secondary-900/30 text-white relative overflow-hidden flex flex-col gap-4"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-[50px]" />
                            
                            <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 mb-1">Queue Status</span>
                                    <span className="text-secondary-100 font-medium text-sm">People ahead of you</span>
                                </div>
                                <div className="text-5xl font-black tracking-tighter text-white drop-shadow-md">
                                    {Math.max(0, order.queuePosition - 1)}
                                </div>
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-1">Est. Time</span>
                                    <span className="text-secondary-100 font-medium text-sm">To get your order</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-5xl font-black tracking-tighter text-primary-400 drop-shadow-md">
                                        {order.estimatedTime || 5}
                                    </span>
                                    <span className="text-lg font-bold text-primary-400/80 mb-2">min</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Full Screen Ready Overlay */}
                <AnimatePresence>
                    {isReady && !isCompleted && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="fixed inset-0 z-50 bg-emerald-500 flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
                            <div className="relative z-10 text-center p-8 bg-white max-w-sm w-[90%] rounded-[3rem] shadow-2xl">
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="mx-auto w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={48} strokeWidth={3} />
                                </motion.div>
                                <h1 className="text-4xl font-black text-secondary-900 tracking-tighter mb-2">It's Ready!</h1>
                                <p className="text-secondary-500 font-medium mb-8">Please proceed to the pickup counter and present your token.</p>
                                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 mb-8">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Token Number</p>
                                    <p className="text-7xl font-black text-emerald-600 tracking-tighter">#{order.tokenNumber}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-secondary-900 text-white w-full py-5 rounded-[2rem] font-black uppercase tracking-wider shadow-xl shadow-secondary-900/20 active:scale-95 transition-transform"
                                >
                                    Finish & Home
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feedback System */}
                <AnimatePresence>
                    {isCompleted && !order.feedback && !feedbackSubmitted && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-[3rem] shadow-xl border border-secondary-100 mb-8"
                        >
                            <div className="text-center">
                                <h2 className="text-3xl font-black text-secondary-900 tracking-tighter mb-2">Rate your meal</h2>
                                <p className="text-secondary-500 font-medium mb-8">Help us improve the CanteenPro experience</p>

                                <div className="flex justify-center gap-3 mb-8">
                                    {[1,2,3,4,5].map((index) => (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            key={index}
                                            className="transition-colors"
                                            onClick={() => setRating(index)}
                                            onMouseEnter={() => setHover(index)}
                                            onMouseLeave={() => setHover(rating)}
                                        >
                                            <Star size={44} className={index <= (hover || rating) ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-secondary-200'} />
                                        </motion.button>
                                    ))}
                                </div>

                                <textarea
                                    className="w-full bg-secondary-50 border border-secondary-100 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all mb-6 resize-none"
                                    rows="3"
                                    placeholder="Tell us more about your experience (optional)..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />

                                <div className="space-y-3">
                                    <button
                                        onClick={handleFeedbackSubmit}
                                        disabled={rating === 0 || submittingFeedback}
                                        className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest transition-all ${rating === 0
                                            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-glow active:scale-95'
                                        }`}
                                    >
                                        {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full py-3 text-secondary-400 font-bold uppercase tracking-wider hover:text-secondary-900 transition-colors text-xs"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
};

export default OrderStatusPage;
