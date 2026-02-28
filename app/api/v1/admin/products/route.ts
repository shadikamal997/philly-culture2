import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { verifyAdmin } from '@/lib/adminGuard';

export async function POST(req: NextRequest) {
    try {
        const adminUser = await verifyAdmin(req);

        const data = await req.json();
        if (!data.name || !data.slug || data.price === undefined || data.stock === undefined) {
            return NextResponse.json({ error: 'Missing required fulfillment tracking fields' }, { status: 400 });
        }

        const newDoc = adminDb.collection('products').doc();
        await newDoc.set({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Push rigid audit log of internal DB modifications
        await adminDb.collection('auditLogs').add({
            action: 'product.created',
            actorId: adminUser.uid,
            actorRole: adminUser.role,
            targetId: newDoc.id,
            timestamp: new Date()
        });

        return NextResponse.json({ id: newDoc.id, success: true });
    } catch (error: any) {
        if (error.message.includes('Forbidden')) return NextResponse.json({ error: error.message }, { status: 403 });
        if (error.message.includes('Unauthorized')) return NextResponse.json({ error: error.message }, { status: 401 });

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
