import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const { user, loading } = useAuth();
    const [cart, setCart] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart when user changes
    useEffect(() => {
        if (loading) return;
        const key = user ? `vouchify_cart_${user._id}` : 'vouchify_cart_guest';
        const localData = localStorage.getItem(key);
        setCart(localData ? JSON.parse(localData) : []);
        setIsInitialized(true);
    }, [user, loading]);

    // Save cart when it changes
    useEffect(() => {
        if (!isInitialized || loading) return;
        const key = user ? `vouchify_cart_${user._id}` : 'vouchify_cart_guest';
        localStorage.setItem(key, JSON.stringify(cart));
    }, [cart, user, loading, isInitialized]);

    const addToCart = (voucher) => {
        setCart((prev) => {
            if (prev.find(item => item._id === voucher._id)) return prev;
            return [...prev, voucher];
        });
    };

    const removeFromCart = (voucherId) => {
        setCart((prev) => prev.filter(item => item._id !== voucherId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
