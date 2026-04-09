const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
    }
});

// GET all menu items
router.get('/', async (req, res) => {
    try {
        const items = await Menu.find();
        // If image is a local path (starts with uploads/), prepend full URL logic if needed
        // For now, client will just use the relative path '/uploads/...'
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET recommendations 
router.get('/recommendations', async (req, res) => {
    try {
        const { userId } = req.query;
        
        // 1. New Arrivals: 5 most recently created available items
        const newArrivals = await Menu.find({ isAvailable: true })
            .sort({ createdAt: -1 })
            .limit(5);

        // 2. Popular Items: Aggregate all orders to find top ordered items
        const popularAgg = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.menuItemId", totalQuantity: { $sum: "$items.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        
        // Populate popular items with Menu data
        const popularItemIds = popularAgg.filter(p => p._id).map(p => p._id);
        const popularItemsData = await Menu.find({ _id: { $in: popularItemIds }, isAvailable: true });
        
        // Sort the fetched menu items to match the aggregated popularity order
        const popularItems = popularItemIds
            .map(id => popularItemsData.find(m => m._id.toString() === id.toString()))
            .filter(Boolean)
            .slice(0, 5);

        // 3. Frequent Items by User: If userId is provided
        let frequentItems = [];
        if (userId && userId !== 'undefined' && userId !== 'null') {
            const frequentAgg = await Order.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                { $unwind: "$items" },
                { $group: { _id: "$items.menuItemId", totalQuantity: { $sum: "$items.quantity" } } },
                { $sort: { totalQuantity: -1 } },
                { $limit: 10 }
            ]);

            const frequentItemIds = frequentAgg.filter(f => f._id).map(f => f._id);
            const frequentItemsData = await Menu.find({ _id: { $in: frequentItemIds }, isAvailable: true });
            
            frequentItems = frequentItemIds
                .map(id => frequentItemsData.find(m => m._id.toString() === id.toString()))
                .filter(Boolean)
                .slice(0, 5);
        }

        res.json({
            newArrivals,
            popularItems,
            frequentItems
        });
    } catch (err) {
        console.error("Error fetching recommendations:", err);
        res.status(500).json({ message: err.message });
    }
});

// POST create new item with image upload support
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, image: imageUrl } = req.body;

        let imagePath = imageUrl; // Default to URL if provided
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        const newItem = new Menu({
            name,
            price,
            category,
            image: imagePath,
            description
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error("Error creating menu item:", err);
        res.status(400).json({ message: err.message });
    }
});

// PUT update item with image upload support
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, image: imageUrl } = req.body;

        let updateData = {
            name, price, category, description
        };

        // If a file is uploaded, use it
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        } else if (imageUrl) {
            // If explicit URL string is sent, update it
            updateData.image = imageUrl;
        }

        // Handle availability toggle separately (often sent as simple JSON without file)
        if (req.body.isAvailable !== undefined) {
            updateData.isAvailable = req.body.isAvailable;
        }

        const updatedItem = await Menu.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedItem);
    } catch (err) {
        console.error("Error updating menu item:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Menu.findById(req.params.id);
        if (item && item.image && item.image.startsWith('/uploads/')) {
            // Optional: Delete physical file
            const filePath = path.join(__dirname, '..', item.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
