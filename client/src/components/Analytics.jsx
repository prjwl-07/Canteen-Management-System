import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { TrendingUp, Calendar, Clock, DollarSign, Download, PieChart, Activity } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const Analytics = () => {
    const [orders, setOrders] = useState([]);
    const [revenue, setRevenue] = useState({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
    const [dateRange, setDateRange] = useState('today');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [reportData, setReportData] = useState({ revenue: 0, ordersCount: 0, itemSales: [] });

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const [ordersRes, revenueRes] = await Promise.all([
                    axios.get('/api/orders'),
                    axios.get('/api/orders/revenue')
                ]);
                setOrders(ordersRes.data);
                setRevenue(revenueRes.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
            }
        };
        fetchGlobalStats();
    }, []);

    useEffect(() => {
        const fetchReport = async () => {
            let start = new Date();
            let end = new Date();
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            if (dateRange === 'week') start.setDate(start.getDate() - 7);
            else if (dateRange === 'month') start.setDate(1);
            else if (dateRange === 'year') start.setMonth(0, 1);
            else if (dateRange === 'custom' && customDates.start && customDates.end) {
                start = new Date(customDates.start);
                end = new Date(customDates.end);
            }

            try {
                const res = await axios.get('/api/orders/analytics/custom', {
                    params: { startDate: start.toISOString(), endDate: end.toISOString() }
                });
                setReportData(res.data);
            } catch (err) {
                console.error("Failed to fetch report");
            }
        };

        fetchReport();
    }, [dateRange, customDates]);

    const downloadPDF = async () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text("Canteen Sales Report", 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            const reportPeriod = dateRange === 'custom' ? `${customDates.start} to ${customDates.end}` : dateRange.charAt(0).toUpperCase() + dateRange.slice(1);
            doc.text(`Period: ${reportPeriod} | Generated: ${new Date().toLocaleDateString()}`, 14, 30);

            doc.setDrawColor(200);
            doc.setFillColor(245, 247, 250);
            doc.rect(14, 45, 182, 30, 'F');
            doc.setTextColor(50);
            doc.setFontSize(14);
            doc.text(`Total Revenue: Rs. ${reportData.revenue}`, 20, 65);
            doc.text(`Total Orders: ${reportData.ordersCount}`, 110, 65);

            const tableColumn = ["Item Name", "Quantity Sold", "Revenue (Rs.)"];
            const tableRows = reportData.itemSales.map(item => [item._id, item.quantity, item.revenue.toFixed(2)]);

            const autoTableModule = await import('jspdf-autotable');
            const autoTable = autoTableModule.default || autoTableModule;

            const tableOptions = { head: [tableColumn], body: tableRows, startY: 85, theme: 'grid', headStyles: { fillColor: [79, 70, 229] }, styles: { fontSize: 10, cellPadding: 3 } };

            if (typeof autoTable === 'function') autoTable(doc, tableOptions);
            else if (doc.autoTable) doc.autoTable(tableOptions);

            doc.save(`Canteen_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF Error:", err);
        }
    };

    const itemCounts = {};
    const statusCounts = { 'Placed': 0, 'Preparing': 0, 'Ready': 0, 'Completed': 0, 'Cancelled': 0 };

    orders.forEach(order => {
        if (statusCounts[order.status] !== undefined) statusCounts[order.status]++;
        order.items.forEach(item => itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity);
    });

    // Chart Data Setups
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { size: 13, family: 'Outfit' }, bodyFont: { size: 13, family: 'Outfit' }, cornerRadius: 8, padding: 10 } },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Outfit', weight: '500' } } },
            y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, border: { display: false }, ticks: { font: { family: 'Outfit', weight: 'bold' } } }
        }
    };

    const itemChartData = {
        labels: Object.keys(itemCounts),
        datasets: [{
            label: 'Sold',
            data: Object.values(itemCounts),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const doughnutData = {
        labels: Object.keys(statusCounts),
        datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#60A5FA', '#FBBF24', '#34D399', '#1E293B', '#F87171'],
            borderWidth: 0,
            hoverOffset: 15
        }]
    };

    const bentoContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const bentoItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

    return (
        <motion.div initial="hidden" animate="visible" variants={bentoContainer} className="space-y-6">
            {/* Control Panel Bento */}
            <motion.div variants={bentoItem} className="bg-white p-6 rounded-[2rem] shadow-sm border border-secondary-100 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[80px] -z-10" />
                <div>
                    <h3 className="text-2xl font-black text-secondary-900 tracking-tight flex items-center gap-2"><Activity className="text-primary-600"/> Command Center</h3>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mt-1">Real-time analytical insights</p>
                </div>
                
                <div className="flex bg-secondary-50/80 backdrop-blur-md p-1.5 rounded-2xl gap-1 overflow-x-auto shadow-inner border border-secondary-100/50">
                    {['today', 'week', 'month', 'year'].map(r => (
                        <button key={r} onClick={() => setDateRange(r)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateRange === r ? 'bg-white text-primary-600 shadow-md transform scale-105' : 'text-secondary-400 hover:text-secondary-600'}`}>{r}</button>
                    ))}
                    <button onClick={() => setDateRange('custom')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateRange === 'custom' ? 'bg-white text-primary-600 shadow-md transform scale-105' : 'text-secondary-400 hover:text-secondary-600'}`}>Custom</button>
                    <button onClick={downloadPDF} className="ml-2 bg-secondary-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-secondary-900/20 active:scale-95"><Download size={14} /> PDF</button>
                </div>
                
                {dateRange === 'custom' && (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-secondary-100 shadow-sm">
                        <input type="date" className="bg-transparent border-none text-xs font-black text-secondary-600 outline-none w-28" onChange={e => setCustomDates({ ...customDates, start: e.target.value })} />
                        <span className="text-secondary-300">-</span>
                        <input type="date" className="bg-transparent border-none text-xs font-black text-secondary-600 outline-none w-28" onChange={e => setCustomDates({ ...customDates, end: e.target.value })} />
                    </motion.div>
                )}
            </motion.div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
                
                {/* Hero Stat - Large */}
                <motion.div variants={bentoItem} className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-primary-600 to-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary-500/30 relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-200">Total Period Revenue</p>
                                <h2 className="text-6xl font-black mt-2 tracking-tighter drop-shadow-md">₹{reportData.revenue}</h2>
                            </div>
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/20"><DollarSign size={32} /></div>
                        </div>
                        <div className="mt-8 flex gap-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-300">Total Orders</p>
                                <p className="text-2xl font-black">{reportData.ordersCount}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-300">Top Seller</p>
                                <p className="text-2xl font-black line-clamp-1">{reportData.itemSales[0]?._id || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sub Stats */}
                <motion.div variants={bentoItem} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-secondary-100 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
                    <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 scale-100 group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Weekly Pace</p>
                    <h3 className="text-4xl font-black text-secondary-900 mt-1 tracking-tight">₹{revenue.weekly}</h3>
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/5 rounded-tl-[4rem] -z-10" />
                </motion.div>

                <motion.div variants={bentoItem} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-secondary-100 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
                    <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 scale-100 group-hover:scale-110 transition-transform"><Calendar size={24} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Monthly Run</p>
                    <h3 className="text-4xl font-black text-secondary-900 mt-1 tracking-tight">₹{revenue.monthly}</h3>
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-tl-[4rem] -z-10" />
                </motion.div>

                {/* Charts Area */}
                <motion.div variants={bentoItem} className="md:col-span-2 md:row-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-secondary-100 flex flex-col">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-xl font-black text-secondary-900 tracking-tight">Item Popularity</h3>
                            <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mt-1">Velocity by product</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full h-[200px]">
                        <Bar data={itemChartData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div variants={bentoItem} className="md:col-span-2 md:row-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-secondary-100 flex flex-col">
                    <div className="mb-2">
                        <h3 className="text-xl font-black text-secondary-900 tracking-tight">Workflow Status</h3>
                        <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mt-1">Current state distribution</p>
                    </div>
                    <div className="flex-1 w-full h-[200px] flex items-center justify-center relative">
                        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { family: 'Outfit', weight: 'bold', size: 12 }, usePointStyle: true, padding: 20 } } }, cutout: '70%' }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -ml-28">
                            <span className="text-3xl font-black text-secondary-900">{orders.length}</span>
                            <span className="text-[9px] font-black text-secondary-400 uppercase tracking-widest">Total</span>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Deep Breakdown Table */}
            <motion.div variants={bentoItem} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-secondary-100">
                <div className="mb-8">
                    <h3 className="text-xl font-black text-secondary-900 tracking-tight">Deep Breakdown</h3>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mt-1">Line-item analytics</p>
                </div>
                
                <div className="overflow-x-auto rounded-[1.5rem] border border-secondary-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary-50/50">
                                <th className="p-5 font-black text-[10px] text-secondary-500 uppercase tracking-widest w-1/2 rounded-tl-[1.5rem]">Menu Item</th>
                                <th className="p-5 font-black text-[10px] text-secondary-500 uppercase tracking-widest text-right">Units Sold</th>
                                <th className="p-5 font-black text-[10px] text-secondary-500 uppercase tracking-widest text-right rounded-tr-[1.5rem]">Gross Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-50">
                            {reportData.itemSales.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-secondary-50/30 transition-colors">
                                    <td className="p-5 font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">{item._id}</td>
                                    <td className="p-5 font-medium text-secondary-600 text-right">
                                        <span className="bg-secondary-100 px-3 py-1 rounded-lg text-xs font-black">{item.quantity}</span>
                                    </td>
                                    <td className="p-5 font-black text-secondary-900 text-right text-lg tracking-tight">₹{item.revenue.toFixed(2)}</td>
                                </tr>
                            ))}
                            {reportData.itemSales.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-12 text-center text-secondary-400">
                                        <PieChart size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-bold uppercase tracking-widest text-xs">No transaction data available</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Analytics;
