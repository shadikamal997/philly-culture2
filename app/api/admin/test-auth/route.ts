import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      hasAuthHeader: !!authHeader,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 20) + '...',
    };

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No token provided',
        diagnostics,
      }, { status: 401 });
    }

    try {
      // Try to verify the ID token
      const decodedToken = await adminAuth.verifyIdToken(token);
      diagnostics.tokenVerified = true;
      diagnostics.userId = decodedToken.uid;
      diagnostics.email = decodedToken.email;

      // Get user document
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return NextResponse.json({
          success: false,
          error: 'User document not found in Firestore',
          diagnostics,
        }, { status: 404 });
      }

      const userData = userDoc.data();
      diagnostics.userExists = true;
      diagnostics.role = userData?.role;
      diagnostics.emailInFirestore = userData?.email;

      // Check role
      const isAdmin = ['admin', 'superadmin', 'owner'].includes(userData?.role);
      diagnostics.isAdmin = isAdmin;

      return NextResponse.json({
        success: true,
        message: isAdmin ? '✅ Authentication successful! You have admin access.' : '❌ You do not have admin role',
        diagnostics,
      });

    } catch (verifyError: any) {
      diagnostics.verificationError = verifyError.code || verifyError.message;
      return NextResponse.json({
        success: false,
        error: 'Token verification failed',
        details: verifyError.message,
        diagnostics,
      }, { status: 401 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error.message,
    }, { status: 500 });
  }
}
