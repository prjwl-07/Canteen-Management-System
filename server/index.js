const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Allow CORS origins from environment variable
const getAllowedOrigins = () => {
    const clientUrl = process.env.CLIENT_URL;
    if (process.env.NODE_ENV === 'production' && clientUrl) {
        return [clientUrl];
    }
    // Development: allow multiple local ports
    return [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
    ];
};

const ALLOWED_ORIGINS = getAllowedOrigins();

// Socket.IO with dynamic CORS configuration
const socketCorsConfig = {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
};

const io = new Server(server, {
    cors: socketCorsConfig
});

// Middleware
app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/canteen-db';
console.log('Connecting to MongoDB...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Client URL:', process.env.CLIENT_URL);
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// Routes
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes'); // New
const authRoutes = require('./routes/authRoutes'); // New

app.set('io', io); // Make io accessible in routes

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes); // New
app.use('/api/auth', authRoutes); // New

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('Canteen API is running');
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
