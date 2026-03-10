import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get the appropriate Stripe secret key based on environment
 */
function getStripeSecretKey(): string {
    const isProduction = process.env.NODE_ENV === 'production';
    const liveKey = process.env.STRIPE_LIVE_SECRET_KEY;
    const testKey = process.env.STRIPE_SECRET_KEY; // Test key (default for development)

    if (isProduction) {
        if (!liveKey) {
            console.warn('⚠️ Production mode but STRIPE_LIVE_SECRET_KEY not set, falling back to test key');
            if (!testKey) {
                throw new Error('Missing Stripe secret key');
            }
            return testKey;
        }
        console.log('✅ Using Stripe LIVE mode');
        return liveKey;
    }

    if (!testKey) {
        throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    console.log('🧪 Using Stripe TEST mode');
    return testKey;
}

/**
 * Get Stripe instance (lazy initialization)
 * Only creates instance when actually needed, not during build time
 */
export function getStripe(): Stripe {
    if (!stripeInstance) {
        const key = getStripeSecretKey();

        stripeInstance = new Stripe(key, {
            apiVersion: '2023-10-16' as any,
            typescript: true,
            appInfo: {
                name: 'Philly Culture Update Checkout',
                version: '1.0.0'
            }
        });
    }

    return stripeInstance;
}

// Export as default for backward compatibility
export const stripe = new Proxy({} as Stripe, {
    get(_, prop) {
        return (getStripe() as any)[prop];
    }
});
