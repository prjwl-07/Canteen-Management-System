import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Persist cart
        const savedCart = localStorage.getItem('canteen_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [walletBalance, setWalletBalance] = useState(() => {
        const savedBalance = localStorage.getItem('canteen_wallet_balance');
        return savedBalance ? Number(savedBalance) : 2000; // Default dummy balance
    });

    useEffect(() => {
        localStorage.setItem('canteen_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('canteen_wallet_balance', walletBalance);
    }, [walletBalance]);

    const addToCart = (item) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((i) => i._id === item._id);
            if (existingItem) {
                return prevCart.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item._id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const payFromWallet = (amount) => {
        if (walletBalance >= amount) {
            setWalletBalance(prev => prev - amount);
            return true;
        }
        return false;
    };

    const addMoney = (amount) => {
        setWalletBalance(prev => prev + amount);
    };

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
            walletBalance, payFromWallet, addMoney
        }}>
            {children}
        </CartContext.Provider>
    );
};
