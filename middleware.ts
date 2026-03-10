import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Middleware for protected routes
 * 
 * Note: This runs on Edge runtime and cannot use Firebase Admin SDK (Node.js only).
 * We check for the presence of a session token here, and the actual JWT verification
 * happens in the server components or API routes.
 * 
 * For production security:
 * - Server-side layouts verify tokens and roles using Firebase Admin
 * - All protected API routes verify tokens with Firebase Admin
 * - Client-side access is restricted by Firestore security rules
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('__session')?.value;
  
  console.log('🔵 Middleware check:', { pathname, hasToken: !!token });

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      console.log('⚠️  No token for admin route, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
  
  // Protect owner routes
  if (pathname.startsWith('/owner')) {
    if (!token) {
      console.log('⚠️  No token for owner route, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect dashboard routes (requires authentication)
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/my-courses') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/addresses') ||
      pathname.startsWith('/certificates')) {
    if (!token) {
      console.log('⚠️  No token for protected route, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/owner/:path*',
    '/dashboard/:path*',
    '/my-courses/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/addresses/:path*',
    '/certificates/:path*',
  ],
};
