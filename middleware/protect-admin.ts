import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /admin/overview, /admin/manage-courses)
  const path = request.nextUrl.pathname;

  // Check for authentication token in cookies
  const token = request.cookies.get('__session')?.value;

  if (!token) {
    // No token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the token and get user info
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user has admin role in Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // User doesn't exist in database
      console.error('User not found in database:', userId);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const userData = userDoc.data();
    const userRole = userData?.role;

    if (userRole !== 'admin') {
      // User is not an admin, redirect to dashboard
      console.error('User is not admin:', userId, 'Role:', userRole);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // User is authenticated and is admin, allow access
    return NextResponse.next();

  } catch (error) {
    // Token is invalid or error occurred
    console.error('Error in admin middleware:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
