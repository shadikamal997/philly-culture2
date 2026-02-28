import { adminDb } from '@/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

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
            const currentCourses = userDoc.data()?.enrolledCourses || [];
            const newCourses = Array.from(new Set([...currentCourses, ...coursesToGrant]));
            transaction.update(userRef, { enrolledCourses: newCourses });
        }

        transaction.update(orderRef, {
            status: 'paid',
            updatedAt: FieldValue.serverTimestamp()
        });
    });

    return { success: true };
}
