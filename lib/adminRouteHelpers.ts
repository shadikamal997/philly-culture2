/**
 * Admin API Route Utilities
 * Shared functions for admin route protection and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
import { verifyUser, AuthUser } from '@/lib/authHelpers';

interface RateLimitedRouteResult {
  allowed: boolean;
  response?: NextResponse;
  user?: AuthUser;
}

/**
 * Verify admin access with rate limiting
 * Use this at the start of admin API routes
 */
export async function verifyAdminAccess(req: NextRequest): Promise<RateLimitedRouteResult> {
  // 1. Apply rate limiting
  const identifier = getClientIdentifier(req);
  const rateLimit = rateLimiter.check(
    identifier,
    RATE_LIMITS.API_WRITE.limit,
    RATE_LIMITS.API_WRITE.window
  );

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return {
      allowed: false,
      response: NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          }
        }
      ),
    };
  }

  // 2. Verify user authentication
  const user = await verifyUser(req);

  if (!user) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // 3. Verify admin role
  const isAdmin = user.role === 'admin' || user.role === 'owner';
  
  if (!isAdmin) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    allowed: true,
    user,
  };
}

/**
 * Verify read API access with rate limiting
 * Use this for read-only public API routes
 */
export async function verifyReadAccess(req: NextRequest): Promise<RateLimitedRouteResult> {
  // Apply rate limiting
  const identifier = getClientIdentifier(req);
  const rateLimit = rateLimiter.check(
    identifier,
    RATE_LIMITS.API_READ.limit,
    RATE_LIMITS.API_READ.window
  );

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return {
      allowed: false,
      response: NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          }
        }
      ),
    };
  }

  return {
    allowed: true,
  };
}
