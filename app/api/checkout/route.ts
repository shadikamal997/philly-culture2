import { NextResponse } from "next/server";
import Stripe from "stripe";
import { calculateTax } from "@/lib/tax";
import { db } from "@/firebase/firebaseAdmin";
import { verifyUser } from "@/lib/authHelpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  try {
    // Verify user authentication
    const user = await verifyUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items, state, shippingAddress } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        { error: "State is required for tax calculation" },
        { status: 400 }
      );
    }

    // Verify products and calculate real prices server-side
    let subtotal = 0;
    let taxableAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      // Fetch product from Firestore to verify price
      let productDoc;

      if (item.type === "course") {
        productDoc = await db.collection("courses").doc(item.id).get();
      } else if (item.type === "tool") {
        productDoc = await db.collection("tools").doc(item.id).get();
      } else {
        return NextResponse.json(
          { error: `Invalid item type: ${item.type}` },
          { status: 400 }
        );
      }

      if (!productDoc.exists) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 404 }
        );
      }

      const productData = productDoc.data();

      if (!productData) {
        return NextResponse.json(
          { error: `Product data not found: ${item.id}` },
          { status: 404 }
        );
      }

      // Check inventory for tools
      if (item.type === "tool") {
        if (productData.inventory < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient inventory for ${productData.title}` },
            { status: 400 }
          );
        }
      }

      // Use server-side price (never trust client)
      const itemTotal = productData.price * item.quantity;
      subtotal += itemTotal;

      if (productData.taxable) {
        taxableAmount += itemTotal;
      }

      verifiedItems.push({
        id: item.id,
        title: productData.title,
        price: productData.price,
        quantity: item.quantity,
        type: item.type,
        taxable: productData.taxable,
      });
    }

    // Calculate tax on taxable items only
    const { rate: taxRate, taxAmount } = calculateTax(taxableAmount, state);

    const total = subtotal + taxAmount;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe uses cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.uid,
        userEmail: user.email,
        state,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        taxRate: taxRate.toString(),
        items: JSON.stringify(verifiedItems),
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : "",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subtotal,
      taxAmount,
      total,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
