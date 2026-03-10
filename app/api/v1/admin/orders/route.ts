import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { requireAdmin } from '@/lib/roleGuard';

export async function GET(req: NextRequest) {
    return requireAdmin(req, async () => {
        try {
            const { searchParams } = new URL(req.url);
            const status = searchParams.get('status');
            const limit = parseInt(searchParams.get('limit') || '50');

            let query = adminDb.collection('orders')
                .orderBy('createdAt', 'desc')
                .limit(limit);

            if (status) {
                query = query.where('status', '==', status) as any;
            }

            const snapshot = await query.get();

            const orders = snapshot.docs.map(doc => ({
                orderId: doc.id,
                ...doc.data()
            }));

            return NextResponse.json({ orders });
        } catch (error) {
            console.error('Error fetching orders:', error);
            return NextResponse.json(
                { error: 'Failed to fetch orders' },
                { status: 500 }
            );
        }
    });
}
