import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/firebaseAdmin';
import { rateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for login attempts
    const identifier = getClientIdentifier(request);
    const rateLimit = rateLimiter.check(
      identifier,
      RATE_LIMITS.LOGIN.limit,
      RATE_LIMITS.LOGIN.window
    );

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          }
        }
      );
    }

    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }

    // Verify the token to ensure it's valid
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log('✅ Token verified for user:', decodedToken.email);

    // Set the session cookie
    const response = NextResponse.json({ success: true });

    // Set HTTP-only cookie that expires in 14 days
    response.cookies.set('__session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: '/',
    });
    
    console.log('✅ Session cookie set successfully');

    return response;
  } catch (error) {
    console.error('❌ Error setting session:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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