import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { io } from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, Clock, ChefHat, LayoutDashboard, UtensilsCrossed, BarChart3, LogOut, MonitorPlay } from 'lucide-react';
import MenuManagement from '../components/MenuManagement';
import Analytics from '../components/Analytics';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders'); // orders, menu, analytics
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();

        // Socket listeners
        socket.on('newOrder', (order) => {
            setOrders(prev => [...prev, order]);
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
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const statusColors = {
        'Placed': 'bg-blue-600 text-white shadow-md shadow-blue-200',
        'Preparing': 'bg-yellow-500 text-white shadow-md shadow-yellow-200',
        'Ready': 'bg-green-600 text-white shadow-md shadow-green-200',
        'Completed': 'bg-gray-800 text-white',
        'Cancelled': 'bg-red-600 text-white',
    };

    const OrdersView = () => {
        const activeOrders = orders.filter(o => ['Placed', 'Preparing', 'Ready'].includes(o.status));
        const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

        const OrderCard = ({ order }) => (
            <div key={order._id} className="bg-white p-6 rounded-3xl shadow-sm border border-secondary-100 hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-3xl font-black text-secondary-900 leading-none">#{order.tokenNumber}</span>
                        <p className="text-xs font-bold text-secondary-400 mt-1 uppercase tracking-wider">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[order.status] || 'bg-secondary-100'}`}>
                        {order.status}
                    </span>
                </div>

                <div className="border-t border-b border-secondary-50 py-4 my-4 space-y-2">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm font-medium text-secondary-600">
                            <span>{item.quantity}× {item.name}</span>
                            <span className="text-secondary-900">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="font-bold text-secondary-400 text-sm uppercase tracking-wider">Total</span>
                    <span className="font-black text-2xl text-secondary-900 underline decoration-primary-500/30 decoration-4">₹{order.totalAmount}</span>
                </div>

                <div className="flex gap-2 mt-4">
                    {order.status === 'Placed' && (
                        <button
                            onClick={() => updateStatus(order._id, 'Preparing')}
                            className="flex-1 bg-yellow-500 text-white py-3 rounded-2xl hover:bg-yellow-600 transition-all font-bold flex justify-center items-center gap-2 shadow-lg shadow-yellow-100"
                        >
                            <ChefHat size={18} /> Prepare
                        </button>
                    )}
                    {order.status === 'Preparing' && (
                        <button
                            onClick={() => updateStatus(order._id, 'Ready')}
                            className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl hover:bg-emerald-600 transition-all font-bold flex justify-center items-center gap-2 shadow-lg shadow-emerald-100"
                        >
                            <CheckCircle size={18} /> Ready
                        </button>
                    )}
                    {order.status === 'Ready' && (
                        <button
                            onClick={() => updateStatus(order._id, 'Completed')}
                            className="flex-1 bg-secondary-900 text-white py-3 rounded-2xl hover:bg-black transition-all font-bold shadow-lg shadow-secondary-200"
                        >
                            Complete
                        </button>
                    )}
                    {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                        <button
                            onClick={() => updateStatus(order._id, 'Cancelled')}
                            className="px-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors font-bold"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        );

        return (
            <div className="space-y-16 pb-20">
                {/* Active Orders Section */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-primary-100 text-primary-600 p-3 rounded-2xl shadow-inner"><Clock size={28} /></div>
                        <div>
                            <h2 className="text-3xl font-black text-secondary-900 tracking-tight">Active Orders</h2>
                            <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mt-1">Kitchen Queue</p>
                        </div>
                        <span className="ml-2 bg-primary-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-primary-200 animate-pulse">{activeOrders.length}</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {activeOrders.map(order => <OrderCard key={order._id} order={order} />)}
                        {activeOrders.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-secondary-200 flex flex-col items-center gap-4">
                                <div className="p-4 bg-white rounded-full shadow-sm text-secondary-300"><Clock size={48} /></div>
                                <div>
                                    <p className="text-xl font-bold text-secondary-900">Queue is Clear!</p>
                                    <p className="text-sm text-secondary-500 font-medium">No active orders at the moment.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Past Orders Section */}
                <section className="pt-12 border-t border-secondary-200">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-secondary-100 text-secondary-600 p-3 rounded-2xl"><CheckCircle size={28} /></div>
                        <div>
                            <h2 className="text-3xl font-black text-secondary-900 tracking-tight opacity-60">Completed</h2>
                            <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mt-1">Archived Orders</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        {pastOrders.map(order => <OrderCard key={order._id} order={order} />)}
                        {pastOrders.length === 0 && <p className="text-secondary-400 col-span-full py-12 text-center font-bold italic">No records found.</p>}
                    </div>
                </section>
            </div>
        );
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-app"><Loader className="animate-spin text-primary-600" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-app transition-colors duration-300">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-secondary-200 hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl shadow-secondary-100/50 z-30">
                <div className="p-8 border-b border-secondary-50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                            <LayoutDashboard size={22} />
                        </div>
                        <h1 className="text-2xl font-black text-secondary-900 tracking-tighter">Admin<span className="text-primary-600">Pro</span></h1>
                    </div>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] ml-1">Control Center</p>
                </div>

                <nav className="p-6 space-y-3 flex-1 overflow-y-auto">
                    {[
                        { id: 'orders', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'menu', label: 'Menu List', icon: UtensilsCrossed },
                        { id: 'analytics', label: 'Reports', icon: BarChart3 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 translate-x-2'
                                : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 font-bold'}`}
                        >
                            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? '' : 'group-hover:scale-110 transition'} />
                            <span className="font-black text-sm uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-secondary-50 space-y-4">
                    <div className="bg-secondary-50 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-secondary-400 uppercase">System Theme</span>
                            <span className="text-xs font-bold text-secondary-900">Toggle Theme →</span>
                        </div>
                        <ThemeSwitcher />
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 font-black text-sm uppercase tracking-wider hover:bg-red-50 transition-colors">
                        <LogOut size={22} /> Logout
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto h-screen relative">
                <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
                    <div className="hidden lg:block">
                        <h2 className="text-4xl font-black text-secondary-900 tracking-tighter capitalize leading-none mb-2">{activeTab}</h2>
                        <p className="text-sm font-bold text-secondary-400 uppercase tracking-widest ml-1">Managing canteen workflow</p>
                    </div>

                    {/* Mobile Header */}
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('orders')} className={`p-2 rounded ${activeTab === 'orders' ? 'bg-blue-100' : ''}`}><LayoutDashboard /></button>
                        <button onClick={() => setActiveTab('menu')} className={`p-2 rounded ${activeTab === 'menu' ? 'bg-blue-100' : ''}`}><UtensilsCrossed /></button>
                        <button onClick={() => setActiveTab('analytics')} className={`p-2 rounded ${activeTab === 'analytics' ? 'bg-blue-100' : ''}`}><BarChart3 /></button>
                    </div>
                </header>

                {activeTab === 'orders' && <OrdersView />}
                {activeTab === 'menu' && <MenuManagement />}
                {activeTab === 'analytics' && <Analytics />}
            </div>
        </div>
    );
};

export default AdminDashboard;
