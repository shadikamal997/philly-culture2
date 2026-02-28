import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { verifyAdmin } from '@/lib/adminGuard';

export async function POST(req: NextRequest) {
    try {
        await verifyAdmin(req);

        const data = await req.json();
        if (!data.title || !data.slug || !data.price) {
            return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
        }

        const newDoc = adminDb.collection('courses').doc();
        await newDoc.set({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({ id: newDoc.id, success: true });
    } catch (error: any) {
        if (error.message.includes('Forbidden')) return NextResponse.json({ error: error.message }, { status: 403 });
        if (error.message.includes('Unauthorized')) return NextResponse.json({ error: error.message }, { status: 401 });

        console.error("Admin Course API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
