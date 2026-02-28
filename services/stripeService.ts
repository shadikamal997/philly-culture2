import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover', // Ensure you pin an API version
    typescript: true,
    appInfo: {
        name: 'Philly Culture Update Checkout',
        version: '1.0.0'
    }
});
