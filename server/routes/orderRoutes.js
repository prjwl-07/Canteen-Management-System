const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Helper to generate token (e.g., #AB12)
const generateToken = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// GET custom analytics (Revenue + Item Sales)
router.get('/analytics/custom', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let matchStage = { status: { $ne: 'Cancelled' } };

        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Include the whole end day
                matchStage.createdAt.$lte = end;
            }
        }

        const analytics = await Order.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    totalRevenue: [
                        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
                    ],
                    itemSales: [
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: "$items.name",
                                quantity: { $sum: "$items.quantity" },
                                revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                            }
                        },
                        { $sort: { quantity: -1 } }
                    ]
                }
            }
        ]);

        res.json({
            revenue: analytics[0].totalRevenue[0]?.total || 0,
            ordersCount: analytics[0].totalRevenue[0]?.count || 0,
            itemSales: analytics[0].itemSales || []
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET revenue analytics (Quick Stats)
router.get('/revenue', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const revenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $facet: {
                    daily: [
                        { $match: { createdAt: { $gte: today } } },
                        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                    ],
                    weekly: [
                        { $match: { createdAt: { $gte: lastWeek } } },
                        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                    ],
                    monthly: [
                        { $match: { createdAt: { $gte: startOfMonth } } },
                        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                    ],
                    yearly: [
                        { $match: { createdAt: { $gte: startOfYear } } },
                        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                    ]
                }
            }
        ]);

        const result = {
            daily: revenue[0].daily[0]?.total || 0,
            weekly: revenue[0].weekly[0]?.total || 0,
            monthly: revenue[0].monthly[0]?.total || 0,
            yearly: revenue[0].yearly[0]?.total || 0
        };

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all orders (for Admin) - Filter by status query if needed
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: 1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const Menu = require('../models/Menu');

// POST place a new order
router.post('/', async (req, res) => {
    const { items, totalAmount, userId } = req.body;
    const tokenNumber = generateToken();
    const newOrder = new Order({
        items,
        totalAmount,
        tokenNumber,
        userId,
        status: 'Placed' // Starts in queue
    });

    try {
        const savedOrder = await newOrder.save();

        // Notify Admin via Socket.IO
        const io = req.app.get('io');
        io.emit('newOrder', savedOrder);

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

        // Notify User via Socket.IO (Room based or global broadcast for simplicity)
        const io = req.app.get('io');
        io.emit('orderStatusUpdate', updatedOrder);

        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST submit feedback
router.post('/:id/feedback', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'Completed') return res.status(400).json({ message: 'Feedback can only be provided for completed orders' });

        order.feedback = {
            rating: Number(rating),
            comment,
            submittedAt: new Date()
        };

        const updatedOrder = await order.save();

        // Notify via socket to refresh data if necessary, though mainly admin views this
        const io = req.app.get('io');
        io.emit('orderStatusUpdate', updatedOrder);

        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET order by token with queue position
router.get('/token/:token', async (req, res) => {
    try {
        const order = await Order.findOne({ tokenNumber: req.params.token });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        let queuePosition = 0;
        let estimatedTime = 0;
        if (['Placed', 'Preparing'].includes(order.status)) {
            const count = await Order.countDocuments({
                _id: { $lt: order._id },
                status: { $in: ['Placed', 'Preparing'] }
            });
            queuePosition = count + 1;
            estimatedTime = (count * 3) + 5; // 3 mins per order ahead + 5 mins base time
        }

        res.json({ ...order.toObject(), queuePosition, estimatedTime });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
