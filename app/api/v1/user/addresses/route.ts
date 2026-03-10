import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';
import { addressSchema } from '@/lib/validation';

// Helper to verify auth token
async function getUserFromToken(req: NextRequest): Promise<{ uid: string } | null> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    
    try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        return { uid: decodedToken.uid };
    } catch {
        return null;
    }
}

// GET /api/v1/user/addresses - Get all addresses for current user
export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addressesSnapshot = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('addresses')
            .orderBy('isDefault', 'desc')
            .orderBy('createdAt', 'desc')
            .get();

        const addresses = addressesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ addresses });

    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}

// POST /api/v1/user/addresses - Create new address
export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        // Validate input
        const validatedData = addressSchema.parse(body);

        const userRef = adminDb.collection('users').doc(user.uid);
        const addressesRef = userRef.collection('addresses');

        // If this is set as default, unset other defaults
        if (validatedData.isDefault) {
            const existingAddresses = await addressesRef.where('isDefault', '==', true).get();
            const batch = adminDb.batch();
            existingAddresses.docs.forEach(doc => {
                batch.update(doc.ref, { isDefault: false });
            });
            await batch.commit();
        }

        const newAddress = await addressesRef.add({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const created = await newAddress.get();

        return NextResponse.json({
            success: true,
            address: {
                id: created.id,
                ...created.data()
            }
        }, { status: 201 });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error creating address:', error);
        return NextResponse.json(
            { error: 'Failed to create address' },
            { status: 500 }
        );
    }
}
