import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

/**
 * POST /api/admin/set-role
 * Sets a user's role in Firestore by email.
 * Protected by ADMIN_SETUP_SECRET environment variable.
 *
 * Body: { email: string, role: string, secret: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, role, secret } = await request.json();

    // Verify the secret key
    const expectedSecret = process.env.ADMIN_SETUP_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email || !role) {
      return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
    }

    const allowedRoles = ['admin', 'superadmin', 'owner', 'customer'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Allowed: ${allowedRoles.join(', ')}` }, { status: 400 });
    }

    // Look up user by email using Firebase Admin Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    const uid = userRecord.uid;

    // Update the Firestore user document
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      // Create the document if it doesn't exist
      await userRef.set({
        uid,
        email,
        displayName: userRecord.displayName || email.split('@')[0],
        role,
        enrolledCourses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      await userRef.update({ role, updatedAt: new Date() });
    }

    return NextResponse.json({
      success: true,
      message: `Role "${role}" set for ${email} (uid: ${uid})`,
    });
  } catch (error: any) {
    console.error('set-role error:', error);
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: `No Firebase Auth user found for that email` }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
