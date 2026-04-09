const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Placed', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
        default: 'Placed'
    },
    tokenNumber: { type: String, unique: true }, // Simple unique token (e.g. #101)
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        submittedAt: { type: Date }
    }
}, { timestamps: true });

// Auto-increment token number (simple logic for now, or use UUID)
// Ideally, we reset token number daily or use a counter collection. 
// For simplicity, we'll generate a random 4-digit number or use a timestamp segment.
// Let's use a simple pre-save hook for now if needed, or handle in controller.

module.exports = mongoose.model('Order', orderSchema);
