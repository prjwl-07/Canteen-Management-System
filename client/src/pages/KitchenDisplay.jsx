import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Clock, ChefHat, CheckCircle, Flame, GripVertical } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);

const KitchenDisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        socket.on('newOrder', (order) => {
            setOrders(prev => [...prev, order]);
            toast.custom((t) => (
                <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-xl animate-pulse"><Flame size={28} /></div>
                    <div>
                        <h1 className="text-xl font-black">NEW TICKET #{order.tokenNumber}</h1>
                        <p className="font-bold text-sm bg-black/20 inline-block px-2 py-0.5 rounded-lg mt-1">{order.items.length} Items</p>
                    </div>
                </motion.div>
            ), { duration: 4000 });
        });

        socket.on('orderStatusUpdate', (updatedOrder) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        });

        return () => {
            socket.off('newOrder');
            socket.off('orderStatusUpdate');
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Connection Error");
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    // Assuming Placed immediately becomes Preparing in KDS flow, or we just map everything not Ready to Incoming.
    // For Kanban logic:
    const incomingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Preparing');
    const readyOrders = orders.filter(o => o.status === 'Ready');

    if (loading) return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
            <ChefHat size={64} className="animate-bounce mb-4 text-neutral-500" />
            <p className="font-black text-xl tracking-[0.5em] text-neutral-600">KDS BOOTING</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 font-sans overflow-x-hidden selection:bg-neutral-800">
            <Toaster position="top-center" />

            {/* Header */}
            <header className="flex justify-between items-center mb-8 bg-neutral-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-neutral-800 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="bg-gradient-to-br from-neutral-700 to-neutral-800 p-4 rounded-2xl shadow-inner border border-neutral-700">
                        <ChefHat size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white">Station KDS</h1>
                        <p className="text-neutral-500 font-black uppercase tracking-[0.3em] text-xs flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Sync
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 px-6 py-3 rounded-2xl text-center shadow-inner">
                        <span className="block text-3xl font-black text-amber-500">{incomingOrders.length}</span>
                        <span className="text-[10px] uppercase tracking-widest font-black text-neutral-500">Cooking</span>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 px-6 py-3 rounded-2xl text-center shadow-inner">
                        <span className="block text-3xl font-black text-emerald-500">{readyOrders.length}</span>
                        <span className="text-[10px] uppercase tracking-widest font-black text-neutral-500">Ready</span>
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-160px)]">
                
                {/* Incoming / Cooking Column */}
                <div className="bg-neutral-900/40 rounded-[2.5rem] p-6 border border-neutral-800/80 overflow-y-auto flex flex-col relative custom-scrollbar">
                    <div className="sticky top-0 bg-neutral-950/80 backdrop-blur-xl p-4 rounded-2xl z-10 border border-neutral-800 mb-6 flex items-center justify-between shadow-2xl">
                        <h2 className="text-lg font-black text-amber-500 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> Cooking
                        </h2>
                        <span className="bg-neutral-800 px-3 py-1 rounded-lg text-xs font-black text-neutral-400">TICKETS</span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {incomingOrders.map((order, idx) => {
                                const waitSecs = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
                                const isDelayed = waitSecs > 600; // >10 mins = delayed

                                return (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={order._id} 
                                        className={`p-6 rounded-[2rem] border relative overflow-hidden flex flex-col shadow-2xl transition-all duration-300
                                            ${isDelayed ? 'bg-[#1a0f12] border-red-900/50' : 'bg-neutral-900/80 border-neutral-800'}`}
                                    >
                                        {isDelayed && (
                                            <div className="absolute top-0 right-0 left-0 h-1 flex">
                                                <div className="w-full bg-red-600 animate-pulse" />
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="text-neutral-600"><GripVertical size={20} /></div>
                                                <span className={`text-4xl font-black tracking-tighter ${isDelayed ? 'text-red-500' : 'text-white'}`}>#{order.tokenNumber}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-800/50 text-neutral-400 px-3 py-1.5 rounded-lg border border-neutral-700/50">
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isDelayed && <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-2 flex items-center gap-1"><Flame size={12}/> Delayed</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-8 bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800/50 flex-1">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-lg font-bold text-neutral-300 pb-2 border-b border-neutral-800/50 last:border-0 last:pb-0">
                                                    <span>{item.name}</span>
                                                    <span className="bg-neutral-800 text-white w-8 h-8 flex items-center justify-center rounded-xl text-sm border border-neutral-700 shadow-inner">{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => updateStatus(order._id, 'Ready')}
                                            className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 border border-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] group active:scale-95"
                                        >
                                            <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> Mark Ready
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {incomingOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-neutral-600 opacity-50">
                                <CheckCircle size={48} className="mb-4" />
                                <p className="font-black uppercase tracking-widest">Queue Clear</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ready Column */}
                <div className="bg-neutral-900/40 rounded-[2.5rem] p-6 border border-neutral-800/80 overflow-y-auto flex flex-col relative custom-scrollbar">
                    <div className="sticky top-0 bg-neutral-950/80 backdrop-blur-xl p-4 rounded-2xl z-10 border border-neutral-800 mb-6 flex items-center justify-between shadow-2xl">
                        <h2 className="text-lg font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Awaiting Pickup
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {readyOrders.map(order => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={order._id} 
                                    className="bg-neutral-900 border border-emerald-900/30 p-6 rounded-[2rem] relative overflow-hidden flex flex-col shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[5rem] -mr-10 -mt-10 pointer-events-none" />

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <span className="text-5xl font-black tracking-tighter text-emerald-400">#{order.tokenNumber}</span>
                                        <CheckCircle className="text-emerald-500/20" size={48} />
                                    </div>

                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
                                        <Clock size={12} /> Ready since {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    <button
                                        onClick={() => updateStatus(order._id, 'Completed')}
                                        className="w-full bg-neutral-950 text-neutral-400 hover:text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg flex items-center justify-center border border-neutral-800 active:scale-95"
                                    >
                                        Handed to Customer
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {readyOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-neutral-600 opacity-50">
                                <Clock size={48} className="mb-4" />
                                <p className="font-black uppercase tracking-widest">No orders waiting</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default KitchenDisplay;
