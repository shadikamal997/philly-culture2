import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

export interface AdminUser {
  uid: string;
  email: string;
  role: string;
}

/**
 * Verify admin access for server-side API routes
 * Throws error if not authorized
 */
export async function verifyAdminAccess(req: NextRequest): Promise<AdminUser> {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.get('Authorization');
  const cookieToken = req.cookies.get('__session')?.value;
  
  const token = authHeader?.replace('Bearer ', '') || cookieToken;
  
  if (!token) {
    throw new Error('Unauthorized: No auth token provided');
  }
  
  try {
    // Try verifying as ID token first, then session cookie
    let decodedToken;
    let userId: string;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (idTokenError) {
      // If ID token fails, try session cookie
      try {
        decodedToken = await adminAuth.verifySessionCookie(token, true);
        userId = decodedToken.uid;
      } catch (sessionError) {
        console.error('[adminAuth] Token verification failed:', idTokenError);
        throw new Error('Unauthorized: Invalid or expired token');
      }
    }
    
    // Get user from Firestore to check role
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('Unauthorized: User not found');
    }
    
    const userData = userDoc.data();
    const userRole = userData?.role;
    
    // Check if user has admin role
    if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'owner') {
      throw new Error('Forbidden: Admin access required');
    }
    
    return {
      uid: userId,
      email: decodedToken.email || userData?.email || 'unknown',
      role: userRole,
    };
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      throw error;
    }
    console.error('[adminAuth] Unexpected error:', error);
    throw new Error('Unauthorized: Authentication failed');
  }
}

/**
 * Create error response for unauthorized access
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create error response for forbidden access
 */
export function forbiddenResponse(message: string = 'Forbidden: Admin access required'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}
