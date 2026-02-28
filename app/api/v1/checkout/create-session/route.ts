import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/firebase/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, userId } = body;

        if (!items || !items.length) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        const metadataItems: any[] = [];

        for (const item of items) {
            let doc;
            if (item.type === 'product') {
                doc = await adminDb.collection('products').doc(item.id).get();
            } else {
                doc = await adminDb.collection('courses').doc(item.id).get();
            }

            if (!doc.exists) throw new Error(`Item ${item.id} not found`);

            const data = doc.data()!;

            if (item.type === 'product' && data.stock < item.quantity) {
                throw new Error(`Not enough stock for ${data.name}`);
            }

            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: data.name || data.title,
                        images: data.images ? [data.images[0]] : data.thumbnailUrl ? [data.thumbnailUrl] : [],
                    },
                    unit_amount: Math.round(data.price * 100),
                },
                quantity: item.quantity,
            });

            metadataItems.push({ itemId: item.id, type: item.type, quantity: item.quantity });
        }

        const orderRef = adminDb.collection('orders').doc();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
            automatic_tax: { enabled: true },
            client_reference_id: userId,
            metadata: {
                orderId: orderRef.id,
                items: JSON.stringify(metadataItems),
            },
        });

        // Pre-create the strict order state inside Firestore
        await orderRef.set({
            userId: userId || 'guest',
            status: 'pending',
            items: metadataItems,
            stripeSessionId: session.id,
            totalAmount: session.amount_total ? session.amount_total / 100 : 0,
            createdAt: new Date()
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
