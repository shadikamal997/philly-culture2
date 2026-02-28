'use client';

import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AuthProvider } from '@/context/AuthContext';

export function CoreProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
                <CartDrawer />
            </CartProvider>
        </AuthProvider>
    );
}
