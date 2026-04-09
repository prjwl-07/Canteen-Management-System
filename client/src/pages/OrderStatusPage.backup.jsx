import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowLeft, Loader, AlertCircle, CheckCircle, ChefHat, Clock } from 'lucide-react';

import ThemeSwitcher from '../components/ThemeSwitcher';

const socket = io();

const OrderStatusPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/orders/token/${id}`);
                setOrder(res.data);
                if (res.data.status === 'Completed' || res.data.status === 'Cancelled') {
                    localStorage.removeItem('activeOrderToken');
                    if (res.data.status === 'Completed') {
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

        const handleUpdate = (updatedOrder) => {
            if (updatedOrder._id === order?._id || updatedOrder.tokenNumber === id) {
                setOrder(updatedOrder);
                if (updatedOrder.status === 'Completed' || updatedOrder.status === 'Cancelled') {
                    localStorage.removeItem('activeOrderToken');
                    if (updatedOrder.status === 'Completed') {
                        // Auto-redirect to home after 3 seconds
                        setTimeout(() => {
                            navigate('/');
                        }, 3000);
                    }
                }
            } else {
                fetchOrder(); // Fallback refetch
            }
        };

        socket.on('orderStatusUpdate', handleUpdate);
        return () => {
            socket.off('orderStatusUpdate', handleUpdate);
        };
    }, [id, navigate, order?._id]);

    if (loading) return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center gap-4 transition-colors duration-500">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-ping" />
                </div>
            </div>
            <p className="font-black text-secondary-900 uppercase tracking-[0.3em] text-xs">Finding Order...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
            <div className="bg-red-100 p-8 rounded-full mb-8 text-red-500 shadow-xl shadow-red-200/50">
                <AlertCircle size={64} />
            </div>
            <h1 className="text-3xl font-black text-secondary-900 mb-3 tracking-tighter">{error}</h1>
            <p className="text-secondary-500 font-medium mb-10 max-w-xs leading-relaxed">Please check your token or try again from the menu.</p>
            <Link to="/" className="bg-secondary-900 text-white px-10 py-4 rounded-2xl text-lg font-black uppercase tracking-wider hover:bg-black transition-all shadow-xl shadow-secondary-200">
                Back to Menu
            </Link>
        </div>
    );

    const isReady = order.status === 'Ready';
    const isCompleted = order.status === 'Completed';
    const isCancelled = order.status === 'Cancelled';
    const isPreparing = order.status === 'Preparing';
    const isPlaced = order.status === 'Placed';

    // Status mapping for colors and icons
    const statusConfig = {
        'Placed': { color: 'primary', label: 'In Queue', icon: Clock },
        'Preparing': { color: 'yellow', label: 'Cooking', icon: ChefHat },
        'Ready': { color: 'emerald', label: 'Pick Up!', icon: CheckCircle },
        'Completed': { color: 'secondary', label: 'Enjoy!', icon: CheckCircle },
        'Cancelled': { color: 'red', label: 'Issue', icon: AlertCircle }
    };

    const config = statusConfig[order.status] || statusConfig['Placed'];

    // Static style mapping for Tailwind JIT compatibility
    const colorStyles = {
        primary: {
            glow: 'shadow-primary-500/40',
            border: 'border-primary-200',
            ring: 'ring-primary-100',
            text: 'text-primary-600',
            bg: 'bg-primary-500',
            bgLight: 'bg-primary-50',
            iconRing: 'ring-primary-50/50'
        },
        yellow: {
            glow: 'shadow-yellow-500/40',
            border: 'border-yellow-200',
            ring: 'ring-yellow-100',
            text: 'text-yellow-600',
            bg: 'bg-yellow-500',
            bgLight: 'bg-yellow-50',
            iconRing: 'ring-yellow-50/50'
        },
        emerald: {
            glow: 'shadow-emerald-500/40',
            border: 'border-emerald-200',
            ring: 'ring-emerald-100',
            text: 'text-emerald-600',
            bg: 'bg-emerald-500',
            bgLight: 'bg-emerald-50',
            iconRing: 'ring-emerald-50/50'
        },
        secondary: {
            glow: 'shadow-secondary-500/40',
            border: 'border-secondary-200',
            ring: 'ring-secondary-100',
            text: 'text-secondary-600',
            bg: 'bg-secondary-500',
            bgLight: 'bg-secondary-50',
            iconRing: 'ring-secondary-50/50'
        },
        red: {
            glow: 'shadow-red-500/40',
            border: 'border-red-200',
            ring: 'ring-red-100',
            text: 'text-red-600',
            bg: 'bg-red-500',
            bgLight: 'bg-red-50',
            iconRing: 'ring-red-50/50'
        }
    };

    const styles = colorStyles[config.color] || colorStyles.primary;

    return (
        <div className="min-h-screen bg-app transition-colors duration-500 flex flex-col items-center p-6 pt-24 font-sans overflow-x-hidden relative">
            {/* Background Texture/Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-20 -left-20 w-80 h-80 bg-primary-400 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary-400 rounded-full blur-[120px]" />
            </div>

            <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 backdrop-blur-md bg-app/60 border-b border-secondary-100/30">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-secondary-900 group-hover:text-white transition-all">
                        <ArrowLeft size={22} />
                    </div>
                    <span className="font-black text-secondary-900 tracking-tighter text-lg">Canteen<span className="text-primary-600">Go</span></span>
                </Link>
                <div className="bg-white/80 p-2 rounded-2xl shadow-sm border border-secondary-100 flex items-center gap-3">
                    <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-3 hidden md:inline">Theme</span>
                    <ThemeSwitcher />
                </div>
            </header>

            <main className="max-w-md w-full relative z-10">
                {/* Status Hero */}
                <div className="text-center mb-10">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-secondary-400 block mb-6 px-4 py-1.5 bg-white rounded-full border border-secondary-100 w-fit mx-auto shadow-sm">
                        Live Tracking
                    </span>
                    <h1 className="text-8xl font-black text-secondary-900 tracking-tighter mb-2 leading-none">
                        #{order.tokenNumber}
                    </h1>
                    <p className="text-secondary-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-ping ${styles.bg}`} />
                        Status: <span className={styles.text}>{config.label}</span>
                    </p>
                </div>

                {/* Status Card */}
                <div className={`bg-white p-8 rounded-[2.5rem] shadow-2xl ${styles.glow} border-4 ${styles.border} relative overflow-hidden group mb-8 transition-all duration-500 scale-100 hover:scale-[1.02] ring-8 ${styles.ring}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-50 rounded-bl-[5rem] -mr-10 -mt-10 transition-all group-hover:scale-110" />

                    <div className="relative text-center">
                        <div className="mb-6">
                            <div className={`mx-auto w-20 h-20 rounded-full ${styles.bgLight} flex items-center justify-center mb-4 ring-8 ${styles.iconRing}`}>
                                <config.icon size={40} className={styles.text} />
                            </div>
                            <h2 className={`text-4xl font-black ${styles.text} tracking-tighter leading-none mb-2 drop-shadow-sm`}>
                                {isPlaced ? "Order Placed" : config.label}
                            </h2>
                            <p className="text-secondary-500 font-medium px-4">
                                {isReady ? "Please collect your food at the counter." : "Sit back and relax. We'll notify you when it's ready."}
                            </p>
                        </div>

                        {/* Order Details Summary */}
                        <div className="bg-secondary-50/50 rounded-2xl p-4 mb-6 border border-secondary-100">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-secondary-500 font-bold">Order ID</span>
                                <span className="text-secondary-900 font-black tracking-wider">#{order._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary-500 font-bold">Total Items</span>
                                <span className="text-secondary-900 font-black">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Stepper Tracker */}
                    <div className="mt-8 pt-8 border-t border-secondary-50">
                        <div className="flex justify-between items-center mb-6 px-2 relative">
                            {/* Connecting Line */}
                            <div className="absolute top-5 left-4 right-4 h-1 bg-secondary-100 rounded-full -z-10" />
                            <div
                                className="absolute top-5 left-4 h-1 bg-primary-500 rounded-full -z-10 transition-all duration-1000 ease-out"
                                style={{
                                    width: isPlaced ? '0%' : isPreparing ? '50%' : isReady ? '100%' : '100%'
                                }}
                            />

                            {[
                                { status: 'Placed', label: 'Ordered', icon: Clock },
                                { status: 'Preparing', label: 'Cooking', icon: ChefHat },
                                { status: 'Ready', label: 'Ready', icon: CheckCircle }
                            ].map((step, idx) => {
                                const isActive = order.status === step.status ||
                                    (order.status === 'Preparing' && step.status === 'Placed') ||
                                    (order.status === 'Ready' && (step.status === 'Placed' || step.status === 'Preparing')) ||
                                    (order.status === 'Completed');

                                const isCurrent = order.status === step.status;

                                return (
                                    <div key={step.status} className="flex flex-col items-center gap-2">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${isActive
                                                    ? 'bg-primary-600 border-primary-100 text-white shadow-lg shadow-primary-200'
                                                    : 'bg-white border-secondary-100 text-secondary-300'
                                                } ${isCurrent ? 'scale-125 ring-4 ring-primary-50 ring-offset-2' : ''}`}
                                        >
                                            <step.icon size={16} strokeWidth={3} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-primary-600' : 'text-secondary-300'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Celebration / Ready Full Screen Alert */}
                {isReady && (
                    <div className="fixed inset-0 z-50 bg-emerald-500 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px] animate-pulse" />
                        </div>

                        <div className="relative z-10 text-center p-8">
                            <div className="mb-8 inline-flex p-6 bg-white rounded-full shadow-2xl animate-bounce">
                                <CheckCircle size={64} className="text-emerald-500" />
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter mb-4 drop-shadow-xl">
                                Order Ready!
                            </h1>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/30">
                                <p className="text-xl font-bold mb-2 opacity-90">Token Number</p>
                                <p className="text-8xl font-black tracking-tighter">#{order.tokenNumber}</p>
                            </div>
                            <p className="text-lg font-medium opacity-90 max-w-md mx-auto mb-12">
                                Please proceed to the counter to collect your delicious meal!
                            </p>

                            <button
                                onClick={() => navigate('/')}
                                className="bg-white text-emerald-600 px-12 py-4 rounded-2xl font-black uppercase tracking-wider shadow-xl hover:scale-105 transition-transform"
                            >
                                Got it, Thanks!
                            </button>
                        </div>
                    </div>
                )}

                {/* Queue Position (Only if Placed) */}
                {isPlaced && (
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-[2.5rem] shadow-2xl shadow-primary-900/30 flex flex-col items-center justify-center text-white overflow-hidden relative border-4 border-white/20 transform transition-transform hover:scale-[1.02]">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-200 mb-4 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                                Live Queue Status
                            </h3>

                            <div className="flex items-baseline justify-center gap-2 mb-2">
                                <span className="text-8xl font-black tracking-tighter drop-shadow-lg">
                                    {Math.max(0, order.queuePosition - 1)}
                                </span>
                                <span className="text-2xl font-bold text-primary-200 uppercase tracking-widest">
                                    People Ahead
                                </span>
                            </div>

                            <div className="mt-4 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/30 shadow-lg">
                                {order.queuePosition - 1 <= 0 ? (
                                    <>
                                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                                        <span className="font-black tracking-wider text-sm">You are next! Get ready!</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                                        <span className="font-bold tracking-wide text-sm">Estimated wait: ~{(order.queuePosition - 1) * 5} mins</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Readiness CTA */}
                {isReady && (
                    <div className="bg-emerald-500 p-6 rounded-[2rem] shadow-xl shadow-emerald-200 text-center text-white animate-pulse">
                        <h3 className="text-xl font-black uppercase tracking-wider">Fast Service! ⚡️</h3>
                        <p className="text-sm font-medium opacity-90 underline decoration-2 underline-offset-4">Collect it while it's hot!</p>
                    </div>
                )}
            </main>

            <footer className="mt-12 text-center pb-12">
                <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Powered by Smart Canteen Stack</p>
            </footer>
        </div>
    );
};

export default OrderStatusPage;
