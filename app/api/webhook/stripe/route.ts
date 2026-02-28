import { NextResponse } from 'next/server';
import { stripe } from '@/services/stripeService';
import { adminDb as db } from '@/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false, // Essential for Stripe Webhooks to raw read
  },
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing stripe webhook secret or signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Handle checkout session completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const stripePaymentIntentId = session.payment_intent as string; // Will exist on completed sessions

      if (!orderId) {
        console.error('Webhook Error: Missing orderId in session metadata');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        console.error('Webhook Error: Order not found in Firestore', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const orderData = orderSnap.data();

      // Update Order Status
      await orderRef.update({
        status: 'paid',
        stripePaymentIntentId,
        updatedAt: new Date() // Fallback to simpler dates on cloud funcs or webhook routes
      });

      // Process Items (Unlock courses, reduce stock)
      if (orderData?.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.type === 'course') {
            const userRef = db.collection('users').doc(orderData.userId);
            // using admin FieldValue for arrayUnion to avoid duplicates
            await userRef.update({
              purchasedCourses: FieldValue.arrayUnion(item.itemId)
            });
            console.log(`Unlocked course ${item.itemId} for user ${orderData.userId}`);
          } else if (item.type === 'product') {
            const productRef = db.collection('products').doc(item.itemId);
            await productRef.update({
              stock: FieldValue.increment(-item.quantity)
            });
            console.log(`Reduced stock for product ${item.itemId} by ${item.quantity}`);
          }
        }
      }

      // TODO: Placeholder to Trigger Resend or SendGrid confirmation email here
      console.log(`Sending Confirmation Email for order ${orderId} to ${session.customer_details?.email}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}