import { NextResponse } from 'next/server';
import { stripe } from '@/services/stripeService';
import { adminDb as db } from '@/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { emailService } from '@/services/emailService';
import { formatCurrency } from '@/lib/formatCurrency';

const siteUrl = () => process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const customerEmail = (session: Stripe.Checkout.Session) =>
  session.metadata?.userEmail || session.customer_details?.email || null;

/**
 * Create the program enrollment for a paid Checkout Session.
 * Idempotent per session; returns the enrollment ID.
 */
async function enrollFromSession(session: Stripe.Checkout.Session): Promise<string | null> {
  const metadata = session.metadata || {};
  const programId = metadata.programId;
  const userEmail = customerEmail(session);

  if (!programId || !userEmail) return null;

  const existingEnrollment = await db
    .collection('enrollments')
    .where('stripeSessionId', '==', session.id)
    .limit(1)
    .get();

  if (!existingEnrollment.empty) return existingEnrollment.docs[0].id;

  const programSnap = await db.collection('programs').doc(programId).get();
  const programData = programSnap.exists ? programSnap.data() : null;

  let accessExpiresAt: Date | null = null;
  const accessDuration = Number(programData?.accessDuration || 0);
  if (accessDuration > 0) {
    accessExpiresAt = new Date(Date.now() + accessDuration * 24 * 60 * 60 * 1000);
  }

  // Create enrollment
  const enrollmentRef = await db.collection('enrollments').add({
    userId: userEmail,
    userEmail,
    customerName: session.customer_details?.name || null,
    programId,
    programSlug: metadata.programSlug || null,
    programTitle: metadata.programTitle || programData?.title || null,
    subtotal: (session.amount_subtotal || 0) / 100,
    taxAmount: (session.total_details?.amount_tax || 0) / 100,
    totalAmount: (session.amount_total || 0) / 100,
    currency: session.currency || 'usd',
    state: session.customer_details?.address?.state || null,
    city: session.customer_details?.address?.city || null,
    country: session.customer_details?.address?.country || 'US',
    postalCode: session.customer_details?.address?.postal_code || null,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === 'string' ? session.payment_intent : null,
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
    status: 'active',
    enrolledAt: new Date(),
    accessExpiresAt,
    unlockType: programData?.unlockType || 'instant',
    startDate: programData?.isCohort ? programData?.startDate || null : null,
    completionPercent: 0,
    certificateIssued: false,
    certificateEligible: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create chat for student-admin communication
  try {
    // Get student's UID from users collection
    const studentQuery = await db.collection('users').where('email', '==', userEmail).limit(1).get();
    const studentId = !studentQuery.empty ? studentQuery.docs[0].id : userEmail; // Fallback to email if user not found

    // Get or find owner/admin user ID
    const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@phillycultrue.com';
    const ownerQuery = await db.collection('users').where('email', '==', ownerEmail).limit(1).get();
    const ownerId = !ownerQuery.empty ? ownerQuery.docs[0].id : null;

    // Only create chat if we have both student and owner
    if (ownerId) {
      await db.collection('chats').add({
        programId,
        programTitle: metadata.programTitle || programData?.title || 'Program',
        studentId,
        studentName: session.customer_details?.name || 'Student',
        studentEmail: userEmail,
        ownerId,
        participants: [studentId, ownerId], // Store UIDs for proper security rules
        lastMessage: null,
        lastMessageTimestamp: null,
        unreadCountStudent: 0,
        unreadCountOwner: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Chat created for enrollment:', { programId, userEmail, studentId, ownerId });
    } else {
      console.warn('⚠️ Owner not found, chat not created');
    }
  } catch (chatError) {
    console.error('❌ Failed to create chat:', chatError);
    // Don't fail enrollment if chat creation fails
  }

  return enrollmentRef.id;
}

/**
 * Track a SEPA Direct Debit checkout in programPayments (doc ID = session ID).
 * Returns false when the update was skipped because the payment already settled.
 */
async function recordProgramPayment(
  session: Stripe.Checkout.Session,
  status: 'processing' | 'succeeded' | 'failed',
  enrollmentId?: string | null
): Promise<boolean> {
  const ref = db.collection('programPayments').doc(session.id);
  const metadata = session.metadata || {};

  return db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);

    // Stripe doesn't guarantee event order: never move a settled payment back to processing
    if (status === 'processing' && snap.exists && snap.data()?.status !== 'processing') {
      return false;
    }

    transaction.set(ref, {
      stripeSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      programId: metadata.programId,
      programSlug: metadata.programSlug || null,
      programTitle: metadata.programTitle || null,
      userEmail: customerEmail(session),
      customerName: session.customer_details?.name || null,
      subtotal: (session.amount_subtotal || 0) / 100,
      taxAmount: (session.total_details?.amount_tax || 0) / 100,
      totalAmount: (session.amount_total || 0) / 100,
      currency: session.currency || 'eur',
      // Only delayed-notification methods complete unpaid, and SEPA is the only one we offer
      paymentMethod: 'sepa_debit',
      status,
      ...(enrollmentId ? { enrollmentId } : {}),
      ...(snap.exists ? {} : { createdAt: new Date() }),
      updatedAt: new Date(),
    }, { merge: true });

    return true;
  });
}

function sepaEmailData(session: Stripe.Checkout.Session, actionUrl: string) {
  return {
    recipientEmail: customerEmail(session)!,
    recipientName: session.customer_details?.name || 'there',
    programTitle: session.metadata?.programTitle || 'your program',
    amount: formatCurrency((session.amount_total || 0) / 100, session.currency || 'eur', 2),
    actionUrl,
  };
}

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

    // Handle program checkout completion (program enrollments).
    // Card payments are paid at this point. SEPA Direct Debit sessions complete as
    // 'unpaid' and settle days later via the async_payment events below.
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.programId && customerEmail(session)) {
        if (session.payment_status === 'unpaid') {
          const recorded = await recordProgramPayment(session, 'processing');
          if (recorded) {
            try {
              await emailService.sendSepaPaymentProcessing(sepaEmailData(session, `${siteUrl()}/orders`));
            } catch (emailError) {
              console.error('❌ Failed to send SEPA processing email:', emailError);
            }
          }
        } else {
          await enrollFromSession(session);
        }
      }
    }

    // SEPA Direct Debit settled: enroll the student
    if (event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.programId && customerEmail(session)) {
        const enrollmentId = await enrollFromSession(session);
        await recordProgramPayment(session, 'succeeded', enrollmentId);

        try {
          await emailService.sendEnrollmentConfirmation({
            recipientEmail: customerEmail(session)!,
            recipientName: session.customer_details?.name || 'Student',
            courseName: session.metadata.programTitle || 'your program',
            courseUrl: `${siteUrl()}/my-courses`,
            enrollmentDate: new Date(),
          });
        } catch (emailError) {
          console.error('❌ Failed to send enrollment email:', emailError);
        }
      }
    }

    // SEPA Direct Debit failed (e.g. insufficient funds): no enrollment is created
    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.programId && customerEmail(session)) {
        await recordProgramPayment(session, 'failed');

        try {
          const retryUrl = `${siteUrl()}/programs/${session.metadata.programSlug || ''}`;
          await emailService.sendSepaPaymentFailed(sepaEmailData(session, retryUrl));
        } catch (emailError) {
          console.error('❌ Failed to send SEPA failure email:', emailError);
        }
      }
    }

    // Disputes suspend program access; a won dispute (or closed inquiry) restores it
    if (event.type === 'charge.dispute.created' || event.type === 'charge.dispute.closed') {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntentId =
        typeof dispute.payment_intent === 'string' ? dispute.payment_intent : dispute.payment_intent?.id;

      if (paymentIntentId) {
        const enrollmentsSnap = await db
          .collection('enrollments')
          .where('stripePaymentIntentId', '==', paymentIntentId)
          .get();

        const restore =
          event.type === 'charge.dispute.closed' &&
          (dispute.status === 'won' || dispute.status === 'warning_closed');

        for (const enrollmentDoc of enrollmentsSnap.docs) {
          if (enrollmentDoc.data().status === 'refunded') continue;
          await enrollmentDoc.ref.update({
            status: restore ? 'active' : 'suspended',
            disputeStatus: dispute.status,
            updatedAt: new Date(),
          });
        }

        if (event.type === 'charge.dispute.created' && !enrollmentsSnap.empty) {
          const enrollment = enrollmentsSnap.docs[0].data();
          try {
            await emailService.sendDisputeNotification({
              adminEmail: process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@phillycultrue.com',
              customerEmail: enrollment.userEmail,
              programTitle: enrollment.programTitle || 'Program',
              amount: formatCurrency(dispute.amount / 100, dispute.currency, 2),
              reason: dispute.reason,
            });
          } catch (emailError) {
            console.error('❌ Failed to send dispute notification:', emailError);
          }
        }
      }
    }

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const metadata = paymentIntent.metadata;
      const userId = metadata?.userId;
      const items = metadata?.items ? JSON.parse(metadata.items) : [];
      
      if (!userId || !items.length) {
        console.log('ℹ️ Skipping payment_intent.succeeded without cart metadata');
      } else {
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