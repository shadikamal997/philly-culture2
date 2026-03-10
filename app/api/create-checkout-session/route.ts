import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/services/stripeService';
import { adminDb as db } from '@/firebase/firebaseAdmin';
import { Course } from '@/types/firestore/course';
import { Product } from '@/types/firestore/product';
import { OrderItem, OrderStatus } from '@/types/firestore/order';

interface CartItemInput {
  type: 'course' | 'product';
  itemId: string;
  quantity: number;
}

interface CreateCheckoutRequest {
  userId: string;
  cartItems: CartItemInput[];
}

// NOTE: Tax calculation uses estimated rate since Stripe collects address during checkout
// For exact tax: Enable Stripe Tax API or calculate tax after address is collected
// The taxService is available for server-side calculation when address is known
const TAX_RATE = 0.08; // 8% Estimated (US average)
const SHIPPING_UNDER_50 = 7.00;
const SHIPPING_THRESHOLD = 50.00;

export async function POST(req: Request) {
  try {
    const body: CreateCheckoutRequest = await req.json();
    const { userId, cartItems } = body;

    // 1. Basic Validation
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Ensure User exists in Firestore (Optional but recommended security)
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Invalid User' }, { status: 401 });
    }

    let subtotal = 0;
    let hasPhysicalProducts = false;
    const validatedOrderItems: OrderItem[] = [];
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // 2. Process Items and Fetch Server-Side Prices
    for (const item of cartItems) {
      if (item.type === 'course') {
        const courseSnap = await db.collection('courses').doc(item.itemId).get();
        if (!courseSnap.exists) {
          return NextResponse.json({ error: `Course ${item.itemId} not found` }, { status: 400 });
        }

        const course = courseSnap.data() as Course;
        
        // SECURITY: Only allow published courses
        if (course.status !== 'published') {
          return NextResponse.json({ error: `Course ${course.title} is not available for purchase` }, { status: 400 });
        }
        
        // Use server-side price only
        subtotal += course.price * item.quantity;

        validatedOrderItems.push({
          type: 'course',
          id: item.itemId,
          title: course.title,
          quantity: item.quantity,
          price: course.price,
          taxable: true
        });

        stripeLineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              images: course.thumbnailURL ? [course.thumbnailURL] : [],
              metadata: { type: 'course', itemId: item.itemId }
            },
            unit_amount: Math.round(course.price * 100), // Stripe expects cents
          },
          quantity: item.quantity,
        });

      } else if (item.type === 'product') {
        const productSnap = await db.collection('products').doc(item.itemId).get();
        if (!productSnap.exists) {
          return NextResponse.json({ error: `Product ${item.itemId} not found` }, { status: 400 });
        }

        const product = productSnap.data() as Product;
        
        // SECURITY: Only allow active products
        if (product.isActive === false) {
          return NextResponse.json({ error: `Product ${product.name} is not available for purchase` }, { status: 400 });
        }
        
        // SECURITY: Check inventory for physical products
        if (!product.isDigital && product.stock !== undefined && product.stock < item.quantity) {
          return NextResponse.json({ error: `Insufficient inventory for ${product.name}` }, { status: 400 });
        }
        
        // Use server-side price only
        subtotal += product.price * item.quantity;

        if (!product.isDigital) {
          hasPhysicalProducts = true;
        }

        validatedOrderItems.push({
          type: 'tool',
          id: item.itemId,
          title: product.name,
          quantity: item.quantity,
          price: product.price,
          taxable: true
        });

        stripeLineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              images: product.images && product.images.length > 0 ? [product.images[0]] : [],
              metadata: { type: 'product', itemId: item.itemId }
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        });
      }
    }

    if (validatedOrderItems.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
    }

    // 3. Tax and Shipping Calculations
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    let shipping = 0;

    if (hasPhysicalProducts) {
      shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_UNDER_50;
    }

    // Add Tax and Shipping as line items to Stripe
    if (tax > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'US Sales Tax (8%)', description: 'Placeholder Manual Tax' },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    if (shipping > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Flat Rate Shipping' },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    const total = subtotal + tax + shipping;

    // 4. Create Pending Order in Firestore
    const orderRef = db.collection('orders').doc();
    const orderData = {
      orderId: orderRef.id,
      userId,
      items: validatedOrderItems,
      subtotal,
      tax,
      shipping,
      total,
      status: 'pending' as OrderStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Will assign stripeSessionId shortly
    };

    // 5. Create Stripe Checkout Session
    const domainInfo = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${domainInfo}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainInfo}/cart?cancelled=true`,
      client_reference_id: userId,
      metadata: {
        orderId: orderRef.id, // CRITICAL: So webhook can look it up
        userId: userId
      }
    };

    if (hasPhysicalProducts) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US'],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // 6. Save stripeSessionId to Order and commit
    await orderRef.set({
      ...orderData,
      stripeSessionId: session.id,
    });

    // 7. Return URL to frontend
    return NextResponse.json({ url: session.url, orderId: orderRef.id });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}