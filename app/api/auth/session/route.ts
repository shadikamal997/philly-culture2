import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/firebaseAdmin';
import { rateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';

// 14 days in seconds
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }

    // Verify the ID token first (fast, no network call beyond Firebase)
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Only rate-limit AFTER verifying the token is valid
    // This prevents legitimate users from being locked out
    const identifier = getClientIdentifier(request);
    const rateLimit = rateLimiter.check(
      identifier,
      RATE_LIMITS.LOGIN.limit,
      RATE_LIMITS.LOGIN.window
    );

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      const minutes = Math.ceil(retryAfter / 60);
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${minutes} minute(s).`, retryAfter },
        { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
      );
    }

    console.log('✅ Token verified for user:', decodedToken.email);

    // Create a proper Firebase session cookie (long-lived, can be revoked)
    // This is better than storing the raw ID token which expires in 1 hour
    let sessionCookieValue: string;
    try {
      sessionCookieValue = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_MAX_AGE_SECONDS * 1000, // milliseconds
      });
    } catch (cookieError) {
      // Fallback: store the ID token directly if createSessionCookie fails
      console.warn('⚠️  createSessionCookie failed, falling back to ID token:', cookieError);
      sessionCookieValue = idToken;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('__session', sessionCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    console.log('✅ Session cookie set successfully for:', decodedToken.email);
    return response;
  } catch (error) {
    console.error('❌ Error in session route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Clear the session cookie on logout
  const response = NextResponse.json({ success: true });
  response.cookies.set('__session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}