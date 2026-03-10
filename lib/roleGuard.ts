import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

/**
 * Server-side role verification for API routes
 * Verifies Firebase Auth token AND checks Firestore role
 */
export async function verifyAdminRole(request: NextRequest): Promise<{ uid: string; email: string | undefined } | null> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Verify Firebase ID token
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Fetch user document from Firestore to check role
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        // Verify admin role
        if (!userData || userData.role !== 'admin') {
            console.warn(`🚫 Unauthorized admin access attempt by user: ${decodedToken.uid}`);
            return null;
        }

        return {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
    } catch (error) {
        console.error('Admin token verification failed:', error);
        return null;
    }
}

/**
 * Middleware wrapper for admin-only API routes
 */
export async function requireAdmin(
    request: NextRequest,
    handler: (req: NextRequest, adminUser: { uid: string; email: string | undefined }) => Promise<NextResponse>
): Promise<NextResponse> {
    const adminUser = await verifyAdminRole(request);

    if (!adminUser) {
        return NextResponse.json(
            { error: 'Forbidden: Admin access required' },
            { status: 403 }
        );
    }

    return handler(request, adminUser);
}

