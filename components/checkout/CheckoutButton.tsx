'use client';
import { useState } from 'react';
import { useCartContext } from '@/context/CartContext';

interface ShippingInfo {
    addressLine1?: string;
    [key: string]: unknown;
}

export const CheckoutButton = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    customerInfo,
    shippingInfo,
    onValidationFail
}: {
    customerInfo?: { email?: string; fullName?: string };
    shippingInfo?: ShippingInfo;
    onValidationFail?: () => void;
}) => {
    const { items, hasPhysicalItems } = useCartContext();
    // customerInfo reserved for future Stripe prefill
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        // 1. Basic Validation Logic Hook
        if (hasPhysicalItems && (!shippingInfo || !shippingInfo.addressLine1)) {
            if (onValidationFail) onValidationFail();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'guest_or_logged_in_id_placeholder', // TODO: Map real user ID
                    cartItems: items.map(item => ({
                        type: item.type,
                        itemId: item.itemId,
                        quantity: item.quantity
                    }))
                }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Redirect payload url directly
            if (data.url) {
                window.location.assign(data.url);
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all ${loading || items.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-lg'
                }`}
        >
            {loading ? 'Processing...' : 'Place Order via Stripe'}
        </button>
    );
};
