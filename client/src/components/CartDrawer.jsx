import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Wallet, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, walletBalance, payFromWallet, addMoney } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const placeOrder = async () => {
        if (cart.length === 0) return;
        if (walletBalance < cartTotal) {
            toast.error("Insufficient wallet balance!");
            return;
        }

        setIsPlacingOrder(true);
        try {
            const paymentSuccess = payFromWallet(cartTotal);
            if (!paymentSuccess) throw new Error("Payment failed");

            const orderData = {
                items: cart.map(item => ({
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: cartTotal,
                userId: user ? user._id : undefined
            };

            const res = await axios.post('/api/orders', orderData);
            toast.success("Order Placed Successfully!", { style: { background: '#10b981', color: '#fff' } });

            setTimeout(() => {
                clearCart();
                onClose();
                const order = res.data;
                if (order && order.tokenNumber) {
                    localStorage.setItem('activeOrderToken', order.tokenNumber);
                    navigate(`/order/${order.tokenNumber}`, { state: { order } });
                } else {
                    toast.error("Order created but token missing");
                }
            }, 1000);
        } catch (err) {
            console.error("Order placement failed:", err);
            toast.error("Failed to place order. See console.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-secondary-100"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-secondary-50">
                            <h2 className="text-2xl font-black text-secondary-900 flex items-center gap-2">
                                <ShoppingBag className="text-primary-600" />
                                Your Order
                            </h2>
                            <button onClick={onClose} className="p-2 bg-secondary-50 text-secondary-500 rounded-full hover:bg-secondary-100 hover:text-secondary-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <ShoppingBag size={80} className="mb-4 text-secondary-300" />
                                    <p className="text-lg font-bold text-secondary-600">Your cart is empty.</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={item._id} className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-secondary-100">
                                        <div className="h-16 w-16 bg-secondary-50 rounded-2xl overflow-hidden flex-shrink-0">
                                            {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-secondary-100 block" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-secondary-900 leading-tight">{item.name}</h3>
                                            <p className="text-primary-600 font-bold text-sm">₹{item.price}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-secondary-50 rounded-xl p-1 border border-secondary-100">
                                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 bg-white rounded-lg shadow-sm text-secondary-500 active:scale-90"><Minus size={14} /></button>
                                                <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 bg-white rounded-lg shadow-sm text-secondary-500 active:scale-90"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 bg-white border-t border-secondary-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                                <div className="bg-secondary-50 p-4 rounded-3xl flex justify-between items-center mb-6 border border-secondary-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 p-3 rounded-xl text-white shadow-md shadow-emerald-200">
                                            <Wallet size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Wallet</p>
                                            <p className="text-xl font-black text-secondary-900">₹{walletBalance}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => addMoney(500)} className="text-[10px] font-black text-primary-600 bg-white px-4 py-2 rounded-lg border border-primary-100 hover:bg-primary-50 active:scale-95 uppercase shadow-sm">
                                        Add ₹500
                                    </button>
                                </div>
                                
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <span className="text-sm font-black text-secondary-400 uppercase tracking-widest">Total</span>
                                    <span className="text-4xl font-black text-secondary-900 tracking-tighter">₹{cartTotal}</span>
                                </div>

                                <button
                                    onClick={placeOrder}
                                    disabled={isPlacingOrder || walletBalance < cartTotal}
                                    className={`w-full py-5 rounded-[2rem] text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95
                                        ${walletBalance < cartTotal
                                            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed shadow-none'
                                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-glow'
                                        }`}
                                >
                                    {isPlacingOrder ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : walletBalance < cartTotal ? (
                                        "Insufficient Funds"
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            Checkout Now
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
