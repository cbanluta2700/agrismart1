import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Define Redis client if it's provided in environment
let redis: Redis | undefined;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Rate limiter for standard requests (20 requests per day)
export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 d'),
      analytics: true,
      prefix: '@agrismart/ai-assistant',
    })
  : undefined;

// Anonymous rate limiter for unauthenticated requests (5 requests per day)
export const anonymousRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 d'),
      analytics: true,
      prefix: '@agrismart/ai-assistant-anonymous',
    })
  : undefined;

// Function to rate limit based on user ID
export async function rateLimitRequest(userId?: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}> {
  // Skip rate limiting if no Redis is configured
  if (!redis) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: Date.now(),
    };
  }

  try {
    // Use anonymous rate limit if no user is provided
    const limiter = userId ? ratelimit : anonymousRatelimit;
    
    if (!limiter) {
      return {
        success: true,
        limit: Infinity,
        remaining: Infinity,
        reset: Date.now(),
      };
    }

    // Use IP address for anonymous users, user ID for authenticated users
    const identifier = userId || 'anonymous';
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open if there's an error with the rate limiter
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: Date.now(),
      error: String(error),
    };
  }
}
