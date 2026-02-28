import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { verifyAdmin } from '@/lib/adminGuard';

export async function GET(req: NextRequest) {
    try {
        await verifyAdmin(req);

        // Strict pagination and limits protecting against aggressive internal DB scans
        const snapshot = await adminDb.collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ data: orders });
    } catch (error: any) {
        if (error.message.includes('Forbidden')) return NextResponse.json({ error: error.message }, { status: 403 });
        if (error.message.includes('Unauthorized')) return NextResponse.json({ error: error.message }, { status: 401 });

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
