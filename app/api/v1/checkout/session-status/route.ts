import { stripe } from "@/lib/stripe";
import { adminDb } from "@/firebase/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimit";

/**
 * Payment status for the post-checkout confirmation page.
 * Returns only what that page displays (no customer details).
 */
export async function GET(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  const rateLimit = rateLimiter.check(identifier, RATE_LIMITS.API_READ.limit, RATE_LIMITS.API_READ.window);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id") || "";
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // The Stripe account is shared: only report on Philly Culture program checkouts
    if (!session.metadata?.programId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let status: "paid" | "processing" | "failed" | "open" | "expired";
    if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
      status = "paid";
    } else if (session.status === "complete") {
      // Completed but unpaid = SEPA Direct Debit still settling (or failed)
      const payment = await adminDb.collection("programPayments").doc(session.id).get();
      status = payment.data()?.status === "failed" ? "failed" : "processing";
    } else {
      status = session.status === "expired" ? "expired" : "open";
    }

    let enrolled = false;
    if (status === "paid") {
      const enrollment = await adminDb
        .collection("enrollments")
        .where("stripeSessionId", "==", session.id)
        .limit(1)
        .get();
      enrolled = !enrollment.empty;
    }

    return NextResponse.json({
      status,
      enrolled,
      programTitle: session.metadata.programTitle || null,
      programSlug: session.metadata.programSlug || null,
      amountTotal: (session.amount_total || 0) / 100,
      currency: session.currency || "usd",
    });
  } catch (error: any) {
    if (error?.code === "resource_missing") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Session status error:", error);
    return NextResponse.json({ error: "Failed to load payment status" }, { status: 500 });
  }
}
