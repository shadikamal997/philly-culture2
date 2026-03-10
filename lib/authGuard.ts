import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

export async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized: Missing or invalid token');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Fetch detailed user document to enforce roles
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userData?.role || 'user',
        };
    } catch {
        throw new Error('Unauthorized: Token verification failed');
    }
}
