import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { processOrderFulfillment } from '@/services/server/orderService';

export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const items = JSON.parse(session.metadata?.items || '[]');
        const customerId = session.client_reference_id;

        if (!orderId || !customerId) {
            console.error('Missing metadata in Stripe Session', { orderId, customerId });
            return NextResponse.json({ received: true }, { status: 200 });
        }

        try {
            await processOrderFulfillment(event.id, orderId, customerId, items);
        } catch (error: any) {
            console.error("Fulfillment transaction failed", error);
            // Throw error so Stripe forcefully retries. Do not swallow it.
            return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
