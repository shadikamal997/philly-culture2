import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/adminAuth";
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // 🔒 RATE LIMITING
  const identifier = getClientIdentifier(req);
  const rateLimit = rateLimiter.check(identifier, RATE_LIMITS.API_WRITE.limit, RATE_LIMITS.API_WRITE.window);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { 'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString() } }
    );
  }
  
  // 🔒 ADMIN VERIFICATION
  let admin;
  try {
    admin = await verifyAdminAccess(req);
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      return forbiddenResponse();
    }
    return unauthorizedResponse();
  }
  
  try {
    const { enrollmentId, paymentIntentId, amount } = await req.json();

    if (!enrollmentId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Enrollment ID and Payment Intent ID are required" },
        { status: 400 }
      );
    }

    // 🔥 PROCESS REFUND VIA STRIPE
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // Full refund (in cents)
      reason: "requested_by_customer"
    });

    if (refund.status !== "succeeded") {
      return NextResponse.json(
        { error: "Refund failed in Stripe", details: refund },
        { status: 500 }
      );
    }

    // 🔥 UPDATE ENROLLMENT IN FIRESTORE
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    await updateDoc(enrollmentRef, {
      status: "refunded",
      refundStatus: "refunded",
      refundedAt: serverTimestamp(),
      stripeRefundId: refund.id,
      updatedAt: serverTimestamp()
    });

    // 🔥 LOG ADMIN ACTION (AUDIT)
    await addDoc(collection(db, "adminLogs"), {
      action: "refund_processed",
      targetId: enrollmentId,
      targetType: "enrollment",
      refundAmount: amount / 100,
      stripeRefundId: refund.id,
      timestamp: serverTimestamp(),
      adminId: admin.uid,
      adminEmail: admin.email,
    });

    console.log(`✅ Refund processed: ${refund.id} for enrollment ${enrollmentId}`);

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
