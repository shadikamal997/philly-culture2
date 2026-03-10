import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, Timestamp, setDoc } from "firebase/firestore";
import { emailService } from "@/services/emailService";

// This endpoint must be configured to skip body parsing
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Webhook error: No signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    // 🔒 VERIFY STRIPE SIGNATURE
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
  
  // 🔒 IDEMPOTENCY CHECK - Prevent duplicate processing
  try {
    const eventRef = doc(db, "webhookEvents", event.id);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      console.log(`✅ Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, status: "already_processed" });
    }
    
    // Store event as processing
    await setDoc(eventRef, {
      eventId: event.id,
      type: event.type,
      processed: false,
      createdAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error checking idempotency:", error);
    // Continue processing even if idempotency check fails
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    try {
      // Prevent duplicate enrollments - check if this session was already processed
      const existingEnrollments = await getDocs(
        query(
          collection(db, "enrollments"),
          where("stripeSessionId", "==", session.id)
        )
      );

      if (!existingEnrollments.empty) {
        console.log("Enrollment already exists for session:", session.id);
        return NextResponse.json({ received: true, status: "already_processed" });
      }

      // 🔥 FETCH PROGRAM DATA FOR ENROLLMENT SETTINGS
      const programId = session.metadata?.programId;
      let programData: any = null;
      let accessExpiresAt = null;
      let unlockType = "instant"; // default
      let startDate = null;

      if (programId) {
        const programRef = doc(db, "programs", programId);
        const programSnap = await getDoc(programRef);
        
        if (programSnap.exists()) {
          programData = programSnap.data();
          unlockType = programData.unlockType || "instant";
          
          // Calculate access expiration (if program has accessDuration in days)
          if (programData.accessDuration && programData.accessDuration > 0) {
            const expiresInMs = Date.now() + (programData.accessDuration * 24 * 60 * 60 * 1000);
            accessExpiresAt = Timestamp.fromMillis(expiresInMs);
          }
          
          // Set start date for cohort programs
          if (programData.isCohort && programData.startDate) {
            startDate = programData.startDate; // Firestore timestamp
          }
        }
      }

      // 🔥 CREATE ENROLLMENT WITH FULL PHASE 4 MODEL
      const enrollmentData = {
        // User identification
        userId: session.metadata?.userEmail || session.customer_details?.email || null, // TODO: Replace with Firebase Auth UID when available
        userEmail: session.metadata?.userEmail || session.customer_details?.email || null,
        customerName: session.customer_details?.name || null,
        
        // Program identification
        programId: session.metadata?.programId || null,
        programSlug: session.metadata?.programSlug || null,
        programTitle: session.metadata?.programTitle || null,
        
        // Financial details
        subtotal: (session.amount_subtotal || 0) / 100,
        taxAmount: (session.total_details?.amount_tax || 0) / 100,
        totalAmount: (session.amount_total || 0) / 100,
        currency: session.currency || "usd",
        
        // Location for tax compliance
        state: session.customer_details?.address?.state || null,
        city: session.customer_details?.address?.city || null,
        country: session.customer_details?.address?.country || "US",
        postalCode: session.customer_details?.address?.postal_code || null,
        
        // Stripe data
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent || null,
        stripeCustomerId: session.customer || null,
        
        // 🔥 PHASE 4 - ENROLLMENT & ACCESS CONTROL
        status: "active",
        enrolledAt: serverTimestamp(),
        accessExpiresAt, // null = lifetime access
        unlockType, // "instant" | "drip" | "scheduled"
        startDate, // For cohort programs
        completionPercent: 0,
        certificateIssued: false,
        certificateEligible: false,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const enrollmentRef = await addDoc(collection(db, "enrollments"), enrollmentData);
      
      console.log("✅ Enrollment created:", enrollmentRef.id);
      console.log("Program:", enrollmentData.programTitle);
      console.log("Student:", enrollmentData.userEmail);
      console.log("Total:", `$${enrollmentData.totalAmount} (Tax: $${enrollmentData.taxAmount})`);
      console.log("Unlock:", enrollmentData.unlockType);
      console.log("Access:", accessExpiresAt ? "Expires" : "Lifetime");

      // Send order confirmation email
      try {
        await emailService.sendOrderConfirmation({
          recipientEmail: enrollmentData.userEmail,
          recipientName: enrollmentData.customerName || 'Valued Customer',
          orderId: session.id,
          orderDate: new Date(),
          items: [{
            name: enrollmentData.programTitle || 'Course/Program',
            quantity: 1,
            price: enrollmentData.subtotal,
          }],
          subtotal: enrollmentData.subtotal,
          tax: enrollmentData.taxAmount,
          shipping: 0, // Digital products, no shipping
          total: enrollmentData.totalAmount,
          shippingAddress: {
            fullName: enrollmentData.customerName || '',
            address: `${session.customer_details?.address?.line1 || ''} ${session.customer_details?.address?.line2 || ''}`.trim(),
            city: session.customer_details?.address?.city || '',
            state: session.customer_details?.address?.state || '',
            zipCode: session.customer_details?.address?.postal_code || '',
          },
        });
        console.log("✅ Order confirmation email sent");
      } catch (emailError) {
        console.error("❌ Failed to send order confirmation email:", emailError);
        // Don't fail the webhook for email errors
      }

      // Send enrollment confirmation email
      try {
        await emailService.sendEnrollmentConfirmation({
          recipientEmail: enrollmentData.userEmail,
          recipientName: enrollmentData.customerName || 'Valued Customer',
          courseName: enrollmentData.programTitle || 'Your Course',
          courseUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/course/${enrollmentData.programId}`,
          enrollmentDate: new Date(),
        });
        console.log("✅ Enrollment confirmation email sent");
      } catch (emailError) {
        console.error("❌ Failed to send enrollment confirmation email:", emailError);
        // Don't fail the webhook for email errors
      }
      
      // Mark webhook event as processed
      try {
        const eventRef = doc(db, "webhookEvents", event.id);
        await setDoc(eventRef, {
          eventId: event.id,
          type: event.type,
          processed: true,
          processedAt: serverTimestamp(),
          enrollmentId: enrollmentRef.id,
        }, { merge: true });
      } catch (error) {
        console.error("Failed to mark event as processed:", error);
      }

      return NextResponse.json({ 
        received: true, 
        status: "enrollment_created",
        enrollmentId: enrollmentRef.id 
      });
    } catch (error: any) {
      console.error("Error creating enrollment:", error);
      return NextResponse.json(
        { error: "Failed to create enrollment", details: error.message },
        { status: 500 }
      );
    }
  }

  // Handle other event types
  console.log(`Received event: ${event.type}`);

  return NextResponse.json({ received: true });
}
