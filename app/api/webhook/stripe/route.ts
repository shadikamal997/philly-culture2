import { NextResponse } from 'next/server';
import { stripe } from '@/services/stripeService';
import { adminDb as db } from '@/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { emailService } from '@/services/emailService';

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
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // IDEMPOTENCY: Check if this event was already processed
    const eventDoc = await db.collection('webhookEvents').doc(event.id).get();
    if (eventDoc.exists) {
      // Event already processed, skipping
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // Log event receipt
    await db.collection('webhookEvents').doc(event.id).set({
      eventId: event.id,
      type: event.type,
      receivedAt: new Date(),
      processed: false,
    });

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const metadata = paymentIntent.metadata;
      const userId = metadata?.userId;
      const items = metadata?.items ? JSON.parse(metadata.items) : [];
      
      if (!userId || !items.length) {
        console.error('Webhook Error: Missing userId or items in payment intent metadata');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Create Order in Firestore
      const orderRef = db.collection('orders').doc();
      const orderId = orderRef.id;

      const orderData = {
        userId,
        items,
        subtotal: Number(metadata.subtotal) || 0,
        taxAmount: Number(metadata.taxAmount) || 0,
        taxRate: Number(metadata.taxRate) || 0,
        state: metadata.state || '',
        total: paymentIntent.amount / 100, // Convert cents to dollars
        stripePaymentIntentId: paymentIntent.id,
        status: 'paid',
        shippingAddress: metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await orderRef.set(orderData);
      // Order created successfully

      // Process Items (Unlock courses, reduce inventory using transactions)
      for (const item of items) {
        if (item.type === 'course') {
          // Add course to user's enrolled courses
          const userRef = db.collection('users').doc(userId);
          await userRef.update({
            enrolledCourses: FieldValue.arrayUnion(item.id)
          });
          // Course unlocked for user

          // Send enrollment email
          try {
            const userSnap = await userRef.get();
            const userData = userSnap.data();
            if (userData?.email) {
              const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
              await emailService.sendEnrollmentConfirmation({
                recipientEmail: userData.email,
                recipientName: userData.name || 'Student',
                courseName: item.title,
                courseUrl: `${siteUrl}/course/${item.id}`,
                enrollmentDate: new Date(),
              });
              // Enrollment email sent
            }
          } catch (emailError) {
            console.error('❌ Failed to send enrollment email:', emailError);
          }

        } else if (item.type === 'tool') {
          // Deduct inventory using transaction to prevent race conditions
          const toolRef = db.collection('tools').doc(item.id);
          
          await db.runTransaction(async (transaction) => {
            const toolDoc = await transaction.get(toolRef);
            if (!toolDoc.exists) {
              throw new Error(`Tool ${item.id} not found`);
            }
            
            const currentInventory = toolDoc.data()?.inventory || 0;
            const newInventory = Math.max(0, currentInventory - item.quantity);
            
            transaction.update(toolRef, {
              inventory: newInventory,
              updatedAt: new Date(),
            });
            
            // Inventory updated
          });
        }
      }

      // Send order confirmation email
      try {
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        const userData = userSnap.data();
        
        if (userData?.email) {
          const itemsForEmail = items.map((item: any) => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price,
          }));

          await emailService.sendOrderConfirmation({
            recipientEmail: userData.email,
            recipientName: userData.name || 'Customer',
            orderId: orderId,
            orderDate: new Date(),
            items: itemsForEmail,
            subtotal: orderData.subtotal,
            tax: orderData.taxAmount,
            shipping: 0, // Update if you add shipping calculation
            total: orderData.total,
            shippingAddress: orderData.shippingAddress,
          });
          // Confirmation email sent
        }
      } catch (emailError) {
        console.error('❌ Failed to send order confirmation email:', emailError);
      }
    }

    // Handle failed payment
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Log failed payment to Firestore for debugging
      await db.collection('failedPayments').add({
        paymentIntentId: paymentIntent.id,
        userId: paymentIntent.metadata?.userId || null,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        failureMessage: paymentIntent.last_payment_error?.message || 'Unknown error',
        createdAt: new Date(),
      });
      
      console.error(`❌ Payment failed for PaymentIntent ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message}`);
    }

    // Mark event as processed
    await db.collection('webhookEvents').doc(event.id).update({
      processed: true,
      processedAt: new Date(),
    });

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}