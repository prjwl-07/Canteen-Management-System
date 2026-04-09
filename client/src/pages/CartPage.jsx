import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Wallet } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, walletBalance, payFromWallet, addMoney } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const placeOrder = async () => {
        if (cart.length === 0) return;

        // Wallet Validation
        if (walletBalance < cartTotal) {
            toast.error("Insufficient wallet balance!");
            return;
        }

        setIsPlacingOrder(true);
        try {
            // Deduct from wallet first
            const paymentSuccess = payFromWallet(cartTotal);
            if (!paymentSuccess) {
                throw new Error("Payment failed");
            }

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

            toast.success("Order Placed Successfully!");

            setTimeout(() => {
                clearCart();
                const order = res.data;
                if (order && order.tokenNumber) {
                    localStorage.setItem('activeOrderToken', order.tokenNumber);
                    navigate(`/order/${order.tokenNumber}`, { state: { order } });
                } else {
                    console.error("Order created but no token returned:", order);
                    toast.error("Order created but token missing");
                    navigate('/');
                }
            }, 1000);

        } catch (err) {
            console.error("Order placement failed:", err);
            toast.error("Failed to place order. See console.");
            // Ideally revert wallet deduction here if API call fails, but keeping it simple for now (or move deduction after API success)
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-app flex flex-col font-sans transition-colors duration-500 relative overflow-x-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-[100px] opacity-20 pointer-events-none" />

            <Toaster position="top-center" />

            <header className="bg-app/80 backdrop-blur-md px-6 py-8 sticky top-0 z-30 flex items-center justify-between border-b border-secondary-100/50">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-secondary-900 group-hover:text-white transition-all transform group-active:scale-95">
                        <ArrowLeft size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-secondary-900 tracking-tighter">Your <span className="text-primary-600">Cart</span></h1>
                </Link>
                <div className="bg-white/80 px-4 py-2 rounded-2xl border border-secondary-100 shadow-sm flex items-center gap-2">
                    <ShoppingBag size={14} className="text-primary-600" />
                    <span className="text-xs font-black text-secondary-900">{cart.length} Items</span>
                </div>
            </header>

            <div className="flex-1 p-6 pb-64 max-w-2xl mx-auto w-full relative z-10">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-secondary-200/50 border border-secondary-100 mb-10 group">
                            <ShoppingBag size={72} className="text-secondary-100 group-hover:text-primary-200 transition-colors duration-500" />
                        </div>
                        <h2 className="text-4xl font-black text-secondary-900 mb-3 tracking-tighter">Empty Cart!</h2>
                        <p className="text-secondary-400 font-medium mb-12 max-w-xs leading-relaxed text-sm uppercase tracking-widest">Your food journey starts with a single click.</p>
                        <Link to="/" className="bg-secondary-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-2xl shadow-secondary-200 transform hover:-translate-y-1 active:scale-95">
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.3em] mb-6 ml-2">Review your selection</p>
                        {cart.map(item => (
                            <div key={item._id} className="flex items-center gap-4 bg-white p-5 rounded-[2.5rem] shadow-sm border border-secondary-50 hover:shadow-xl hover:translate-x-1 transition-all duration-300 group">
                                <div className="h-24 w-24 bg-secondary-50 rounded-[2rem] overflow-hidden flex-shrink-0 border border-secondary-100 group-hover:scale-105 transition-transform">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-secondary-200"><ShoppingBag size={32} /></div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-black text-secondary-900 text-lg mb-0.5 tracking-tight">{item.name}</h3>
                                    <p className="text-primary-600 font-bold text-sm">₹{item.price}</p>
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 bg-secondary-50 rounded-2xl p-1.5 border border-secondary-100">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="p-2.5 bg-white rounded-xl shadow-sm text-secondary-400 hover:text-secondary-900 transition-colors active:scale-90"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="font-black text-secondary-900 w-8 text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="p-2.5 bg-white rounded-xl shadow-sm text-secondary-400 hover:text-secondary-900 transition-colors active:scale-90"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-secondary-200 hover:text-red-500 transition-colors p-2 text-xs font-bold uppercase tracking-widest"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-6 z-40 lg:pb-10">
                    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-2xl border border-white p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col gap-6">
                        {/* Wallet Section */}
                        <div className="bg-secondary-900/5 p-5 rounded-[2rem] flex justify-between items-center border border-secondary-100 group">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-0.5">Wallet Balance</p>
                                    <p className="text-2xl font-black text-secondary-900">₹{walletBalance}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => addMoney(500)}
                                className="text-[10px] font-black text-primary-600 bg-white px-5 py-3 rounded-xl border border-primary-100 hover:bg-primary-50 transition-all active:scale-95 uppercase tracking-widest shadow-sm"
                            >
                                Recharge ₹500
                            </button>
                        </div>

                        <div className="flex justify-between items-end px-2">
                            <div>
                                <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.3em] mb-1">Total Payable</p>
                                <span className="text-5xl font-black text-secondary-900 tracking-tighter">₹{cartTotal}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Verified Secure</span>
                            </div>
                        </div>

                        <button
                            onClick={placeOrder}
                            disabled={isPlacingOrder || walletBalance < cartTotal}
                            className={`w-full py-6 rounded-[2rem] text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-2xl transform active:scale-[0.98]
                                ${walletBalance < cartTotal
                                    ? 'bg-secondary-100 text-secondary-300 cursor-not-allowed shadow-none border border-secondary-200'
                                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200 hover:shadow-primary-300'
                                }`}
                        >
                            {isPlacingOrder ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : walletBalance < cartTotal ? (
                                <>Insufficient Funds</>
                            ) : (
                                <>
                                    <CreditCard size={22} />
                                    <span>Confirm Purchase</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
