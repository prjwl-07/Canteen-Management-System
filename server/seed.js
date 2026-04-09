const mongoose = require('mongoose');
const Menu = require('./models/Menu');
require('dotenv').config();

const items = [
    {
        name: "Veg Burger",
        price: 45,
        category: "Snacks",
        description: "Crispy veg patty with fresh lettuce and mayo.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
        isAvailable: true
    },
    {
        name: "Chicken Sandwich",
        price: 80,
        category: "Snacks",
        description: "Grilled chicken with cheese and veggies.",
        image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=500&q=60",
        isAvailable: true
    },
    {
        name: "Masala Dosa",
        price: 60,
        category: "Breakfast",
        description: "South Indian crepe with potato filling.",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=60",
        isAvailable: true
    },
    {
        name: "Cold Coffee",
        price: 40,
        category: "Beverages",
        description: "Chilled coffee with chocolate topping.",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=60",
        isAvailable: true
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canteen-db')
    .then(async () => {
        console.log('Connected to MongoDB');
        await Menu.deleteMany({});
        await Menu.insertMany(items);
        console.log('Data Seeded Successfully');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        mongoose.connection.close();
    });
