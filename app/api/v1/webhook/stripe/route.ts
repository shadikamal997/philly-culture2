import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { processOrderFulfillment } from '@/services/server/orderService';
import { rateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required for Stripe integration');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook verification');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { 
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion 
});

// Supported webhook events for security
const SUPPORTED_EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
] as const;

export async function POST(req: NextRequest) {
    try {
      // Apply rate limiting (Stripe webhooks can send many events)
      const identifier = getClientIdentifier(req);
      const rateLimit = rateLimiter.check(
        identifier,
        RATE_LIMITS.WEBHOOK.limit,
        RATE_LIMITS.WEBHOOK.window
      );

      if (!rateLimit.allowed) {
        console.warn('⚠️  Webhook rate limit exceeded', { identifier });
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }

      // Get raw payload and signature
      const payload = await req.text();
      const signature = req.headers.get('stripe-signature');

      // Validate signature exists
      if (!signature) {
        console.error('❌ Missing Stripe signature header');
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 400 }
        );
      }

      // Verify webhook signature
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          payload,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Webhook signature verification failed:', errorMessage);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }

      // Log webhook event (for audit trail)
      console.log('✅ Webhook event received:', {
        eventId: event.id,
        eventType: event.type,
        created: new Date(event.created * 1000).toISOString(),
      });

      // Validate event type is supported
      if (!SUPPORTED_EVENTS.includes(event.type as any)) {
        console.warn('⚠️  Unsupported webhook event type:', event.type);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Process checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const items = session.metadata?.items;
        const customerId = session.client_reference_id;

        // Validate required metadata
        if (!orderId || !customerId || !items) {
          console.error('❌ Missing required metadata in Stripe Session', {
            eventId: event.id,
            orderId,
            customerId,
            hasItems: !!items,
          });
          return NextResponse.json(
            { error: 'Invalid session metadata' },
            { status: 400 }
          );
        }

        // Parse items safely
        let parsedItems;
        try {
          parsedItems = JSON.parse(items);
        } catch (parseError) {
          console.error('❌ Failed to parse items metadata:', parseError);
          return NextResponse.json(
            { error: 'Invalid items data' },
            { status: 400 }
          );
        }

        // Process order fulfillment
        try {
          await processOrderFulfillment(event.id, orderId, customerId, parsedItems);
          console.log('✅ Order fulfillment completed:', {
            eventId: event.id,
            orderId,
            customerId,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ Fulfillment transaction failed:', {
            eventId: event.id,
            orderId,
            error: errorMessage,
          });
          
          // Return 500 so Stripe will retry
          return NextResponse.json(
            { error: 'Fulfillment failed' },
            { status: 500 }
          );
        }
      }

      // Process payment_intent.succeeded event
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Payment succeeded:', {
          eventId: event.id,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });
      }

      // Process payment_intent.payment_failed event
      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', {
          eventId: event.id,
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        });
      }

      // Process charge.refunded event
      if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;
        console.log('💸 Charge refunded:', {
          eventId: event.id,
          chargeId: charge.id,
          amount: charge.amount_refunded,
        });
        // TODO: Implement refund processing logic
      }

      // Return success response
      return NextResponse.json({ 
        received: true,
        eventId: event.id,
        eventType: event.type,
      }, { status: 200 });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Webhook processing error:', errorMessage);
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
}
