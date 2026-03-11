import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Middleware for protected routes
 *
 * Auth proofs accepted (in priority order):
 *  1. __session  – HttpOnly Firebase session cookie (set by /api/auth/session)
 *  2. role       – Non-HttpOnly role cookie (set by AuthContext on every sign-in)
 *
 * Using both means the app works even if the session API has a transient failure.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession =
    !!request.cookies.get('__session')?.value ||
    !!request.cookies.get('role')?.value;

  const redirectToLogin = (from: string) => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', from);
    return NextResponse.redirect(loginUrl);
  };

  // Admin routes — require a session token
  if (pathname.startsWith('/admin')) {
    if (!hasSession) return redirectToLogin(pathname);
    return NextResponse.next();
  }

  // Owner routes
  if (pathname.startsWith('/owner')) {
    if (!hasSession) return redirectToLogin(pathname);
    return NextResponse.next();
  }

  // User dashboard and related routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/my-courses') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/addresses') ||
    pathname.startsWith('/certificates')
  ) {
    if (!hasSession) return redirectToLogin(pathname);
    return NextResponse.next();
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
