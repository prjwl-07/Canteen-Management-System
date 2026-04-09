import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Plus, Loader, Search, Coffee, Utensils, Sandwich, Clock, Sparkles, Flame, RotateCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CartDrawer from '../components/CartDrawer';

const MenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeOrderToken, setActiveOrderToken] = useState(null);
    const [recommendations, setRecommendations] = useState({ popularItems: [], frequentItems: [], newArrivals: [] });
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { addToCart, cart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const endpoint = user ? `/api/menu/recommendations?userId=${user._id}` : '/api/menu/recommendations';
                const res = await axios.get(endpoint);
                setRecommendations(res.data);
            } catch (err) {
                console.error("Error fetching recommendations:", err);
            }
        };
        fetchRecommendations();
    }, [user]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get('/api/menu');
                setMenuItems(res.data);
                setFilteredItems(res.data);
            } catch (err) {
                console.error("Error fetching menu:", err);
                toast.error("Failed to load menu");
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();

        const token = localStorage.getItem('activeOrderToken');
        if (token) setActiveOrderToken(token);
    }, []);

    useEffect(() => {
        let items = menuItems;
        if (activeCategory !== 'All') {
            items = items.filter(item => item.category === activeCategory);
        }
        if (searchQuery) {
            items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        setFilteredItems(items);
    }, [activeCategory, searchQuery, menuItems]);

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(`${item.name} added!`, {
            style: { borderRadius: '12px', background: '#334155', color: '#fff', fontWeight: 'bold' },
            iconTheme: { primary: '#10b981', secondary: '#fff' },
        });
    };

    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const categories = ['All', 'Snacks', 'Beverages', 'Meals'];
    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Snacks': return <Sandwich size={18} />;
            case 'Beverages': return <Coffee size={18} />;
            case 'Meals': return <Utensils size={18} />;
            default: return null;
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-secondary-50">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Loader size={48} className="text-primary-600" />
            </motion.div>
        </div>
    );

    const RecommendationCarousel = ({ title, icon, items, badge }) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="mb-12 w-full overflow-hidden">
                <h2 className="text-2xl font-black text-secondary-900 mb-6 flex items-center gap-3">
                    <span className={`p-2.5 rounded-2xl flex items-center justify-center shadow-lg ${badge === 'Hot' ? 'bg-red-500 text-white shadow-red-200' : badge === 'Favorite' ? 'bg-pink-500 text-white shadow-pink-200' : 'bg-purple-500 text-white shadow-purple-200'}`}>
                        {icon}
                    </span>
                    {title}
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x px-2">
                    {items.map(item => (
                        <motion.div whileHover={{ y: -5 }} key={'rec_'+item._id} className="snap-start min-w-[300px] sm:min-w-[340px] bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-shadow border border-secondary-100 flex gap-5 relative group">
                            {badge && (
                                <div className={`absolute top-0 right-6 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-b-xl shadow-md z-10 ${badge === 'Hot' ? 'bg-gradient-to-b from-red-400 to-red-600' : badge === 'Favorite' ? 'bg-gradient-to-b from-pink-400 to-pink-600' : 'bg-gradient-to-b from-purple-400 to-purple-600'}`}>
                                    {badge}
                                </div>
                            )}
                            <div className="h-28 w-28 bg-secondary-50 rounded-[2rem] flex-shrink-0 relative overflow-hidden shadow-inner">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition duration-700" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-secondary-300 text-[10px] font-bold uppercase p-2">No Img</div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="text-lg font-black text-secondary-900 leading-tight truncate group-hover:text-primary-600 transition">{item.name}</h3>
                                    <p className="text-xs text-secondary-500 line-clamp-2 mt-1.5 font-medium">{item.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xl font-black text-secondary-900">₹{item.price}</span>
                                    {item.isAvailable ? (
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="bg-secondary-900 text-white hover:bg-primary-600 p-3 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl shadow-secondary-900/20 active:scale-90 group-hover:shadow-glow"
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    ) : (
                                        <button disabled className="bg-secondary-100 text-secondary-300 p-3 rounded-2xl cursor-not-allowed">
                                            <Plus size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-app pb-24 font-sans text-secondary-900 overflow-x-hidden selection:bg-primary-500 selection:text-white">
            <Toaster position="top-center" />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Premium Header */}
            <motion.header 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 glassmorphism z-30 border-b border-white/20 shadow-sm"
            >
                <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-2.5 rounded-2xl shadow-glow">
                            <Utensils size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-secondary-900 tracking-tighter leading-none">Canteen<span className="text-primary-600">Pro</span></h1>
                            <p className="text-[9px] font-black text-secondary-400 uppercase tracking-[0.2em] mt-1">Premium Food Service</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="relative bg-secondary-900 text-white p-3.5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-secondary-900/30 active:scale-95"
                    >
                        <ShoppingCart size={20} />
                        {cartItemCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-xl border-2 border-white shadow-sm"
                            >
                                {cartItemCount}
                            </motion.span>
                        )}
                    </button>
                </div>
            </motion.header>

            {/* Hero Section */}
            <div className="relative pt-12 pb-16 px-6 max-w-6xl mx-auto">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-200/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
                
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black text-secondary-900 tracking-tighter mb-4"
                >
                    Skip the line.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">Taste the best.</span>
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-secondary-500 text-lg font-medium max-w-xl mb-10"
                >
                    Order ahead, pay with your wallet, and pick up when it's ready. Experience the new era of campus dining.
                </motion.p>

                {/* Search Bar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative group max-w-2xl">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-600 transition" size={22} />
                    <input
                        type="text"
                        placeholder="What are you craving today?"
                        className="w-full pl-16 pr-6 py-5 bg-white border border-secondary-100 rounded-[2rem] focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-lg font-medium placeholder-secondary-300 shadow-xl shadow-secondary-100/50 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </motion.div>
            </div>

            {/* Sticky Categories Grid View */}
            <div className="sticky top-[88px] z-20 py-4 glassmorphism border-y border-white/20 mb-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] whitespace-nowrap text-sm font-black transition-all duration-300 ${activeCategory === cat
                                    ? 'bg-secondary-900 text-white shadow-xl shadow-secondary-900/30 ring-2 ring-secondary-900 ring-offset-2 ring-offset-app'
                                    : 'bg-white text-secondary-600 border border-secondary-100 hover:bg-secondary-50'
                                    }`}
                            >
                                {getCategoryIcon(cat)}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Carousels */}
            {activeCategory === 'All' && !searchQuery && (
                <div className="max-w-6xl mx-auto px-6 mt-4">
                    <RecommendationCarousel title="New Arrivals" icon={<Sparkles size={18} strokeWidth={3} />} items={recommendations.newArrivals} badge="New" />
                    <RecommendationCarousel title="Trending Now" icon={<Flame size={18} strokeWidth={3} />} items={recommendations.popularItems} badge="Hot" />
                </div>
            )}

            {/* All Menu Items Grid */}
            <div className="max-w-6xl mx-auto px-6 mt-8">
                <h2 className="text-2xl font-black text-secondary-900 mb-8 tracking-tight">Our Menu</h2>
                
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredItems.map(item => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                key={item._id} 
                                className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-secondary-100 flex flex-col hover:-translate-y-2"
                            >
                                <div className="h-48 w-full bg-secondary-50 rounded-[2rem] relative overflow-hidden shadow-inner mb-5">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition duration-700" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-secondary-300 text-xs font-black uppercase tracking-widest">No Image</div>
                                    )}
                                    {!item.isAvailable && (
                                        <div className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm flex items-center justify-center">
                                            <span className="bg-white/90 text-secondary-900 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg">Sold Out</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 text-[10px] font-black uppercase tracking-widest text-secondary-600 shadow-sm">
                                        {item.category}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-secondary-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors">{item.name}</h3>
                                        <p className="text-sm text-secondary-500 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                                    </div>

                                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-secondary-50">
                                        <span className="text-3xl font-black text-secondary-900 tracking-tighter">₹{item.price}</span>
                                        {item.isAvailable ? (
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className="bg-secondary-100 text-secondary-900 hover:bg-primary-600 hover:text-white px-5 py-4 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-sm active:scale-95 group-hover:shadow-glow font-black text-sm uppercase tracking-wider"
                                            >
                                                <Plus size={18} strokeWidth={3} /> Add
                                            </button>
                                        ) : (
                                            <button disabled className="bg-secondary-50 text-secondary-300 px-5 py-4 rounded-2xl cursor-not-allowed font-black text-sm uppercase tracking-wider">
                                                Sold Out
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredItems.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="bg-secondary-100 p-8 rounded-full mb-8">
                            <Search size={48} className="text-secondary-400" />
                        </div>
                        <h3 className="text-3xl font-black text-secondary-900 tracking-tight mb-2">No items found</h3>
                        <p className="text-secondary-500 text-lg font-medium">Try adjusting your search or category.</p>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-32 py-16 border-t border-secondary-100 text-center bg-white">
                <div className="max-w-2xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-3 rounded-2xl shadow-glow">
                            <Utensils size={24} />
                        </div>
                    </div>
                    <p className="text-secondary-900 text-xl font-black tracking-tight mb-2">CanteenPro System</p>
                    <p className="text-secondary-400 text-sm font-medium mb-8">Elevating campus dining experiences.</p>
                    
                    <Link
                        to="/admin"
                        className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] hover:bg-primary-50 transition-colors py-3 px-6 rounded-xl border border-primary-100 inline-block"
                    >
                        Staff & Admin Access
                    </Link>
                </div>
            </footer>

            {/* Float Active Order */}
            <AnimatePresence>
                {activeOrderToken && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-full px-6 md:px-0 md:max-w-sm"
                    >
                        <Link
                            to={`/order/${activeOrderToken}`}
                            className="bg-secondary-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between hover:bg-black transition-all shadow-glow w-full"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                                    <Clock size={24} className="animate-spin-slow text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Current Order</p>
                                    <p className="font-black text-lg tracking-tight">View Status</p>
                                </div>
                            </div>
                            <div className="bg-white text-secondary-900 text-xs font-black px-4 py-2 rounded-xl">
                                #{activeOrderToken}
                            </div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuPage;
