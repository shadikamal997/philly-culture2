import { stripe, CHECKOUT_SESSION_DEFAULTS } from "@/lib/stripe";
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
    const { programId, userEmail, currency: requestedCurrency } = await req.json();

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

      // A SEPA payment that hasn't settled yet has no enrollment, so check it separately
      const processingPayment = await adminDb
        .collection("programPayments")
        .where("programId", "==", programId)
        .where("userEmail", "==", userEmail)
        .where("status", "==", "processing")
        .limit(1)
        .get();

      if (!processingPayment.empty) {
        return NextResponse.json(
          { error: "Your bank payment for this program is still processing. You'll get access as soon as it clears." },
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

    // basePrice is in the program's currency (USD unless set to EUR). USD programs can
    // also offer an eurPrice. Charging in EUR adds SEPA Direct Debit.
    const programCurrency = program.currency === "eur" ? "eur" : "usd";
    const currency = programCurrency === "eur" || requestedCurrency === "eur" ? "eur" : "usd";
    if (currency !== programCurrency && !(program.eurPrice > 0)) {
      return NextResponse.json({ error: "EUR payment is not available for this program" }, { status: 400 });
    }
    const unitPrice = currency === programCurrency ? program.basePrice : program.eurPrice;

    // Create Stripe Checkout Session
    console.log('🔵 Creating Stripe checkout session...', { currency });
    const session = await stripe.checkout.sessions.create({
      ...CHECKOUT_SESSION_DEFAULTS,
      payment_method_types: currency === "eur" ? ["card", "sepa_debit"] : ["card"],
      mode: "payment",
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(unitPrice * 100), // Convert to cents
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
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
