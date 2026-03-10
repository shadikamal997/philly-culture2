'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type CartItemType = 'course' | 'product';

export interface CartItem {
    itemId: string;
    type: CartItemType;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    isDigital: boolean;
    stock?: number;
}

interface CartContextType {
    items: CartItem[];
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    subtotal: number;
    hasPhysicalItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from Local Storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('philly_cart');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to load cart');
            }
        }
        setIsInitialized(true);
    }, []);

    // Sync to Local Storage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('philly_cart', JSON.stringify(items));
            // TODO: If user is logged in, sync to Firestore `carts/{userId}`
        }
    }, [items, isInitialized]);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    const addItem = (newItem: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.itemId === newItem.itemId);
            if (existing) {
                // Prevent exceeding stock visually here if possible
                const newQty = existing.quantity + newItem.quantity;
                if (newItem.stock && newQty > newItem.stock) {
                    alert(`Only ${newItem.stock} left in stock.`);
                    return prev;
                }

                return prev.map((i) =>
                    i.itemId === newItem.itemId ? { ...i, quantity: newQty } : i
                );
            }
            return [...prev, newItem];
        });
        openDrawer(); // Optimistic UX: Open on add
    };

    const removeItem = (itemId: string) => {
        setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.itemId === itemId ? { ...i, quantity } : i))
        );
    };

    const clearCart = useCallback(() => setItems([]), []);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const hasPhysicalItems = items.some((item) => !item.isDigital);

    return (
        <CartContext.Provider
            value={{
                items,
                isDrawerOpen,
                openDrawer,
                closeDrawer,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                subtotal,
                hasPhysicalItems
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCartContext must be used within CartProvider');
    return context;
};
