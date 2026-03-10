import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { updateOrderStatusSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/roleGuard';

// PATCH /api/v1/admin/orders/[orderId]/status - Update order status
export async function PATCH(
    req: NextRequest,
    { params }: { params: { orderId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const body = await req.json();
            
            // Validate input
            const validatedData = updateOrderStatusSchema.parse({
                orderId: params.orderId,
                ...body
            });

            const orderRef = adminDb.collection('orders').doc(params.orderId);
            const orderDoc = await orderRef.get();

            if (!orderDoc.exists) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            const updateData: any = {
                status: validatedData.status,
                updatedAt: new Date(),
            };

            // If marking as shipped, require tracking number
            if (validatedData.status === 'shipped') {
                if (!validatedData.trackingNumber) {
                    return NextResponse.json(
                        { error: 'Tracking number is required when marking order as shipped' },
                        { status: 400 }
                    );
                }
                updateData.trackingNumber = validatedData.trackingNumber;
            }

            await orderRef.update(updateData);

            const updated = await orderRef.get();

            return NextResponse.json({
                success: true,
                order: {
                    orderId: updated.id,
                    ...updated.data()
                }
            });

        } catch (error: any) {
            if (error.name === 'ZodError') {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }

            console.error('Error updating order status:', error);
            return NextResponse.json(
                { error: 'Failed to update order status' },
                { status: 500 }
            );
        }
    });
}
