import { NextResponse } from 'next/server';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitTracker>();

/**
 * Basic in-memory IP rate limiter to defend against Brute Force & DDoS.
 * Limits requests per IP within a specified window (in ms).
 */
export function rateLimit(ip: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const key = ip || 'anonymous';
  
  const record = tracker.get(key);
  
  if (!record) {
    tracker.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, count: 1, reset: now + windowMs };
  }
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, count: 1, reset: now + windowMs };
  }
  
  record.count++;
  if (record.count > limit) {
    return { success: false, count: record.count, reset: record.resetTime };
  }
  
  return { success: true, count: record.count, reset: record.resetTime };
}

/**
 * Returns a 429 Too Many Requests response if rate limit is exceeded.
 */
export function rateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { 
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(resetTime)
      }
    }
  );
}
