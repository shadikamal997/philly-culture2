'use client';
import { useState } from 'react';
import { useCartContext } from '@/context/CartContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const CheckoutButton = ({
    customerInfo,
    shippingInfo,
    onValidationFail
}: {
    customerInfo?: any,
    shippingInfo?: any,
    onValidationFail?: () => void
}) => {
    const { items, hasPhysicalItems } = useCartContext();
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
        } catch (error: any) {
            console.error('Checkout failed:', error);
            alert('Checkout failed: ' + error.message);
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
