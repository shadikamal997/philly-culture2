import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

/**
 * POST /api/user/get-role
 * Server-side role determination for new user registrations
 * Checks if email matches owner email (server-side secret)
 * 
 * Body: { uid: string, email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { uid, email } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'uid and email are required' },
        { status: 400 }
      );
    }

    // Verify the request is authenticated
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - missing token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the token and ensure it matches the requested uid
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      if (decodedToken.uid !== uid) {
        return NextResponse.json(
          { error: 'Unauthorized - token mismatch' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid token' },
        { status: 401 }
      );
    }

    // Check if user already has a role in Firestore
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const existingRole = userDoc.data()?.role;
      if (existingRole) {
        return NextResponse.json({ role: existingRole });
      }
    }

    // Server-side secret: Owner email never exposed to client
    const ownerEmail = process.env.OWNER_EMAIL;
    
    // Determine role based on email (server-side only)
    const role = (ownerEmail && email === ownerEmail) ? 'owner' : 'customer';

    return NextResponse.json({ role });
  } catch (error: any) {
    console.error('get-role error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
