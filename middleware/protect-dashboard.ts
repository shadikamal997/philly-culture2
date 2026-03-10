import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/firebaseAdmin';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /dashboard, /dashboard/profile)
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password', '/verify-email'];
  const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for authentication token in cookies
  const token = request.cookies.get('__session')?.value;

  if (!token) {
    // No token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the token (this will throw if invalid)
    adminAuth.verifyIdToken(token);

    // Token is valid, allow access to dashboard
    return NextResponse.next();
  } catch (error) {
    // Token is invalid or expired, redirect to login
    console.error('Invalid token in dashboard middleware:', error);
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
