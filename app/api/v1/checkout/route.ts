import { stripe } from "@/lib/stripe";
import { adminDb } from "@/firebase/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // 🔒 RATE LIMITING - Prevent checkout abuse
  const identifier = getClientIdentifier(req);
  const rateLimit = rateLimiter.check(identifier, RATE_LIMITS.CHECKOUT.limit, RATE_LIMITS.CHECKOUT.window);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait before trying again." },
      { 
        status: 429, 
        headers: { 
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        } 
      }
    );
  }
  
  try {
    const { programId, userEmail } = await req.json();

    if (!programId) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    // userEmail is optional — guest checkout is allowed; Stripe will collect it
    console.log('🔵 Checkout request:', { programId, userEmail: userEmail || '(guest)' });

    // 🔥 PREVENT DUPLICATE PURCHASE — only if we have the email (logged-in users)
    if (userEmail) {
      const enrollmentQuery = adminDb
        .collection("enrollments")
        .where("programId", "==", programId)
        .where("userEmail", "==", userEmail);

      const existing = await enrollmentQuery.get();

      if (!existing.empty) {
        console.log('⚠️  User already enrolled in this program');
        return NextResponse.json(
          { error: "Already enrolled in this program" },
          { status: 400 }
        );
      }
    }

    // Fetch program from Firestore using Admin SDK
    const programRef = adminDb.collection("programs").doc(programId);
    const programSnap = await programRef.get();

    if (!programSnap.exists) {
      console.log('❌ Program not found:', programId);
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const program = programSnap.data();
    console.log('✅ Program found:', program?.title);

    // Validate program is published
    if (!program?.published) {
      console.log('⚠️  Program is not published');
      return NextResponse.json({ error: "Program is not available" }, { status: 400 });
    }

    // Create Stripe Checkout Session
    console.log('🔵 Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      // Pre-fill email for logged-in users; guests enter it on Stripe's checkout page
      ...(userEmail ? { customer_email: userEmail } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(program.basePrice * 100), // Convert to cents
            product_data: {
              name: program.title,
              description: program.shortDescription || "Online culinary program",
              images: program.thumbnail ? [program.thumbnail] : [],
              tax_code: "txcd_10000000", // Digital goods tax code
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/programs/${program.slug}?canceled=true`,
      metadata: {
        programId,
        programSlug: program.slug,
        programTitle: program.title,
        // Only set userEmail if defined — avoids Stripe storing the string "undefined" for guests
        ...(userEmail ? { userEmail } : {}),
      },
    });

    console.log('✅ Stripe session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
