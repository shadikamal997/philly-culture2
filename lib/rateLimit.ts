/**
 * Simple in-memory rate limiter
 * For production, upgrade to Upstash Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly defaultLimit = 100; // requests
  private readonly defaultWindow = 60 * 1000; // 1 minute in ms

  /**
   * Check if request should be rate limited
   * @param identifier - IP address or user ID
   * @param limit - Max requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(
    identifier: string,
    limit: number = this.defaultLimit,
    windowMs: number = this.defaultWindow
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // No entry or window expired, create new entry
    if (!entry || now > entry.resetAt) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.limits.set(identifier, newEntry);
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: newEntry.resetAt,
      };
    }

    // Increment count
    entry.count += 1;

    // Check if over limit
    if (entry.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { limit: 20, window: 15 * 60 * 1000 }, // 20 per 15 minutes (was 5, too strict)
  REGISTER: { limit: 10, window: 60 * 60 * 1000 }, // 10 per hour
  
  // API endpoints
  API_READ: { limit: 100, window: 60 * 1000 }, // 100 per minute
  API_WRITE: { limit: 30, window: 60 * 1000 }, // 30 per minute
  
  // Checkout
  CHECKOUT: { limit: 5, window: 60 * 1000 }, // 5 per minute
  
  // Webhooks
  WEBHOOK: { limit: 1000, window: 60 * 1000 }, // 1000 per minute (Stripe can send many)
  
  // Default
  DEFAULT: { limit: 60, window: 60 * 1000 }, // 60 per minute
};

/**
 * Get client identifier (IP address or user ID)
 */
export function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Try to get IP from various headers
  const headers = req.headers;
  const ip = 
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown';
  
  return `ip:${ip}`;
}
