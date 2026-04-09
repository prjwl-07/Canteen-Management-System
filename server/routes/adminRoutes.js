const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Hardcoded for now, but should be in .env in production
const ADMIN_SECRET = process.env.JWT_SECRET || 'cant33n_s3cr3t_k3y_2024';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'canteengo'; // Load from env

router.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, ADMIN_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    jwt.verify(token, ADMIN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

router.get('/verify', verifyToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
