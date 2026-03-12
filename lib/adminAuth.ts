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
  
  console.log('[adminAuth] Checking auth token...', {
    hasAuthHeader: !!authHeader,
    hasCookieToken: !!cookieToken,
    tokenLength: token?.length || 0,
  });
  
  if (!token) {
    console.error('[adminAuth] No token provided');
    throw new Error('Unauthorized: No auth token provided');
  }
  
  try {
    // Try verifying as ID token first, then session cookie
    let decodedToken;
    let userId: string;
    
    try {
      console.log('[adminAuth] Attempting to verify ID token...');
      decodedToken = await adminAuth.verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('[adminAuth] ID token verified successfully for user:', userId);
    } catch (idTokenError: any) {
      console.log('[adminAuth] ID token verification failed:', idTokenError.code, idTokenError.message);
      // If ID token fails, try session cookie
      try {
        console.log('[adminAuth] Attempting to verify session cookie...');
        decodedToken = await adminAuth.verifySessionCookie(token, true);
        userId = decodedToken.uid;
        console.log('[adminAuth] Session cookie verified successfully for user:', userId);
      } catch (sessionError: any) {
        console.error('[adminAuth] Both token verifications failed');
        console.error('[adminAuth] ID token error:', idTokenError.code, idTokenError.message);
        console.error('[adminAuth] Session error:', sessionError.code, sessionError.message);
        throw new Error('Unauthorized: Invalid or expired token');
      }
    }
    
    // Get user from Firestore to check role
    console.log('[adminAuth] Fetching user document for:', userId);
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('[adminAuth] User document not found for UID:', userId);
      throw new Error('Unauthorized: User not found');
    }
    
    const userData = userDoc.data();
    const userRole = userData?.role;
    console.log('[adminAuth] User role:', userRole);
    
    // Check if user has admin role
    if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'owner') {
      console.error('[adminAuth] User does not have admin role:', userRole);
      throw new Error('Forbidden: Admin access required');
    }
    
    console.log('[adminAuth] Authorization successful for:', userData?.email);
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
