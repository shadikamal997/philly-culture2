import { NextResponse } from 'next/server';
import { adminAuth as auth, adminDb as db } from '@/firebase/firebaseAdmin';

/**
 * Verify that the requester is the owner
 */
async function verifyOwner(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    if (userData?.role !== 'owner') {
      return null;
    }

    return { uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    console.error('Error verifying owner:', error);
    return null;
  }
}

/**
 * POST /api/assistants
 * Add a user as an assistant (Owner only)
 */
export async function POST(req: Request) {
  try {
    const owner = await verifyOwner(req);

    if (!owner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only owners can add assistants.' },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get user by email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'No user found with this email. They must register first.' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Check if user is already owner
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot add owner as assistant' },
        { status: 400 }
      );
    }

    if (userData?.role === 'assistant') {
      return NextResponse.json(
        { error: 'User is already an assistant' },
        { status: 400 }
      );
    }

    // Update user role to assistant
    await db.collection('users').doc(userRecord.uid).update({
      role: 'assistant',
      createdBy: owner.uid,
      updatedAt: new Date(),
    });

    // Create audit log
    await db.collection('auditLogs').add({
      action: 'ADD_ASSISTANT',
      performedBy: owner.uid,
      performedByEmail: owner.email,
      targetUserId: userRecord.uid,
      targetUserEmail: email,
      timestamp: new Date(),
      details: {
        previousRole: userData?.role || 'customer',
        newRole: 'assistant',
      },
    });

    // Assistant added successfully

    return NextResponse.json({
      success: true,
      message: `${email} is now an assistant`,
    });
  } catch (error) {
    console.error('Error adding assistant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assistants
 * Remove assistant role from a user (Owner only)
 */
export async function DELETE(req: Request) {
  try {
    const owner = await verifyOwner(req);

    if (!owner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only owners can remove assistants.' },
        { status: 403 }
      );
    }

    const { uid } = await req.json();

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user data
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    if (userData?.role !== 'assistant') {
      return NextResponse.json(
        { error: 'User is not an assistant' },
        { status: 400 }
      );
    }

    // Revert to customer role
    await db.collection('users').doc(uid).update({
      role: 'customer',
      updatedAt: new Date(),
    });

    // Create audit log
    await db.collection('auditLogs').add({
      action: 'REMOVE_ASSISTANT',
      performedBy: owner.uid,
      performedByEmail: owner.email,
      targetUserId: uid,
      targetUserEmail: userData?.email || 'Unknown',
      timestamp: new Date(),
      details: {
        previousRole: 'assistant',
        newRole: 'customer',
      },
    });

    // Assistant removed successfully

    return NextResponse.json({
      success: true,
      message: 'Assistant role removed',
    });
  } catch (error) {
    console.error('Error removing assistant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
