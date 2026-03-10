import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';
import { userProfileSchema } from '@/lib/validation';

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

// GET /api/v1/user/profile - Get current user profile
export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userDoc = await adminDb.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            uid: userDoc.id,
            ...userDoc.data()
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

// PATCH /api/v1/user/profile - Update current user profile
export async function PATCH(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        // Validate input
        const validatedData = userProfileSchema.parse(body);

        const userRef = adminDb.collection('users').doc(user.uid);
        
        await userRef.update({
            ...validatedData,
            updatedAt: new Date(),
        });

        const updated = await userRef.get();

        return NextResponse.json({
            success: true,
            user: {
                uid: updated.id,
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

        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
