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

// GET /api/v1/user/addresses/[addressId] - Get specific address
export async function GET(
    req: NextRequest,
    { params }: { params: { addressId: string } }
) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addressDoc = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('addresses')
            .doc(params.addressId)
            .get();

        if (!addressDoc.exists) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: addressDoc.id,
            ...addressDoc.data()
        });

    } catch (error) {
        console.error('Error fetching address:', error);
        return NextResponse.json(
            { error: 'Failed to fetch address' },
            { status: 500 }
        );
    }
}

// PUT /api/v1/user/addresses/[addressId] - Update address
export async function PUT(
    req: NextRequest,
    { params }: { params: { addressId: string } }
) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        // Validate input
        const validatedData = addressSchema.parse(body);

        const userRef = adminDb.collection('users').doc(user.uid);
        const addressRef = userRef.collection('addresses').doc(params.addressId);

        const addressDoc = await addressRef.get();
        if (!addressDoc.exists) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // If this is set as default, unset other defaults
        if (validatedData.isDefault) {
            const existingAddresses = await userRef
                .collection('addresses')
                .where('isDefault', '==', true)
                .get();
            
            const batch = adminDb.batch();
            existingAddresses.docs.forEach(doc => {
                if (doc.id !== params.addressId) {
                    batch.update(doc.ref, { isDefault: false });
                }
            });
            await batch.commit();
        }

        await addressRef.update({
            ...validatedData,
            updatedAt: new Date(),
        });

        const updated = await addressRef.get();

        return NextResponse.json({
            success: true,
            address: {
                id: updated.id,
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

        console.error('Error updating address:', error);
        return NextResponse.json(
            { error: 'Failed to update address' },
            { status: 500 }
        );
    }
}

// DELETE /api/v1/user/addresses/[addressId] - Delete address
export async function DELETE(
    req: NextRequest,
    { params }: { params: { addressId: string } }
) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addressRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('addresses')
            .doc(params.addressId);

        const addressDoc = await addressRef.get();
        if (!addressDoc.exists) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        await addressRef.delete();

        return NextResponse.json({ 
            success: true,
            message: 'Address deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json(
            { error: 'Failed to delete address' },
            { status: 500 }
        );
    }
}
