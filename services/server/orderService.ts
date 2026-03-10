import { adminDb } from '@/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { emailService } from '@/services/emailService';

export async function processOrderFulfillment(stripeEventId: string, orderId: string, customerId: string, lineItems: any[]) {
    // 1. Strict Idempotency check lock
    const eventRef = adminDb.collection("webhookEvents").doc(stripeEventId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
        return { success: true, message: 'Already processed' };
    }

    // 2. Mark event as processed immediately to prevent racing
    await eventRef.set({ processed: true, processedAt: FieldValue.serverTimestamp() });

    // 3. Initiate Atomic Fulfillment Transaction
    const orderRef = adminDb.collection('orders').doc(orderId);
    const userRef = adminDb.collection('users').doc(customerId);

    await adminDb.runTransaction(async (transaction) => {
        // Prepare read references to ensure isolation
        const stockReads: { ref: any, quantity: number }[] = [];
        const coursesToGrant: string[] = [];

        for (const item of lineItems) {
            if (item.type === 'product') {
                stockReads.push({
                    ref: adminDb.collection('products').doc(item.itemId),
                    quantity: item.quantity
                });
            } else if (item.type === 'course') {
                coursesToGrant.push(item.itemId);
            }
        }

        // Read Phase
        const productDocs = await Promise.all(stockReads.map(r => transaction.get(r.ref)));
        const userDoc = await transaction.get(userRef);

        // Validation Phase (Prevent overselling concurrently)
        productDocs.forEach((doc: any, idx) => {
            const currentStock = doc.data()?.stock || 0;
            const required = stockReads[idx].quantity;
            if (currentStock < required) {
                throw new Error(`Insufficient stock for product ${doc.id}`);
            }
        });

        // Write Phase (Deduct Stock & Grant Capabilities)
        productDocs.forEach((doc: any, idx) => {
            transaction.update(stockReads[idx].ref, {
                stock: (doc.data()?.stock || 0) - stockReads[idx].quantity
            });
        });

        if (coursesToGrant.length > 0) {
            const currentCourses = userDoc.data()?.purchasedCourses || [];
            const newCourses = Array.from(new Set([...currentCourses, ...coursesToGrant]));
            transaction.update(userRef, { purchasedCourses: newCourses });
        }

        transaction.update(orderRef, {
            status: 'paid',
            updatedAt: FieldValue.serverTimestamp()
        });
    });

    // 4. Send order confirmation email
    try {
        const orderDoc = await orderRef.get();
        const orderData = orderDoc.data();
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (orderData && userData) {
            await emailService.sendOrderConfirmation({
                recipientEmail: userData.email || orderData.userEmail,
                recipientName: userData.displayName || 'Valued Customer',
                orderId: orderData.orderId,
                orderDate: orderData.createdAt?.toDate() || new Date(),
                items: orderData.items.map((item: any) => ({
                    name: item.title,
                    quantity: item.quantity,
                    price: item.price,
                })),
                subtotal: orderData.subtotal,
                tax: orderData.taxAmount || 0,
                shipping: orderData.shippingCost || 0,
                total: orderData.total,
                shippingAddress: orderData.shippingAddress ? {
                    fullName: userData.displayName || 'Customer',
                    address: orderData.shippingAddress.street,
                    city: orderData.shippingAddress.city,
                    state: orderData.shippingAddress.state,
                    zipCode: orderData.shippingAddress.postalCode,
                } : {
                    fullName: userData.displayName || 'Customer',
                    address: 'Digital Product - No Shipping',
                    city: '-',
                    state: '-',
                    zipCode: '-',
                },
            });
            console.log(`✅ Order confirmation email sent to ${userData.email} for order ${orderId}`);
        }
    } catch (emailError) {
        console.error('❌ Failed to send order confirmation email:', emailError);
        // Don't fail the entire fulfillment for email errors
    }

    return { success: true };
}
